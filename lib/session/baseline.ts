import type { Task } from "./types";

// Baseline task list. Total target: ~15 minutes.
// Order: speech → visual → movement → cognitive (matches the spec).

export const BASELINE_TASKS: Task[] = [
  // ─── SPEECH (~4 min) ────────────────────────────────────────────────
  {
    kind: "read_passage",
    id: "speech-passage",
    phase: "speech",
    title: "Read this passage aloud",
    instruction:
      "Speak at your normal pace. We're capturing your typical rhythm and clarity.",
    durationSeconds: 60,
    modality: "audio",
    passage:
      "The morning sun broke through the kitchen window, painting warm stripes across the wooden floor. She poured a small cup of tea and stood for a moment, listening to birds outside. The day felt unhurried. Later, she would walk down by the river, count the boats, and remember the long summer of nineteen ninety four.",
  },
  {
    kind: "open_prompt",
    id: "speech-day",
    phase: "speech",
    title: "Tell us about yesterday",
    instruction:
      "Describe what you did yesterday in as much detail as you'd like. Speak naturally.",
    question: "What did you do yesterday?",
    durationSeconds: 60,
    modality: "audio",
  },
  {
    kind: "verbal_fluency",
    id: "speech-fluency",
    phase: "speech",
    title: "Name as many as you can",
    instruction:
      "Say out loud as many examples of this category as you can in 60 seconds.",
    category: "Animals",
    durationSeconds: 60,
    modality: "audio",
  },
  {
    kind: "countdown_math",
    id: "speech-countdown",
    phase: "speech",
    title: "Count backward by sevens",
    instruction:
      "Starting at 100, subtract 7 each time and say the result out loud. Keep going until the timer ends.",
    startFrom: 100,
    subtractBy: 7,
    durationSeconds: 60,
    modality: "audio",
  },
  {
    // Diadochokinesis — classic speech-motor probe in MDS-UPDRS III item 3.4,
    // the ALS-FRS, and standard MS speech assessments. Picks up motor speech
    // changes (rate, regularity, articulation breakdown) well before they
    // become socially noticeable.
    kind: "diadochokinesis",
    id: "speech-ddk",
    phase: "speech",
    title: "Say 'Pa-Ta-Ka' as fast as you can",
    instruction:
      "Repeat the three syllables cleanly and rapidly. We're listening for steadiness, not loudness.",
    syllable: "pa-ta-ka",
    durationSeconds: 20,
    modality: "audio",
  },

  // ─── VISUAL & FACIAL (~3 min) ───────────────────────────────────────
  {
    kind: "instruction",
    id: "visual-neutral",
    phase: "visual",
    title: "Hold a neutral expression",
    instruction:
      "Look directly at the camera. Relax your face. Hold still until the timer ends.",
    durationSeconds: 20,
    modality: "video",
  },
  {
    kind: "instruction",
    id: "visual-smile",
    phase: "visual",
    title: "Smile and hold",
    instruction:
      "Give a comfortable smile and hold it. We're capturing symmetry between both sides of your face.",
    durationSeconds: 15,
    modality: "video",
  },
  {
    kind: "instruction",
    id: "visual-eyebrows",
    phase: "visual",
    title: "Raise your eyebrows and hold",
    instruction:
      "Raise both eyebrows as high as is comfortable. Hold the position until the timer ends.",
    durationSeconds: 15,
    modality: "video",
  },
  {
    kind: "instruction",
    id: "visual-purse",
    phase: "visual",
    title: "Purse your lips",
    instruction:
      "Pucker your lips as if you're going to whistle. Hold the position.",
    durationSeconds: 15,
    modality: "video",
  },
  {
    kind: "smooth_pursuit",
    id: "visual-pursuit",
    phase: "visual",
    title: "Follow the dot with your eyes",
    instruction:
      "Keep your head still. Track the dot smoothly with your eyes — don't let it jump.",
    durationSeconds: 40,
    modality: "video",
  },

  // ─── MOVEMENT (~4 min) ──────────────────────────────────────────────
  {
    kind: "finger_tap",
    id: "movement-tap-right",
    phase: "movement",
    title: "Finger tapping — right hand",
    instruction:
      "Tap your right thumb and index finger together as fast as you can. Use the on-screen tap pad to count along.",
    hand: "right",
    durationSeconds: 15,
    modality: "video",
  },
  {
    kind: "finger_tap",
    id: "movement-tap-left",
    phase: "movement",
    title: "Finger tapping — left hand",
    instruction:
      "Now switch hands. Tap your left thumb and index finger together as fast as you can.",
    hand: "left",
    durationSeconds: 15,
    modality: "video",
  },
  {
    kind: "instruction",
    id: "movement-arm-hold",
    phase: "movement",
    title: "Arm hold with eyes closed",
    instruction:
      "Hold both arms straight out in front of you, palms up, and close your eyes. Stay still until the timer ends.",
    durationSeconds: 20,
    modality: "video",
  },
  {
    kind: "instruction",
    id: "movement-stand",
    phase: "movement",
    title: "Five sit-to-stands",
    instruction:
      "Sit, then stand fully upright, five times. Move at a comfortable pace — speed isn't the point.",
    durationSeconds: 45,
    modality: "video",
  },
  {
    kind: "instruction",
    id: "movement-stance",
    phase: "movement",
    title: "Single-leg stance",
    instruction:
      "Stand on whichever leg feels steadier. Hold for as long as you can without grabbing anything.",
    durationSeconds: 30,
    modality: "video",
  },
  {
    // Spiral drawing — validated PD tremor measure since Pullman 1998.
    // Captures mean deviation from an Archimedean template and tremor
    // variance from the frame-to-frame deltas.
    kind: "spiral_drawing",
    id: "movement-spiral",
    phase: "movement",
    title: "Trace the spiral",
    instruction:
      "Use your finger (or mouse) to trace the dotted spiral from the centre outward. Take it at a calm pace.",
    turns: 3,
    durationSeconds: 30,
    modality: "none",
  },

  // ─── COGNITIVE (~4 min) ─────────────────────────────────────────────
  {
    kind: "digit_span",
    id: "cognitive-span-forward",
    phase: "cognitive",
    title: "Repeat the digits in order",
    instruction:
      "Memorise the digits in the time you have, then type them back when they disappear. We'll do a few rounds, each one a digit longer.",
    direction: "forward",
    digits: [7, 2, 9, 4, 6, 1, 8, 3],
    memorizeSeconds: 5,
    recallSeconds: 8,
    minLength: 4,
    maxLength: 7,
    durationSeconds: 75,
    modality: "none",
  },
  {
    kind: "digit_span",
    id: "cognitive-span-backward",
    phase: "cognitive",
    title: "Repeat the digits in reverse",
    instruction:
      "Same idea, but type them in reverse order. Take a breath — the digits hide on a countdown.",
    direction: "backward",
    digits: [5, 3, 8, 2, 7, 1, 9, 4],
    memorizeSeconds: 6,
    recallSeconds: 10,
    minLength: 3,
    maxLength: 6,
    durationSeconds: 75,
    modality: "none",
  },
  {
    kind: "stroop",
    id: "cognitive-stroop",
    phase: "cognitive",
    title: "Tap the colour of the ink",
    instruction:
      "Ignore what the word says. Tap the button that matches the colour the word is printed in.",
    durationSeconds: 60,
    modality: "none",
    trials: [
      { word: "RED", color: "blue" },
      { word: "BLUE", color: "blue" },
      { word: "GREEN", color: "red" },
      { word: "YELLOW", color: "green" },
      { word: "RED", color: "yellow" },
      { word: "BLUE", color: "green" },
      { word: "GREEN", color: "yellow" },
      { word: "YELLOW", color: "red" },
      { word: "RED", color: "green" },
      { word: "BLUE", color: "yellow" },
      { word: "GREEN", color: "blue" },
      { word: "YELLOW", color: "blue" },
    ],
  },
  {
    // Trail Making B-style sequencing. Reitan 1958 et seq; particularly
    // sensitive to early executive-function decline (MCI, Alzheimer's,
    // vascular cognitive impairment). Time-to-completion and error rate
    // are the captured features.
    kind: "trail_making",
    id: "cognitive-trails",
    phase: "cognitive",
    title: "Tap the numbers in order",
    instruction:
      "Tap 1, then 2, then 3, and keep going. Speed matters but accuracy matters more.",
    count: 10,
    durationSeconds: 60,
    modality: "none",
  },
  {
    kind: "instruction",
    id: "cognitive-recall",
    phase: "cognitive",
    title: "Final check",
    instruction:
      "Try to recall the first thing you said in the speech section. We'll ask you again about it in tomorrow's session.",
    durationSeconds: 30,
    modality: "audio",
  },
];

export const BASELINE_DURATION_SECONDS = BASELINE_TASKS.reduce(
  (total, t) => total + t.durationSeconds,
  0,
);
