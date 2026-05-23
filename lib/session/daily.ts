import type { Task } from "./types";

// Daily five-minute task list. Built around four phases — speech, visual,
// movement, cognitive — with one rotating balance task so the same
// exercise isn't measured every single day (better drift detection
// across modalities, and avoids habituation).
//
// In v2 the rotation is driven by the user's risk profile + recent drift
// signals: Parkinson's-risk users get more finger tapping and tremor
// checks, fall-risk users get more single-leg stance, cardiovascular get
// more sit-to-stand. v1 uses day-of-week.

const BASE_TASKS: Task[] = [
  // ─── SPEECH (~45s) ──────────────────────────────────────────────────
  {
    kind: "read_passage",
    id: "daily-passage",
    phase: "speech",
    title: "Read this aloud",
    instruction: "Speak at your normal pace.",
    durationSeconds: 45,
    modality: "audio",
    passage:
      "Light came through the window in pale, even bars. Outside, the river ran slow and dark. She thought about the walk she would take after breakfast, the one with the long bend in the road and the small white bridge.",
  },

  // ─── VISUAL (~15s) ──────────────────────────────────────────────────
  {
    kind: "instruction",
    id: "daily-smile",
    phase: "visual",
    title: "Smile and hold",
    instruction:
      "Give a comfortable smile. Hold it until the timer ends.",
    durationSeconds: 15,
    modality: "video",
  },

  // ─── MOVEMENT (~55s) ────────────────────────────────────────────────
  // Finger taps every day — that one's quick and high-information.
  {
    kind: "finger_tap",
    id: "daily-tap-right",
    phase: "movement",
    title: "Quick finger tap — right hand",
    instruction:
      "Tap thumb and index together as fast as you comfortably can.",
    hand: "right",
    durationSeconds: 15,
    modality: "video",
  },
  // Arm hold every day — catches early arm drift, takes 15 seconds.
  {
    kind: "instruction",
    id: "daily-arm-hold",
    phase: "movement",
    title: "Arm hold, eyes closed",
    instruction:
      "Hold both arms straight out in front of you, palms up, eyes closed. Stay relaxed and still until the timer ends.",
    durationSeconds: 15,
    modality: "video",
  },
  // <BALANCE_SLOT> — replaced by the rotation below.
];

// Rotating balance task. Day-of-week driven so each appears 1–3× per week.
const BALANCE_ROTATION: Task[] = [
  // Sunday — light gait
  {
    kind: "instruction",
    id: "daily-balance-gait",
    phase: "movement",
    title: "Walk a few steps and turn",
    instruction:
      "Walk three steps away from the mirror, turn, and walk back. Move at your normal pace.",
    durationSeconds: 25,
    modality: "video",
  },
  // Monday, Wednesday, Friday — sit-to-stand
  {
    kind: "instruction",
    id: "daily-balance-sit-stand",
    phase: "movement",
    title: "Five sit-to-stands",
    instruction:
      "Sit, then stand fully upright, five times. Move at a comfortable pace — speed isn't the point.",
    durationSeconds: 30,
    modality: "video",
  },
  // Tuesday, Thursday, Saturday — single-leg stance
  {
    kind: "instruction",
    id: "daily-balance-stance",
    phase: "movement",
    title: "Single-leg stance",
    instruction:
      "Stand on whichever leg feels steadier. Hold for as long as you can without grabbing anything.",
    durationSeconds: 25,
    modality: "video",
  },
];

// 0=Sun … 6=Sat
const DAY_TO_BALANCE_INDEX = [0, 1, 2, 1, 2, 1, 2];

function balanceTaskForToday(): Task {
  const day = new Date().getDay();
  return BALANCE_ROTATION[DAY_TO_BALANCE_INDEX[day]];
}

// ─── COGNITIVE (~105s) ────────────────────────────────────────────────
const COGNITIVE_TASKS: Task[] = [
  {
    kind: "digit_span",
    id: "daily-span",
    phase: "cognitive",
    title: "Repeat the digits in order",
    instruction:
      "Memorise the digits, then type them when they hide. A few rounds, each one a digit longer.",
    direction: "forward",
    digits: [4, 9, 2, 7, 5, 1, 8, 3],
    memorizeSeconds: 5,
    recallSeconds: 8,
    minLength: 4,
    maxLength: 6,
    durationSeconds: 60,
    modality: "none",
  },
  {
    kind: "stroop",
    id: "daily-stroop",
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
];

export function buildDailyTasks(): Task[] {
  return [...BASE_TASKS, balanceTaskForToday(), ...COGNITIVE_TASKS];
}

// Static export for places that need a default (route bundle size, etc.).
// Note this captures the build-time day; clients that want fresh rotation
// should call buildDailyTasks().
export const DAILY_TASKS: Task[] = buildDailyTasks();

export const DAILY_DURATION_SECONDS = DAILY_TASKS.reduce(
  (a, t) => a + t.durationSeconds,
  0,
);
