// Per-task scoring. Translates captured features + interaction state
// into a 0-100 score with a one-line explanatory note, so the user can
// read through their session history and see how each task went.
//
// These are deliberately soft heuristics — clinically the score has no
// meaning, it's purely an affordance for the user to see "how did I do
// today vs last week." The bands and weights live here so they're easy
// to audit and tune.

import type { Task, TaskResult } from "./types";
import type { TaskFeatures } from "@/lib/ml/extractor";
import type { EducationLevel } from "@/lib/types";

export interface TaskScore {
  score: number;
  note: string;
}

interface ScoreInputs {
  task: Task;
  result: TaskResult;
  features?: TaskFeatures;
  // Education modifies cognitive-norm interpretation (MoCA, Trail
  // Making, MMSE all adjust by years of education). We translate that
  // into a small score multiplier so highly-educated users have to
  // perform proportionally better to hit the same band, and vice versa.
  educationLevel?: EducationLevel;
}

// Education multiplier — higher education raises the bar slightly.
// Numbers derived loosely from standard MoCA education-adjustment rules.
function educationMultiplier(level?: EducationLevel): number {
  switch (level) {
    case "graduate":
      return 0.92;
    case "bachelor":
      return 0.96;
    case "some_college":
      return 1.0;
    case "high_school":
      return 1.04;
    case "less_than_high_school":
      return 1.08;
    default:
      return 1.0;
  }
}

export function scoreTask({
  task,
  result,
  features,
  educationLevel,
}: ScoreInputs): TaskScore {
  const adj = educationMultiplier(educationLevel);
  const apply = (s: TaskScore): TaskScore => {
    // Only adjust cognitive-loading tasks. Acoustic / movement tasks
    // are interpreted on their own scale.
    const cognitive = ["digit_span", "stroop", "trail_making", "verbal_fluency"];
    if (!cognitive.includes(task.kind)) return s;
    return { score: Math.max(0, Math.min(100, Math.round(s.score * adj))), note: s.note };
  };

  switch (task.kind) {
    case "instruction":
      return apply(scoreInstruction(task, features));
    case "read_passage":
      return apply(scoreSpeechTask(result, features, "passage"));
    case "open_prompt":
      return apply(scoreSpeechTask(result, features, "prompt"));
    case "verbal_fluency":
      return apply(scoreFluency(result));
    case "countdown_math":
      return apply(scoreSpeechTask(result, features, "math"));
    case "diadochokinesis":
      return apply(scoreDiadochokinesis(features));
    case "smooth_pursuit":
      return apply({ score: completedScore(result), note: "Smooth-pursuit completed." });
    case "finger_tap":
      return apply(scoreFingerTap(features));
    case "digit_span":
      return apply(scoreDigitSpan(result));
    case "stroop":
      return apply(scoreStroop(result));
    case "trail_making":
      return apply(scoreTrailMaking(result));
    case "spiral_drawing":
      return apply(scoreSpiral(result));
  }
}

