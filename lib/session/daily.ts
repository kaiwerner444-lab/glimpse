import type { Task } from "./types";

// Daily five-minute task list. In v2 this is generated dynamically from
// the user's risk profile + recent drift signals. For v1 we ship a fixed
// rotation of high-information tasks that fit comfortably in 5 minutes.

export const DAILY_TASKS: Task[] = [
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
  {
    kind: "digit_span",
    id: "daily-span",
    phase: "cognitive",
    title: "Repeat the digits in order",
    instruction:
      "Watch the digits, then type them back. We'll do a few rounds.",
    direction: "forward",
    digits: [4, 9, 2, 7, 5, 1, 8],
    durationSeconds: 75,
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

export const DAILY_DURATION_SECONDS = DAILY_TASKS.reduce(
  (a, t) => a + t.durationSeconds,
  0,
);
