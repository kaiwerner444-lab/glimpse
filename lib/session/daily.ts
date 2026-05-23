import type { Task } from "./types";
import type { OnboardingState, TrackedCondition } from "@/lib/types";

// Risk-aware, content-rotating daily session builder.
//
// Three things changed vs. the original implementation:
//   1. Task selection now considers the user's existing diagnoses,
//      family history, and confirmed risks. Tasks tied to a relevant
//      condition or its known comorbidities get prioritised.
//   2. Comorbid tasks carry a whyToday string explaining why they're
//      appearing today (e.g., "Diabetes raises CV risk 2–4× — we keep
//      an eye on that link.").
//   3. Content within tasks rotates daily so a user isn't reading the
//      same passage and naming animals 365 days a year. One semantic
//      category is anchored on a fixed weekly day for longitudinal
//      comparison; the rest rotate.

interface UserContext {
  diagnoses: Set<TrackedCondition>;
  familyHistory: Set<TrackedCondition>;
  confirmedRisks: Set<TrackedCondition>;
}

export function buildUserContext(state: OnboardingState): UserContext {
  return {
    diagnoses: new Set(state.clinicalContext?.existingDiagnoses ?? []),
    familyHistory: new Set(
      (state.familyHistory?.members ?? []).flatMap((m) => m.conditions),
    ),
    confirmedRisks: new Set(state.riskProfile?.confirmed ?? []),
  };
}

// Returns 1.0 if diagnosed, 0.7 if confirmed risk, 0.35 if family
// history, 0 otherwise.
function signalFor(ctx: UserContext, c: TrackedCondition): number {
  if (ctx.diagnoses.has(c)) return 1.0;
  if (ctx.confirmedRisks.has(c)) return 0.7;
  if (ctx.familyHistory.has(c)) return 0.35;
  return 0;
}

// Known comorbid clusters from the clinical literature. Each entry
// captures the directional relationship; values are not probabilistic,
// they just gate when an extra task should be inserted.
const COMORBID_MAP: Array<{
  trigger: TrackedCondition;
  triggers: TrackedCondition;
  rationale: string;
}> = [
  {
    trigger: "type_2_diabetes",
    triggers: "cardiovascular",
    rationale:
      "Type 2 diabetes raises cardiovascular risk 2–4×. We keep an eye on that link with a short cardio check.",
  },
  {
    trigger: "type_2_diabetes",
    triggers: "chronic_kidney_disease",
    rationale:
      "Diabetes is the #1 cause of chronic kidney disease. A balance + cognitive check helps catch the fatigue + cognitive slowing that precedes a CKD diagnosis by years.",
  },
  {
    trigger: "type_1_diabetes",
    triggers: "cardiovascular",
    rationale:
      "Type 1 diabetes accelerates cardiovascular risk. A short cardio check today.",
  },
  {
    trigger: "hypertension",
    triggers: "stroke",
    rationale:
      "Hypertension is the strongest modifiable stroke risk. Today's session includes a facial-symmetry hold to keep that signal anchored.",
  },
  {
    trigger: "hypertension",
    triggers: "chronic_kidney_disease",
    rationale:
      "Hypertension is the #2 cause of chronic kidney disease. Subtle cognitive slowing is one of the earliest pre-diagnosis signs — we're tracking it today.",
  },
  {
    trigger: "cardiovascular",
    triggers: "depression",
    rationale:
      "Cardiovascular disease and depression cluster bidirectionally. A short prosody check is in today's mix.",
  },
  {
    trigger: "parkinsons",
    triggers: "depression",
    rationale:
      "Depression often precedes a Parkinson's diagnosis by years. Today's session adds a prosody-sensitive task.",
  },
];

// ─── Content pools — rotated daily ─────────────────────────────────────

