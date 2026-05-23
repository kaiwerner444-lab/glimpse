// Domain types for the dashboard. Trend direction is intentionally
// non-clinical — we say "improving" / "needs attention", never use
// red except for Tier 3 alerts (which live elsewhere).

export type TrendDirection = "improving" | "stable" | "watch";

export type Phase = "speech" | "visual" | "movement" | "cognitive";

export interface SignalSeries {
  id: string;
  label: string;
  phase: Phase;
  unit: string;
  // 14 data points = two weeks of daily values.
  points: number[];
  baseline: number;
  direction: TrendDirection;
  blurb: string;
}

export interface LearningStage {
  id: string;
  title: string;
  body: string;
  // Day range this stage spans, from the user's first session.
  fromDay: number;
  toDay: number;
}

export interface NextSessionInfo {
  // null = not yet scheduled / hardware not paired.
  scheduledFor: string | null;
  durationSeconds: number;
  taskCount: number;
}
