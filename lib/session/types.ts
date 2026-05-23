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
      digits: number[];
    })
  | (BaseTask & { kind: "stroop"; trials: StroopTrial[] });

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
}
