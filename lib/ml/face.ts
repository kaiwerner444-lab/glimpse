// Face Mesh feature extraction via MediaPipe Tasks Vision.
//
// Loads the model lazily and exposes a per-frame inference loop that
// computes facial symmetry, blink rate, and a basic expression vector.
// Everything runs client-side in WebAssembly — no video leaves the
// browser at this stage.
//
// Spec note: features computed here are inputs to longitudinal drift
// detection, not diagnostic outputs. They never label a face as "having"
// a condition; they describe what is seen.

"use client";

import {
  FilesetResolver,
  FaceLandmarker,
  type FaceLandmarkerResult,
} from "@mediapipe/tasks-vision";

let landmarker: FaceLandmarker | null = null;
let initializing: Promise<FaceLandmarker> | null = null;

const WASM_BASE =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.17/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

async function ensureFaceLandmarker(): Promise<FaceLandmarker> {
  if (landmarker) return landmarker;
  if (initializing) return initializing;
  initializing = (async () => {
    const fileset = await FilesetResolver.forVisionTasks(WASM_BASE);
    const model = await FaceLandmarker.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath: MODEL_URL,
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      outputFaceBlendshapes: true,
      outputFacialTransformationMatrixes: false,
      numFaces: 1,
    });
    landmarker = model;
    return model;
  })();
  return initializing;
}

export interface FaceFrameFeatures {
  // Higher = more symmetric. 100 = perfect L/R mirror across the face midline.
  symmetryPercent: number;
  // Blendshape-driven snapshots.
  smileLeft: number;
  smileRight: number;
  browLeft: number;
  browRight: number;
  eyeBlinkLeft: number;
  eyeBlinkRight: number;
  // True when both eyes are mostly closed in this frame.
  blinking: boolean;
}

const PAIRS_FOR_SYMMETRY: Array<[number, number]> = [
  // Eye corners
  [33, 263],
  [133, 362],
  // Eyebrow tips
  [70, 300],
  [105, 334],
  // Cheeks
  [50, 280],
  [216, 436],
  // Mouth corners
  [61, 291],
  // Jawline
  [172, 397],
  [136, 365],
  // Nose wings
  [218, 438],
];

const MIDLINE_INDICES = [10, 151, 152, 168, 8];

export async function detectFaceFeatures(
  video: HTMLVideoElement,
  tsMs: number,
): Promise<FaceFrameFeatures | null> {
  const lm = await ensureFaceLandmarker();
  if (video.readyState < 2) return null;
  const result: FaceLandmarkerResult = lm.detectForVideo(video, tsMs);
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return null;
  const lms = result.faceLandmarks[0];

  // Estimate the vertical midline as the mean x of canonical centerline points.
  const midX =
    MIDLINE_INDICES.reduce((acc, idx) => acc + lms[idx].x, 0) /
    MIDLINE_INDICES.length;

  // Symmetry: average normalized horizontal distance between mirrored pairs
  // after reflecting one side around the midline.
  let sumErr = 0;
  for (const [l, r] of PAIRS_FOR_SYMMETRY) {
    const left = lms[l];
    const right = lms[r];
    const reflected = 2 * midX - right.x;
    const dx = Math.abs(left.x - reflected);
    const dy = Math.abs(left.y - right.y);
    sumErr += dx + dy * 0.5;
  }
  const meanErr = sumErr / PAIRS_FOR_SYMMETRY.length;
  const symmetryPercent = Math.max(
    0,
    Math.min(100, 100 - meanErr * 250),
  );

  const blends = result.faceBlendshapes?.[0]?.categories ?? [];
  const get = (name: string) =>
    blends.find((c) => c.categoryName === name)?.score ?? 0;

  return {
    symmetryPercent,
    smileLeft: get("mouthSmileLeft"),
    smileRight: get("mouthSmileRight"),
    browLeft: get("browOuterUpLeft"),
    browRight: get("browOuterUpRight"),
    eyeBlinkLeft: get("eyeBlinkLeft"),
    eyeBlinkRight: get("eyeBlinkRight"),
    blinking: get("eyeBlinkLeft") > 0.5 && get("eyeBlinkRight") > 0.5,
  };
}

export function disposeFaceLandmarker() {
  if (landmarker) {
    landmarker.close();
    landmarker = null;
  }
  initializing = null;
}
