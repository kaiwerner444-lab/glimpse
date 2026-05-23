"use client";

import {
  FilesetResolver,
  HandLandmarker,
  type HandLandmarkerResult,
} from "@mediapipe/tasks-vision";

let landmarker: HandLandmarker | null = null;
let initializing: Promise<HandLandmarker> | null = null;

const WASM_BASE =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.17/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

async function ensureHandLandmarker(): Promise<HandLandmarker> {
  if (landmarker) return landmarker;
  if (initializing) return initializing;
  initializing = (async () => {
    const fileset = await FilesetResolver.forVisionTasks(WASM_BASE);
    const model = await HandLandmarker.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath: MODEL_URL,
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numHands: 2,
      // Looser detection thresholds so the model picks up the hand
      // even when it's partially out of frame or at an angle (common
      // for self-cam finger-tap tasks).
      minHandDetectionConfidence: 0.4,
      minHandPresenceConfidence: 0.4,
      minTrackingConfidence: 0.4,
    });
    landmarker = model;
    return model;
  })();
  return initializing;
}

export interface HandFrameFeatures {
  // Distance between thumb tip (4) and index tip (8), normalized to hand size.
  // Lower = pinched together.
  pinchDistance: number;
  thumbIndexClosed: boolean;
}

// Hysteresis pair: must drop below the closed threshold to register a
// pinch, must rise above the open threshold to be considered released.
// Prevents jitter near a single threshold from double-counting or
// missing taps. Values widened from the original 0.08 single threshold
// so faster real-world taps land cleanly.
const PINCH_CLOSED_THRESHOLD = 0.16;
const PINCH_OPEN_THRESHOLD = 0.26;

// Per-hand last-known state. The hysteresis state machine reads this to
// decide whether the current frame is a transition.
const lastState = new Map<number, "open" | "closed" | "unknown">();

export async function detectHandFeatures(
  video: HTMLVideoElement,
  tsMs: number,
  handIndex = 0,
): Promise<HandFrameFeatures | null> {
  const lm = await ensureHandLandmarker();
  if (video.readyState < 2) return null;
  const result: HandLandmarkerResult = lm.detectForVideo(video, tsMs);
  if (!result.landmarks || result.landmarks.length <= handIndex) return null;
  const pts = result.landmarks[handIndex];
  const thumb = pts[4];
  const index = pts[8];
  const wrist = pts[0];
  const middleMcp = pts[9];

  const handSpan = Math.hypot(
    middleMcp.x - wrist.x,
    middleMcp.y - wrist.y,
    (middleMcp.z ?? 0) - (wrist.z ?? 0),
  );
  const dist = Math.hypot(
    thumb.x - index.x,
    thumb.y - index.y,
    (thumb.z ?? 0) - (index.z ?? 0),
  );
  const pinchDistance = handSpan > 0 ? dist / handSpan : dist;

  // Hysteresis state machine — only flip when we cross the right edge.
  const prev = lastState.get(handIndex) ?? "unknown";
  let next: "open" | "closed";
  if (prev === "closed") {
    next = pinchDistance > PINCH_OPEN_THRESHOLD ? "open" : "closed";
  } else {
    next = pinchDistance < PINCH_CLOSED_THRESHOLD ? "closed" : "open";
  }
  lastState.set(handIndex, next);

  return {
    pinchDistance,
    thumbIndexClosed: next === "closed",
  };
}

export function resetHandState() {
  lastState.clear();
}

export function disposeHandLandmarker() {
  if (landmarker) {
    landmarker.close();
    landmarker = null;
  }
  initializing = null;
}
