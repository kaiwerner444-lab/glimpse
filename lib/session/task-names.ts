// Display-name + phase + kind lookup for task IDs.
//
// Task IDs include a -d{N} day suffix in the daily rotation
// ("daily-speech-passage-d3") and a phase prefix ("baseline-",
// "daily-"). We map the canonical "family" id (suffix stripped) to a
// human-readable name and the phase + kind so the session detail page
// can render the right icon and the right visualisation without
// inferring from regex parsing.

export interface TaskMeta {
  name: string;
  phase: "speech" | "visual" | "movement" | "cognitive";
  kind:
    | "read_passage"
    | "open_prompt"
    | "verbal_fluency"
    | "countdown_math"
    | "diadochokinesis"
    | "smile_hold"
    | "neutral_hold"
    | "smooth_pursuit"
    | "finger_tap"
    | "arm_hold"
    | "sit_to_stand"
    | "single_leg_stance"
    | "gait_walk"
    | "spiral_drawing"
    | "digit_span"
    | "stroop"
    | "trail_making"
    | "instruction";
}

const NAMES: Record<string, TaskMeta> = {
  // ─── Daily — speech ─────────────────────────────────────────────────
  "daily-speech-passage": { name: "Read passage aloud", phase: "speech", kind: "read_passage" },
  "daily-speech-ddk": { name: "Pa-Ta-Ka rapid syllables", phase: "speech", kind: "diadochokinesis" },
  "daily-speech-fluency": { name: "Verbal fluency", phase: "speech", kind: "verbal_fluency" },
  "daily-speech-countdown": { name: "Count backward", phase: "speech", kind: "countdown_math" },
  "daily-speech-prompt": { name: "Open prompt", phase: "speech", kind: "open_prompt" },
  "daily-comorbid-prosody": { name: "Tell us about your week", phase: "speech", kind: "open_prompt" },

  // ─── Daily — visual ─────────────────────────────────────────────────
  "daily-visual-smile": { name: "Smile and hold", phase: "visual", kind: "smile_hold" },
  "daily-comorbid-facial-symmetry": { name: "Hold a neutral expression", phase: "visual", kind: "neutral_hold" },

  // ─── Daily — movement ───────────────────────────────────────────────
  "daily-movement-tap-right": { name: "Finger tap, right hand", phase: "movement", kind: "finger_tap" },
  "daily-movement-tap-left": { name: "Finger tap, left hand", phase: "movement", kind: "finger_tap" },
  "daily-movement-arm-hold": { name: "Arm hold, eyes closed", phase: "movement", kind: "arm_hold" },
  "daily-movement-sit-stand": { name: "Five sit-to-stands", phase: "movement", kind: "sit_to_stand" },
  "daily-movement-sit-stand-rot": { name: "Five sit-to-stands", phase: "movement", kind: "sit_to_stand" },
  "daily-movement-stance": { name: "Single-leg stance", phase: "movement", kind: "single_leg_stance" },
  "daily-movement-stance-rot": { name: "Single-leg stance", phase: "movement", kind: "single_leg_stance" },
  "daily-movement-gait": { name: "Walk and turn", phase: "movement", kind: "gait_walk" },
  "daily-movement-spiral": { name: "Spiral drawing", phase: "movement", kind: "spiral_drawing" },

  // ─── Daily — cognitive ─────────────────────────────────────────────
  "daily-cognitive-span": { name: "Digit span", phase: "cognitive", kind: "digit_span" },
  "daily-cognitive-stroop": { name: "Stroop", phase: "cognitive", kind: "stroop" },
  "daily-cognitive-trails": { name: "Trail Making", phase: "cognitive", kind: "trail_making" },
  "daily-cognitive-trails-ckd": { name: "Trail Making", phase: "cognitive", kind: "trail_making" },

  // ─── Baseline ──────────────────────────────────────────────────────
  "speech-passage": { name: "Read passage aloud", phase: "speech", kind: "read_passage" },
  "speech-day": { name: "Describe yesterday", phase: "speech", kind: "open_prompt" },
  "speech-fluency": { name: "Verbal fluency", phase: "speech", kind: "verbal_fluency" },
  "speech-countdown": { name: "Count backward", phase: "speech", kind: "countdown_math" },
  "speech-ddk": { name: "Pa-Ta-Ka rapid syllables", phase: "speech", kind: "diadochokinesis" },
  "visual-neutral": { name: "Hold a neutral expression", phase: "visual", kind: "neutral_hold" },
  "visual-smile": { name: "Smile and hold", phase: "visual", kind: "smile_hold" },
  "visual-eyebrows": { name: "Raise eyebrows", phase: "visual", kind: "instruction" },
  "visual-purse": { name: "Purse lips", phase: "visual", kind: "instruction" },
  "visual-pursuit": { name: "Smooth pursuit", phase: "visual", kind: "smooth_pursuit" },
  "movement-tap-right": { name: "Finger tap, right", phase: "movement", kind: "finger_tap" },
  "movement-tap-left": { name: "Finger tap, left", phase: "movement", kind: "finger_tap" },
  "movement-arm-hold": { name: "Arm hold, eyes closed", phase: "movement", kind: "arm_hold" },
  "movement-stand": { name: "Five sit-to-stands", phase: "movement", kind: "sit_to_stand" },
  "movement-stance": { name: "Single-leg stance", phase: "movement", kind: "single_leg_stance" },
  "movement-spiral": { name: "Spiral drawing", phase: "movement", kind: "spiral_drawing" },
  "cognitive-span-forward": { name: "Digit span, forward", phase: "cognitive", kind: "digit_span" },
  "cognitive-span-backward": { name: "Digit span, backward", phase: "cognitive", kind: "digit_span" },
  "cognitive-stroop": { name: "Stroop", phase: "cognitive", kind: "stroop" },
  "cognitive-trails": { name: "Trail Making", phase: "cognitive", kind: "trail_making" },
  "cognitive-recall": { name: "Final recall", phase: "cognitive", kind: "instruction" },
};

// Strip the per-day suffix so a runtime task id ("daily-speech-passage-d4")
// matches its family entry.
function family(id: string): string {
  return id.replace(/-d\d+$/, "");
}

export function taskMetaFor(id: string): TaskMeta {
  const meta = NAMES[family(id)];
  if (meta) return meta;
  // Fallback — keep something readable so the session detail page is
  // never blank if a new task lands without a meta entry.
  return {
    name: id
      .replace(/^daily-|^baseline-/, "")
      .replace(/-d\d+$/, "")
      .replace(/-/g, " ")
      .replace(/^./, (c) => c.toUpperCase()),
    phase: "speech",
    kind: "instruction",
  };
}