const PASSAGES: string[] = [
  "Light came through the window in pale, even bars. Outside, the river ran slow and dark. She thought about the walk she would take after breakfast, the one with the long bend in the road and the small white bridge.",
  "The afternoon settled into a familiar quiet. A neighbour walked past with a small grey dog, both of them moving without hurry. She listened to the kettle and watched the dust drift through a slant of sun.",
  "He found the old letter folded inside a cookbook. The ink had faded but the handwriting was unmistakeable. He smoothed the page on the counter and read it twice before he put it back where he found it.",
  "The market was busier than usual. Vendors called out prices in two languages, kids ran between the stalls, and somewhere a radio played a song he hadn't heard in twenty years.",
  "She poured the tea slowly and watched the steam curl toward the open window. Outside, the early frost had silvered every leaf in the small garden. The morning would warm up, but for now everything held still.",
  "It rained the way it sometimes does in late October — thin, persistent, with no real intention. He stood at the bus stop and counted the cars going past, then gave up and started counting umbrellas instead.",
  "They walked the long way back through the park. The bench by the fountain was empty, and they sat for a few minutes without saying much. Across the water, somebody was teaching a child to fly a kite.",
];

const FLUENCY_CATEGORIES = [
  "Animals",
  "Foods",
  "Things in a kitchen",
  "Sports",
  "Tools",
  "Clothing items",
  "Things that fly",
];

const OPEN_PROMPTS = [
  "What did you do yesterday?",
  "If you could spend a day doing anything, what would it be?",
  "Describe the room you're standing in.",
  "Tell me about a meal you remember well.",
  "What's the last thing that genuinely surprised you?",
  "Talk about a person you'd like to see again.",
  "Describe a walk you take or used to take often.",
];

const COUNTDOWN_VARIANTS: Array<{ startFrom: number; subtractBy: number }> = [
  { startFrom: 100, subtractBy: 7 },
  { startFrom: 100, subtractBy: 9 },
  { startFrom: 97, subtractBy: 7 },
  { startFrom: 101, subtractBy: 13 },
  { startFrom: 200, subtractBy: 11 },
  { startFrom: 95, subtractBy: 6 },
  { startFrom: 100, subtractBy: 7 }, // Anchor — used on Sundays for longitudinal comparison
];

const DIGIT_POOLS: number[][] = [
  [4, 9, 2, 7, 5, 1, 8, 3],
  [3, 8, 1, 6, 2, 9, 4, 7],
  [5, 2, 9, 4, 1, 7, 3, 8],
  [6, 1, 4, 8, 2, 5, 9, 3],
  [7, 3, 8, 1, 4, 6, 2, 9],
  [2, 6, 9, 3, 7, 1, 5, 8],
  [9, 4, 2, 6, 8, 3, 1, 5],
];

// Sundays anchor on the canonical "Animals · 100 minus 7" baseline so
// the longitudinal signal has a consistent reference once a week.
function isAnchorDay(day: number): boolean {
  return day === 0;
}

function pick<T>(arr: T[], day: number): T {
  return arr[day % arr.length];
}

// ─── Speech rotation ───────────────────────────────────────────────────

