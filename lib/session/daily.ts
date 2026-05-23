import type { Task } from "./types";

// Daily five-minute task list. Built around four phases — speech, visual,
// movement, cognitive — with a per-phase rotation so each day's session
// feels distinct. In v2 the rotation is driven by the user's risk
// profile + recent drift signals; v1 uses day-of-week.

// ─── SPEECH rotation ───────────────────────────────────────────────────
const SPEECH_TASKS: Task[] = [
  // Sunday + Wednesday — passage read
  {
    kind: "read_passage",
    id: "daily-speech-passage",
    phase: "speech",
    title: "Read this aloud",
    instruction: "Speak at your normal pace.",
    durationSeconds: 45,
    modality: "audio",
    passage:
      "Light came through the window in pale, even bars. Outside, the river ran slow and dark. She thought about the walk she would take after breakfast, the one with the long bend in the road and the small white bridge.",
  },
  // Monday + Thursday — diadochokinesis (PD/ALS/MS speech-motor probe)
  {
    kind: "diadochokinesis",
    id: "daily-speech-ddk",
    phase: "speech",
    title: "Say 'Pa-Ta-Ka' as fast as you can",
    instruction:
      "Repeat the three syllables cleanly and rapidly until the timer ends.",
    syllable: "pa-ta-ka",
    durationSeconds: 20,
    modality: "audio",
  },
  // Tuesday + Friday — verbal fluency (Alzheimer's / MCI screen)
  {
    kind: "verbal_fluency",
    id: "daily-speech-fluency",
    phase: "speech",
    title: "Name as many as you can",
    instruction:
      "Say out loud as many examples as you can in 30 seconds.",
    category: "Animals",
    durationSeconds: 30,
    modality: "audio",
  },
  // Saturday — counting backward by 7s
  {
    kind: "countdown_math",
    id: "daily-speech-countdown",
    phase: "speech",
    title: "Count backward by sevens",
    instruction:
      "Starting at 100, subtract 7 each time and say the result aloud.",
    startFrom: 100,
    subtractBy: 7,
    durationSeconds: 30,
    modality: "audio",
  },
];

// Sun 0, Mon 1, Tue 2, Wed 3, Thu 4, Fri 5, Sat 6
const SPEECH_BY_DAY = [0, 1, 2, 0, 1, 2, 3];

// ─── VISUAL — always the same gentle hold ──────────────────────────────
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

// ─── MOVEMENT — finger tap + arm hold + a rotating balance/manual task ─
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
    "Hold both arms straight out in front of you, palms up, eyes closed. Stay still until the timer ends.",
  durationSeconds: 15,
  modality: "video",
};

// Balance/manual rotation by day:
//   Mon/Wed/Fri → five sit-to-stands
//   Tue/Thu     → single-leg stance
//   Sat         → spiral drawing (PD tremor measure)
//   Sun         → short gait walk
const MOVEMENT_ROTATION: Task[] = [
  // 0: gait walk
  {
    kind: "instruction",
    id: "daily-movement-gait",
    phase: "movement",
    title: "Walk a few steps and turn",
    instruction:
      "Walk three steps away from the mirror, turn, and walk back. Move at your normal pace.",
    durationSeconds: 25,
    modality: "video",
  },
  // 1: sit-to-stand
  {
    kind: "instruction",
    id: "daily-movement-sit-stand",
    phase: "movement",
    title: "Five sit-to-stands",
    instruction:
      "Sit, then stand fully upright, five times. Move at a comfortable pace.",
    durationSeconds: 30,
    modality: "video",
  },
  // 2: single-leg stance
  {
    kind: "instruction",
    id: "daily-movement-stance",
    phase: "movement",
    title: "Single-leg stance",
    instruction:
      "Stand on whichever leg feels steadier. Hold for as long as you can without grabbing anything.",
    durationSeconds: 25,
    modality: "video",
  },
  // 3: spiral drawing (PD tremor)
  {
    kind: "spiral_drawing",
    id: "daily-movement-spiral",
    phase: "movement",
    title: "Trace the spiral",
    instruction:
      "Use your finger (or mouse) to trace the dotted spiral from the centre outward. Take it at a calm pace.",
    turns: 3,
    durationSeconds: 30,
    modality: "none",
  },
];

const MOVEMENT_BY_DAY = [0, 1, 2, 1, 2, 1, 3];

// ─── COGNITIVE — digit span + rotating attention task ──────────────────
const DIGIT_SPAN_TASK: Task = {
  kind: "digit_span",
  id: "daily-cognitive-span",
  phase: "cognitive",
  title: "Repeat the digits in order",
  instruction:
    "Memorise the digits, then type them when they hide. A few rounds.",
  direction: "forward",
  digits: [4, 9, 2, 7, 5, 1, 8, 3],
  memorizeSeconds: 5,
  recallSeconds: 8,
  minLength: 4,
  maxLength: 6,
  durationSeconds: 60,
  modality: "none",
};

const ATTENTION_ROTATION: Task[] = [
  // 0: Stroop
  {
    kind: "stroop",
    id: "daily-cognitive-stroop",
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
  },
  // 1: Trail Making B-style sequencing
  {
    kind: "trail_making",
    id: "daily-cognitive-trails",
    phase: "cognitive",
    title: "Tap the numbers in order",
    instruction:
      "Tap 1, then 2, then 3, and keep going. Speed matters but accuracy matters more.",
    count: 10,
    durationSeconds: 60,
    modality: "none",
  },
];

const ATTENTION_BY_DAY = [0, 1, 0, 1, 0, 1, 0];

export function buildDailyTasks(): Task[] {
  const day = new Date().getDay();
  return [
    SPEECH_TASKS[SPEECH_BY_DAY[day]],
    VISUAL_TASK,
    FINGER_TAP_TASK,
    ARM_HOLD_TASK,
    MOVEMENT_ROTATION[MOVEMENT_BY_DAY[day]],
    DIGIT_SPAN_TASK,
    ATTENTION_ROTATION[ATTENTION_BY_DAY[day]],
  ];
}

// Static export — captures the build-time day. Pages should call
// buildDailyTasks() at render time for the user's local rotation.
export const DAILY_TASKS: Task[] = buildDailyTasks();

export const DAILY_DURATION_SECONDS = DAILY_TASKS.reduce(
  (a, t) => a + t.durationSeconds,
  0,
);