function completedScore(result: TaskResult): number {
  return result.skipped ? 30 : 85;
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function scoreInstruction(_task: Task, features?: TaskFeatures): TaskScore {
  // For passive video tasks we lean on facial symmetry / postural sway
  // if they're present; otherwise just give credit for completion.
  if (typeof features?.meanSymmetryPercent === "number") {
    const s = clamp(features.meanSymmetryPercent);
    return {
      score: s,
      note: `${features.meanSymmetryPercent.toFixed(1)}% facial symmetry — your left and right tracked together.`,
    };
  }
  if (typeof features?.postureSwayCm === "number") {
    const s = clamp(100 - features.postureSwayCm * 12);
    return {
      score: s,
      note: `${features.postureSwayCm.toFixed(1)} cm postural sway across the hold.`,
    };
  }
  return { score: 85, note: "Hold completed without issue." };
}

function scoreSpeechTask(
  result: TaskResult,
  features: TaskFeatures | undefined,
  kind: "passage" | "prompt" | "math",
): TaskScore {
  if (result.skipped) return { score: 30, note: "Skipped." };
  const voiced = features?.voicedRatio ?? 0;
  const transcript = result.speechTranscript;
  const wordCount = transcript ? transcript.split(/\s+/).filter(Boolean).length : null;

  // Base score from voiced ratio — proxy for engagement.
  let score = clamp(voiced * 100);
  const parts: string[] = [];
  if (wordCount !== null) {
    parts.push(`Captured ${wordCount} words`);
    // Modest bonus for substantive speech (>20 words for passages and
    // prompts, >10 for math).
    const target = kind === "math" ? 10 : 20;
    if (wordCount >= target) score = clamp(score + 8);
  } else {
    parts.push("Acoustic features only (no transcript)");
  }
  if (features?.meanPitchHz) {
    parts.push(`mean pitch ${features.meanPitchHz.toFixed(0)} Hz`);
  }
  return { score, note: parts.join(" · ") + "." };
}

function scoreFluency(result: TaskResult): TaskScore {
  if (result.skipped) return { score: 30, note: "Skipped." };
  const transcript = result.speechTranscript;
  if (!transcript) {
    return {
      score: 70,
      note: "No transcript captured — give Glimpse mic permission to score this properly.",
    };
  }
  const words = transcript
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z]/g, "").toLowerCase())
    .filter((w) => w.length > 1);
  const unique = new Set(words);
  // 15+ unique items in 30s is healthy adult range for many categories.
  const score = clamp((unique.size / 15) * 100);
  return {
    score,
    note: `${unique.size} unique items named.`,
  };
}

function scoreDiadochokinesis(features: TaskFeatures | undefined): TaskScore {
  const voiced = features?.voicedRatio ?? 0;
  // High voiced ratio + steady pitch ≈ healthy diadochokinesis.
  const pitchSteady = features?.pitchVariationHz
    ? Math.max(0, 1 - features.pitchVariationHz / 60)
    : 0.6;
  const score = clamp(voiced * 60 + pitchSteady * 40);
  return {
    score,
    note: `${(voiced * 100).toFixed(0)}% voiced ratio — proxy for syllable-rate clarity.`,
  };
}

function scoreFingerTap(features: TaskFeatures | undefined): TaskScore {
  const taps = features?.tapCount ?? 0;
  // 60 taps over 15s ≈ 4 Hz, healthy adult range. Above that pushes
  // score higher; below drops it.
  const score = clamp((taps / 60) * 100);
  return {
    score,
    note: `${taps} detected pinches in 15s.`,
  };
}

function scoreDigitSpan(result: TaskResult): TaskScore {
  // Digit span doesn't currently surface per-trial accuracy in
  // TaskResult — until it does, fall back to a completion-based score.
  if (result.skipped) return { score: 30, note: "Skipped." };
  return { score: 80, note: "Digit-span completed." };
}

function scoreStroop(result: TaskResult): TaskScore {
  const correct = result.stroopCorrect ?? 0;
  const total = result.stroopTotal ?? 0;
  if (total === 0)
    return { score: completedScore(result), note: "No Stroop trials registered." };
  const pct = (correct / total) * 100;
  return { score: clamp(pct), note: `${correct} of ${total} trials correct.` };
}

function scoreTrailMaking(result: TaskResult): TaskScore {
  const time = result.trailCompletionSeconds;
  const errors = result.trailErrors ?? 0;
  if (time === undefined)
    return { score: completedScore(result), note: "Did not complete the full sequence." };
  // 30s for 10 numbers is a healthy fast time. Penalty per error.
  const timeScore = clamp(100 - Math.max(0, time - 15) * 1.5);
  const errorPenalty = errors * 8;
  return {
    score: clamp(timeScore - errorPenalty),
    note: `${time.toFixed(1)}s · ${errors} ${errors === 1 ? "error" : "errors"}.`,
  };
}

function scoreSpiral(result: TaskResult): TaskScore {
  if (typeof result.spiralMeanDeviation !== "number")
    return { score: 70, note: "Spiral traced — features not captured." };
  // 0.03 normalised deviation ≈ smooth trace; 0.12 ≈ noticeable tremor.
  const dev = result.spiralMeanDeviation;
  const score = clamp(100 - dev * 600);
  return {
    score,
    note: `${(dev * 100).toFixed(1)}% mean deviation from the template.`,
  };
}

export function averageScore(scores: number[]): number {
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}