function buildSpeechTask(day: number, ctx: UserContext): Task {
  // Rotate by an offset of day-of-week so each weekday gets a distinct
  // speech task. Diabetes risk → more cognitive-demanding speech (count
  // backward by larger primes) so we can watch glucose-cognition link.
  const diabetes = Math.max(
    signalFor(ctx, "type_1_diabetes"),
    signalFor(ctx, "type_2_diabetes"),
  );
  if (diabetes >= 0.7 && day % 3 === 0) {
    const v = COUNTDOWN_VARIANTS[day % COUNTDOWN_VARIANTS.length];
    return {
      kind: "countdown_math",
      id: `daily-speech-countdown-d${day}`,
      phase: "speech",
      title: "Count backward",
      instruction: `Starting at ${v.startFrom}, subtract ${v.subtractBy} each time and say the result aloud.`,
      startFrom: v.startFrom,
      subtractBy: v.subtractBy,
      durationSeconds: 30,
      modality: "audio",
      whyToday:
        "Cognitive load + glucose: we cycle in a more demanding mental-arithmetic task because diabetes affects executive function in subtle, trackable ways.",
    };
  }

  // Standard daily rotation across speech tasks.
  const mod = day % 4;
  if (mod === 0) {
    return {
      kind: "read_passage",
      id: `daily-speech-passage-d${day}`,
      phase: "speech",
      title: "Read this aloud",
      instruction: "Speak at your normal pace.",
      durationSeconds: 45,
      modality: "audio",
      passage: pick(PASSAGES, day),
    };
  }
  if (mod === 1) {
    return {
      kind: "diadochokinesis",
      id: `daily-speech-ddk-d${day}`,
      phase: "speech",
      title: "Say 'Pa-Ta-Ka' as fast as you can",
      instruction:
        "Repeat the three syllables cleanly and rapidly until the timer ends.",
      syllable: "pa-ta-ka",
      durationSeconds: 20,
      modality: "audio",
    };
  }
  if (mod === 2) {
    // Verbal fluency. Anchor day uses 'Animals' for longitudinal
    // comparison; other days vary the category.
    const category = isAnchorDay(day)
      ? "Animals"
      : pick(FLUENCY_CATEGORIES, day);
    return {
      kind: "verbal_fluency",
      id: `daily-speech-fluency-d${day}`,
      phase: "speech",
      title: "Name as many as you can",
      instruction:
        "Say out loud as many examples as you can in 30 seconds.",
      category,
      durationSeconds: 30,
      modality: "audio",
      whyToday: isAnchorDay(day)
        ? "Sunday anchor — we use the same category each week so we can compare your verbal fluency longitudinally without category bias."
        : undefined,
    };
  }
  return {
    kind: "open_prompt",
    id: `daily-speech-prompt-d${day}`,
    phase: "speech",
    title: "Tell us about it",
    instruction: "Speak naturally for the full window.",
    question: pick(OPEN_PROMPTS, day),
    durationSeconds: 45,
    modality: "audio",
  };
}

// ─── Movement rotation (existing) ──────────────────────────────────────

function buildMovementRotation(day: number, ctx: UserContext): Task {
  // Diabetes / CV signal → bias toward sit-to-stand for the cardio
  // check. Hypertension or stroke risk → single-leg stance more often.
  const cardioPressure = Math.max(
    signalFor(ctx, "cardiovascular"),
    signalFor(ctx, "type_2_diabetes"),
    signalFor(ctx, "type_1_diabetes"),
  );
  const fallPressure = Math.max(
    signalFor(ctx, "stroke"),
    signalFor(ctx, "parkinsons"),
  );

  if (cardioPressure >= 0.7 && day % 2 === 0) {
    return {
      kind: "instruction",
      id: `daily-movement-sit-stand-d${day}`,
      phase: "movement",
      title: "Five sit-to-stands",
      instruction:
        "Sit, then stand fully upright, five times. Move at a comfortable pace.",
      durationSeconds: 30,
      modality: "video",
      whyToday:
        "Diabetes raises cardiovascular risk 2–4×. Sit-to-stand is a quick, validated measure of cardiovascular capacity — we cycle it in when your profile flags that link.",
    };
  }
  if (fallPressure >= 0.7 && day % 3 === 1) {
    return {
      kind: "instruction",
      id: `daily-movement-stance-d${day}`,
      phase: "movement",
      title: "Single-leg stance",
      instruction:
        "Stand on whichever leg feels steadier. Hold for as long as you can without grabbing anything.",
      durationSeconds: 25,
      modality: "video",
      whyToday:
        "Postural stability is an early proxy for fall risk and Parkinson's progression. Your profile flags this — we cycle it in more often.",
    };
  }

  // Otherwise rotate cleanly through the four standard options.
  const m = day % 4;
  if (m === 0)
    return {
      kind: "instruction",
      id: `daily-movement-gait-d${day}`,
      phase: "movement",
      title: "Walk a few steps and turn",
      instruction:
        "Walk three steps away from the mirror, turn, and walk back.",
      durationSeconds: 25,
      modality: "video",
    };
  if (m === 1)
    return {
      kind: "instruction",
      id: `daily-movement-sit-stand-rot-d${day}`,
      phase: "movement",
      title: "Five sit-to-stands",
      instruction:
        "Sit, then stand fully upright, five times.",
      durationSeconds: 30,
      modality: "video",
    };
  if (m === 2)
    return {
      kind: "instruction",
      id: `daily-movement-stance-rot-d${day}`,
      phase: "movement",
      title: "Single-leg stance",
      instruction:
        "Stand on whichever leg feels steadier. Hold for as long as you can.",
      durationSeconds: 25,
      modality: "video",
    };
  return {
    kind: "spiral_drawing",
    id: `daily-movement-spiral-d${day}`,
    phase: "movement",
    title: "Trace the spiral",
    instruction:
      "Use your finger (or mouse) to trace the dotted spiral from the centre outward.",
    turns: 3,
    durationSeconds: 30,
    modality: "none",
  };
}

