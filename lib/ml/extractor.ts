// Per-task feature extractor. Decides which detector(s) to run based on
// the task kind, accumulates derived features over the task duration,
// and produces a single TaskFeatures payload at the end. These payloads
// are what land in the database (table: session_task_features) and feed
// the longitudinal drift detection in v2.

"use client";

import type { Task } from "@/lib/session/types";
import { detectFaceFeatures } from "./face";
import { detectPoseFeatures, resetPoseState } from "./pose";
import { detectHandFeatures } from "./hand";
import { AudioFeatureExtractor } from "./audio";

export interface TaskFeatures {
  taskId: string;
  // Face
  meanSymmetryPercent?: number;
  symmetryVariation?: number;
  blinkCount?: number;
  smileAmplitude?: number;
  // Pose
  meanShoulderDriftPercent?: number;
  postureSwayCm?: number;
  // Hand
  tapCount?: number;
  meanInterTapMs?: number;
  // Audio
  meanPitchHz?: number;
  pitchVariationHz?: number;
  voicedRatio?: number;
  // House-keeping
  framesAnalysed: number;
  startedAt: string;
  endedAt: string;
}

export interface TaskExtractorCallbacks {
  // Fired once per detected thumb-index pinch (rising edge). The session
  // shell uses this to drive the on-screen tap counter for finger-tap tasks.
  onTap?: () => void;
}

export class TaskExtractor {
  private task: Task;
  private video: HTMLVideoElement;
  private callbacks: TaskExtractorCallbacks;
  private startedAt = new Date().toISOString();
  private stopFlag = false;

  // Face accumulators
  private symmetrySamples: number[] = [];
  private smileSamples: number[] = [];
  private wasBlinking = false;
  private blinkCount = 0;

  // Pose accumulators
  private shoulderSamples: number[] = [];
  private hipDeltaSamples: number[] = [];

  // Hand / finger-tap accumulators
  private wasClosed = false;
  private tapCount = 0;
  private tapTimestamps: number[] = [];

  // Audio
  private audio = new AudioFeatureExtractor();
  private framesAnalysed = 0;

  constructor(
    task: Task,
    video: HTMLVideoElement,
    audioStream?: MediaStream,
    callbacks: TaskExtractorCallbacks = {},
  ) {
    this.task = task;
    this.video = video;
    this.callbacks = callbacks;
    resetPoseState();
    if (audioStream && this.needsAudio()) {
      this.audio.attach(audioStream);
      this.audio.resetSession();
    }
  }

  private needsFace(): boolean {
    return this.task.phase === "visual";
  }
  private needsPose(): boolean {
    return this.task.phase === "movement";
  }
  private needsHand(): boolean {
    return this.task.kind === "finger_tap";
  }
  private needsAudio(): boolean {
    return this.task.modality === "audio" || this.task.modality === "both";
  }

  async run(): Promise<void> {
    const loop = async () => {
      if (this.stopFlag) return;
      const ts = performance.now();
      try {
        if (this.needsFace()) {
          const f = await detectFaceFeatures(this.video, ts);
          if (f) {
            this.symmetrySamples.push(f.symmetryPercent);
            this.smileSamples.push((f.smileLeft + f.smileRight) / 2);
            if (f.blinking && !this.wasBlinking) this.blinkCount += 1;
            this.wasBlinking = f.blinking;
          }
        }
        if (this.needsPose()) {
          const p = await detectPoseFeatures(this.video, ts);
          if (p) {
            this.shoulderSamples.push(p.shoulderDriftPercent);
            this.hipDeltaSamples.push(Math.abs(p.hipDeltaY));
          }
        }
        if (this.needsHand()) {
          const h = await detectHandFeatures(this.video, ts);
          if (h) {
            if (h.thumbIndexClosed && !this.wasClosed) {
              this.tapCount += 1;
              this.tapTimestamps.push(ts);
              this.callbacks.onTap?.();
            }
            this.wasClosed = h.thumbIndexClosed;
          }
        }
        if (this.needsAudio()) {
          this.audio.read();
        }
        this.framesAnalysed += 1;
      } catch {
        // A single failed frame should not kill the loop. Drop and continue.
      }
      requestAnimationFrame(() => void loop());
    };
    loop();
  }

  stop(): TaskFeatures {
    this.stopFlag = true;
    const audioSummary = this.needsAudio() ? this.audio.summary() : null;
    this.audio.detach();

    const result: TaskFeatures = {
      taskId: this.task.id,
      framesAnalysed: this.framesAnalysed,
      startedAt: this.startedAt,
      endedAt: new Date().toISOString(),
    };

    if (this.symmetrySamples.length) {
      const mean = avg(this.symmetrySamples);
      result.meanSymmetryPercent = round(mean, 1);
      result.symmetryVariation = round(stddev(this.symmetrySamples, mean), 2);
      result.blinkCount = this.blinkCount;
      result.smileAmplitude = round(Math.max(...this.smileSamples, 0), 3);
    }
    if (this.shoulderSamples.length) {
      result.meanShoulderDriftPercent = round(avg(this.shoulderSamples), 2);
      // Map normalized hip displacement to a rough cm estimate (~50cm framing).
      result.postureSwayCm = round(avg(this.hipDeltaSamples) * 50, 2);
    }
    if (this.tapCount) {
      result.tapCount = this.tapCount;
      if (this.tapTimestamps.length > 1) {
        const intervals: number[] = [];
        for (let i = 1; i < this.tapTimestamps.length; i += 1) {
          intervals.push(this.tapTimestamps[i] - this.tapTimestamps[i - 1]);
        }
        result.meanInterTapMs = round(avg(intervals), 1);
      }
    }
    if (audioSummary) {
      result.meanPitchHz = audioSummary.meanPitchHz
        ? round(audioSummary.meanPitchHz, 1)
        : undefined;
      result.pitchVariationHz = audioSummary.pitchVariationHz
        ? round(audioSummary.pitchVariationHz, 1)
        : undefined;
      result.voicedRatio = round(audioSummary.voicedRatio, 3);
    }
    return result;
  }
}

function avg(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
function stddev(arr: number[], mean: number): number {
  const v = arr.reduce((acc, x) => acc + (x - mean) ** 2, 0) / arr.length;
  return Math.sqrt(v);
}
function round(n: number, places: number): number {
  const f = 10 ** places;
  return Math.round(n * f) / f;
}
