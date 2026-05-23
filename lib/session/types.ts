// Session task model. Used for the baseline session today and will be
// reused for the daily five-minute mirror ritual in v2.

export type Modality = "audio" | "video" | "both" | "none";

export type Phase = "speech" | "visual" | "movement" | "cognitive";

export interface StroopTrial {
  word: "RED" | "BLUE" | "GREEN" | "YELLOW";
  color: "red" | "blue" | "green" | "yellow";
}

export interface BaseTask {
  id: string;
  phase: Phase;
  title: string;
  instruction: string;
  durationSeconds: number;
  modality: Modality;
}

export type Task =
  | (BaseTask & { kind: "instruction" })
  | (BaseTask & { kind: "read_passage"; passage: string })
  | (BaseTask & { kind: "open_prompt"; question: string })
  | (BaseTask & { kind: "verbal_fluency"; category: string })
  | (BaseTask & {
      kind: "countdown_math";
      startFrom: number;
      subtractBy: number;
    })
  | (BaseTask & { kind: "smooth_pursuit" })
  | (BaseTask & { kind: "finger_tap"; hand: "left" | "right" })
  | (BaseTask & {
      kind: "digit_span";
      direction: "forward" | "backward";
      // Pool to draw trial sequences from. We pick a sub-array of growing
      // length per trial — first trial uses 4 digits, then 5, then 6...
      digits: number[];
      // Optional overrides; sensible defaults applied in the renderer.
      memorizeSeconds?: number;
      recallSeconds?: number;
      minLength?: number;
      maxLength?: number;
    })
  | (BaseTask & { kind: "stroop"; trials: StroopTrial[] })
  | (BaseTask & {
      // Diadochokinesis — rapid syllable repetition. Gold-standard speech
      // motor assessment, sensitive to dysarthria across PD, ALS and MS.
      // Standard syllables: "pa", "ta", "ka" or the trio "pa-ta-ka".
      kind: "diadochokinesis";
      syllable: "pa" | "ta" | "ka" | "pa-ta-ka";
    })
  | (BaseTask & {
      // Trail Making B-style sequencing. Standard executive-function /
      // processing-speed measure; the alternating variant is sensitive
      // to early MCI / Alzheimer's. We render numbered targets at random
      // positions; the user taps them in ascending order.
      kind: "trail_making";
      count: number;
    });

export interface TaskResult {
  taskId: string;
  startedAt: string;
  endedAt: string;
  skipped: boolean;
  // Interactive task captures. Optional — passive tasks store nothing here.
  fingerTapCount?: number;
  digitSpanAnswer?: string;
  stroopCorrect?: number;
  stroopTotal?: number;
  // Trail Making — time in seconds to complete the full sequence, and
  // count of tap errors (taps on the wrong next number).
  trailCompletionSeconds?: number;
  trailErrors?: number;
}
