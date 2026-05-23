import type { LearningStage } from "./types";

export const LEARNING_PATH: LearningStage[] = [
  {
    id: "show-up",
    title: "Showing up",
    body: "The first week is about adherence, not performance. We're learning what 'your normal' looks like.",
    fromDay: 0,
    toDay: 7,
  },
  {
    id: "rhythm",
    title: "Finding your rhythm",
    body: "Sessions become a habit. The system starts noticing patterns and adapting the daily mix to you.",
    fromDay: 8,
    toDay: 28,
  },
  {
    id: "signal",
    title: "Your personal signal",
    body: "Enough data to separate noise from drift. Subtle shifts get flagged as gentle suggestions, not alarms.",
    fromDay: 29,
    toDay: 90,
  },
  {
    id: "longitude",
    title: "Long-term trends",
    body: "Quarterly views, family-share summaries, and clinician-ready reports. This is what early signals look like over time.",
    fromDay: 91,
    toDay: 365,
  },
];

export function currentStage(daysSinceStart: number): LearningStage {
  for (const stage of LEARNING_PATH) {
    if (daysSinceStart <= stage.toDay) return stage;
  }
  return LEARNING_PATH[LEARNING_PATH.length - 1];
}
