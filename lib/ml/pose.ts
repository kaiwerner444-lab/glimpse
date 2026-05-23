"use client";

import {
  FilesetResolver,
  PoseLandmarker,
  type PoseLandmarkerResult,
} from "@mediapipe/tasks-vision";

let landmarker: PoseLandmarker | null = null;
let initializing: Promise<PoseLandmarker> | null = null;

const WASM_BASE =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.17/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

async function ensurePoseLandmarker(): Promise<PoseLandmarker> {
  if (landmarker) return landmarker;
  if (initializing) return initializing;
  initializing = (async () => {
    const fileset = await FilesetResolver.forVisionTasks(WASM_BASE);
    const model = await PoseLandmarker.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath: MODEL_URL,
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numPoses: 1,
    });
    landmarker = model;
    return model;
  })();
  return initializing;
}

export interface PoseFrameFeatures {
  // Horizontal drift (left vs right shoulder) — relevant for arm hold.
  shoulderDriftPercent: number;
  // Vertical hip displacement vs the running mean — proxy for sway.
  hipDeltaY: number;
  // Wrist positions normalized so other code can detect "arms up" etc.
  leftWristY: number;
  rightWristY: number;
}

let hipMeanY = 0;
let hipFrames = 0;

export async function detectPoseFeatures(
  video: HTMLVideoElement,
  tsMs: number,
): Promise<PoseFrameFeatures | null> {
  const lm = await ensurePoseLandmarker();
  if (video.readyState < 2) return null;
  const result: PoseLandmarkerResult = lm.detectForVideo(video, tsMs);
  if (!result.landmarks || result.landmarks.length === 0) return null;
  const pts = result.landmarks[0];

  const lShoulder = pts[11];
  const rShoulder = pts[12];
  const lHip = pts[23];
  const rHip = pts[24];
  const lWrist = pts[15];
  const rWrist = pts[16];

  const shoulderDelta = Math.abs(lShoulder.y - rShoulder.y);
  const shoulderDriftPercent = Math.min(100, shoulderDelta * 200);

  const hipY = (lHip.y + rHip.y) / 2;
  hipFrames += 1;
  hipMeanY = hipMeanY + (hipY - hipMeanY) / hipFrames;
  const hipDeltaY = hipY - hipMeanY;

  return {
    shoulderDriftPercent,
    hipDeltaY,
    leftWristY: lWrist.y,
    rightWristY: rWrist.y,
  };
}

export function resetPoseState() {
  hipMeanY = 0;
  hipFrames = 0;
}

export function disposePoseLandmarker() {
  if (landmarker) {
    landmarker.close();
    landmarker = null;
  }
  initializing = null;
}