// ─── Cognitive rotation ────────────────────────────────────────────────

function buildAttentionTask(day: number, ctx: UserContext): Task {
  const hypertension = signalFor(ctx, "hypertension");
  const ckd = Math.max(
    signalFor(ctx, "chronic_kidney_disease"),
    // CKD inherits risk from diabetes + hypertension when no direct
    // signal exists yet.
    signalFor(ctx, "type_2_diabetes") * 0.6,
    hypertension * 0.5,
  );

  if (ckd >= 0.5 && day % 4 === 2) {
    return {
      kind: "trail_making",
      id: `daily-cognitive-trails-ckd-d${day}`,
      phase: "cognitive",
      title: "Tap the numbers in order",
      instruction:
        "Tap 1, then 2, then 3, and keep going. Speed matters but accuracy matters more.",
      count: 10,
      durationSeconds: 60,
      modality: "none",
      whyToday:
        "Diabetes and hypertension are the two biggest drivers of chronic kidney disease. Subtle slowing on executive-function tasks (like this one) is one of the earliest pre-clinical signs — we cycle this in to catch it early.",
    };
  }

  // Default rotation: Stroop / Trail Making by even/odd day.
  if (day % 2 === 0) {
    return {
      kind: "stroop",
      id: `daily-cognitive-stroop-d${day}`,
      phase: "cognitive",
      title: "Tap the colour of the ink",
      instruction:
        "Ignore the word. Tap the colour the word is printed in.",
      durationSeconds: 45,
      modality: "none",
      trials: [
        { word: "RED", color: "blue" },
        { word: "GREEN", color: "red" },
        { word: "BLUE", color: "yellow" },
        { word: "YELLOW", color: "green" },
        { word: "RED", color: "green" },
        { word: "GREEN", color: "blue" },
        { word: "YELLOW", color: "red" },
        { word: "BLUE", color: "green" },
      ],
    };
  }
  return {
    kind: "trail_making",
    id: `daily-cognitive-trails-d${day}`,
    phase: "cognitive",
    title: "Tap the numbers in order",
    instruction:
      "Tap 1, then 2, then 3, and keep going. Speed matters but accuracy matters more.",
    count: 10,
    durationSeconds: 60,
    modality: "none",
  };
}

function buildDigitSpanTask(day: number): Task {
  const digits = pick(DIGIT_POOLS, day);
  return {
    kind: "digit_span",
    id: `daily-cognitive-span-d${day}`,
    phase: "cognitive",
    title: "Repeat the digits in order",
    instruction:
      "Memorise the digits, then type them when they hide. A few rounds.",
    direction: "forward",
    digits,
    memorizeSeconds: 5,
    recallSeconds: 8,
    minLength: 4,
    maxLength: 6,
    durationSeconds: 60,
    modality: "none",
  };
}

