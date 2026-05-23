// Client-side audio feature extraction using the Web Audio API.
// Computes lightweight prosody features (energy, pitch via autocorrelation,
// voice-activity ratio) on a rolling window. These are real signals —
// they're just less precise than server-side Praat / parselmouth pipelines,
// which is the v2 swap-in.

"use client";

export interface AudioFrameFeatures {
  // Short-time signal power, 0..1.
  energy: number;
  // Estimated fundamental frequency in Hz, or null when no voice.
  pitchHz: number | null;
  voiced: boolean;
}

export interface AudioSessionSummary {
  meanPitchHz: number | null;
  pitchVariationHz: number | null;
  voicedRatio: number; // fraction of frames classified voiced
  framesSampled: number;
}

export class AudioFeatureExtractor {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private buffer: Float32Array = new Float32Array(2048);
  private voicedFrames = 0;
  private totalFrames = 0;
  private pitchSamples: number[] = [];

  attach(stream: MediaStream) {
    if (this.ctx) return;
    this.ctx = new AudioContext();
    // Chrome can return a suspended context if the page hasn't received
    // a user gesture yet; the SessionRunner mount IS triggered by one
    // (clicking 'Begin session') but the resume is still required on
    // some browsers, so we ask explicitly.
    if (this.ctx.state === "suspended") {
      void this.ctx.resume();
    }
    this.source = this.ctx.createMediaStreamSource(stream);
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.source.connect(this.analyser);
  }

  detach() {
    this.source?.disconnect();
    this.analyser?.disconnect();
    void this.ctx?.close();
    this.source = null;
    this.analyser = null;
    this.ctx = null;
  }

  resetSession() {
    this.voicedFrames = 0;
    this.totalFrames = 0;
    this.pitchSamples = [];
  }

  read(): AudioFrameFeatures | null {
    if (!this.analyser || !this.ctx) return null;
    this.analyser.getFloatTimeDomainData(this.buffer);
    const energy = rms(this.buffer);
    // Looser energy floor — a normal speaking voice at arm's length
    // through a built-in laptop mic often sits around 0.008-0.015 RMS.
    // The old 0.02 threshold ignored most of it.
    const pitchHz =
      energy > 0.006 ? autocorrelatePitch(this.buffer, this.ctx.sampleRate) : null;
    const voiced = pitchHz !== null && pitchHz > 70 && pitchHz < 400;

    this.totalFrames += 1;
    if (voiced) {
      this.voicedFrames += 1;
      if (pitchHz !== null) this.pitchSamples.push(pitchHz);
    }
    return { energy, pitchHz, voiced };
  }

  summary(): AudioSessionSummary {
    const samples = this.pitchSamples;
    const meanPitchHz =
      samples.length > 0
        ? samples.reduce((a, b) => a + b, 0) / samples.length
        : null;
    let pitchVariationHz: number | null = null;
    if (meanPitchHz !== null && samples.length > 1) {
      const variance =
        samples.reduce((acc, v) => acc + (v - meanPitchHz) ** 2, 0) /
        samples.length;
      pitchVariationHz = Math.sqrt(variance);
    }
    return {
      meanPitchHz,
      pitchVariationHz,
      voicedRatio: this.totalFrames > 0 ? this.voicedFrames / this.totalFrames : 0,
      framesSampled: this.totalFrames,
    };
  }
}

function rms(buf: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < buf.length; i += 1) sum += buf[i] * buf[i];
  return Math.sqrt(sum / buf.length);
}

// Time-domain autocorrelation with parabolic interpolation. Light enough
// to run every frame on a modest laptop CPU and gives a reasonable pitch
// estimate for sustained voiced speech.
function autocorrelatePitch(buf: Float32Array, sampleRate: number): number | null {
  const SIZE = buf.length;
  let bestOffset = -1;
  let bestCorr = 0;
  let rmsValue = 0;
  for (let i = 0; i < SIZE; i += 1) rmsValue += buf[i] * buf[i];
  rmsValue = Math.sqrt(rmsValue / SIZE);
  if (rmsValue < 0.01) return null;

  let lastCorr = 1;
  for (let offset = 32; offset < 1024; offset += 1) {
    let corr = 0;
    for (let i = 0; i < SIZE - offset; i += 1) {
      corr += buf[i] * buf[i + offset];
    }
    corr = corr / (SIZE - offset);
    if (corr > 0.5 && corr > lastCorr) {
      if (corr > bestCorr) {
        bestCorr = corr;
        bestOffset = offset;
      }
    } else if (bestCorr) {
      break;
    }
    lastCorr = corr;
  }
  // Slightly more permissive correlation floor so quieter, less periodic
  // speech still registers as voiced.
  if (bestOffset === -1 || bestCorr < 0.3) return null;
  return sampleRate / bestOffset;
}
