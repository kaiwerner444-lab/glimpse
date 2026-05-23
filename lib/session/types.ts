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
  // Set when this task is in today's session for a specific reason
  // beyond the default rotation — e.g. a comorbid check, a longitudinal
  // anchor, or a personalisation based on the user's risk profile. The
  // SessionRunner surfaces this inline so the user understands why
  // their daily mix shifted.
  whyToday?: string;
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
    })
  | (BaseTask & {
      // Spiral drawing — validated Parkinson's tremor measure
      // (Pullman 1998; many follow-ups). The user traces an Archimedean
      // spiral; mean deviation from the template and high-frequency
      // micromovement reveal PD-style tremor and dysmetria. The
      // template is rendered as a guide; the user-drawn path is
      // captured and scored client-side.
      kind: "spiral_drawing";
      turns: number;
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
  // Spiral drawing — mean deviation from the template path (smaller is
  // smoother) and high-frequency micromovement variance (a proxy for
  // tremor: higher = more shake).
  spiralMeanDeviation?: number;
  spiralTremorVariance?: number;
  // Speech transcript (audio tasks only). Captured via Web Speech API
  // browser-side; replaced by server-side Whisper in v2.
  speechTranscript?: string;
  // Derived 0-100 score for this task, computed from the captured
  // features. The session detail page reads these to give the user a
  // tangible read of how each task went.
  taskScore?: number;
  taskScoreNote?: string;
}