// ─── Constants ─────────────────────────────────────────────────────────

const VISUAL_TASK: Task = {
  kind: "instruction",
  id: "daily-visual-smile",
  phase: "visual",
  title: "Smile and hold",
  instruction:
    "Give a comfortable smile. Hold it until the timer ends.",
  durationSeconds: 15,
  modality: "video",
};

const FINGER_TAP_TASK: Task = {
  kind: "finger_tap",
  id: "daily-movement-tap-right",
  phase: "movement",
  title: "Quick finger tap — right hand",
  instruction:
    "Tap thumb and index together as fast as you comfortably can.",
  hand: "right",
  durationSeconds: 15,
  modality: "video",
};

const ARM_HOLD_TASK: Task = {
  kind: "instruction",
  id: "daily-movement-arm-hold",
  phase: "movement",
  title: "Arm hold, eyes closed",
  instruction:
    "Hold both arms straight out in front of you, palms up, eyes closed.",
  durationSeconds: 15,
  modality: "video",
};

// ─── Comorbid task insertion ───────────────────────────────────────────

function comorbidTask(day: number, ctx: UserContext): Task | null {
  // Find the highest-pressure comorbid pair active for this user.
  const active = COMORBID_MAP.filter(
    (rule) =>
      signalFor(ctx, rule.trigger) >= 0.35 ||
      signalFor(ctx, rule.triggers) >= 0.35,
  );
  if (active.length === 0) return null;
  const rule = active[day % active.length];

  // Map the target condition to a concrete task.
  switch (rule.triggers) {
    case "stroke":
      return {
        kind: "instruction",
        id: `daily-comorbid-facial-symmetry-d${day}`,
        phase: "visual",
        title: "Hold a neutral expression",
        instruction:
          "Look directly at the camera. Relax your face completely. Hold still.",
        durationSeconds: 15,
        modality: "video",
        whyToday: rule.rationale,
      };
    case "depression":
      return {
        kind: "open_prompt",
        id: `daily-comorbid-prosody-d${day}`,
        phase: "speech",
        title: "Tell us about your week so far",
        instruction:
          "Speak naturally. We're listening to prosody and pace.",
        question: "What's stood out about your week so far?",
        durationSeconds: 45,
        modality: "audio",
        whyToday: rule.rationale,
      };
    case "cardiovascular":
      // Cardio comorbid task — only insert if today's movement task isn't
      // already a cardio check.
      return null; // Sit-to-stand is already gated into movement rotation.
    case "chronic_kidney_disease":
      // CKD comorbid → trail-making already gated in attention rotation.
      return null;
    default:
      return null;
  }
}

// ─── Top-level builder ─────────────────────────────────────────────────

export function buildDailyTasks(context?: UserContext): Task[] {
  const day = new Date().getDay();
  const ctx: UserContext = context ?? {
    diagnoses: new Set(),
    familyHistory: new Set(),
    confirmedRisks: new Set(),
  };

  const speech = buildSpeechTask(day, ctx);
  const movementRot = buildMovementRotation(day, ctx);
  const attention = buildAttentionTask(day, ctx);
  const digitSpan = buildDigitSpanTask(day);
  const comorbid = comorbidTask(day, ctx);

  const tasks: Task[] = [
    speech,
    VISUAL_TASK,
    FINGER_TAP_TASK,
    ARM_HOLD_TASK,
    movementRot,
    digitSpan,
    attention,
  ];
  if (comorbid) tasks.push(comorbid);
  return tasks;
}

// Static export captures the build-time day. Pages should call
// buildDailyTasks() at render time for the user's local rotation.
export const DAILY_TASKS: Task[] = buildDailyTasks();

export const DAILY_DURATION_SECONDS = DAILY_TASKS.reduce(
  (a, t) => a + t.durationSeconds,
  0,
);
