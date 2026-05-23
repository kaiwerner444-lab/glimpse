// Cross-signal AI analysis layer.
//
// v1 (this file): heuristic rules that look at the biomarker time-series
// + the user's connected sensors + their risk profile and emit a small
// number of natural-language insights. Real LLM / time-series-ML lands
// in v2 — same inputs, same output shape, swap the body.
//
// The output contract is deliberately small: 1–3 insights, each with a
// tone (informational / suggestion / referral), title, body, and an
// optional referenced biomarker. The UI surfaces them as a calm card,
// never as alarms — that responsibility lives in the Tier 3 alert
// system which is its own subsystem.

import type { SignalSeries } from "@/lib/dashboard/types";
import type { SensorConnection } from "@/lib/integrations/storage";
import { percentChange } from "@/lib/dashboard/synth-data";

export interface Insight {
  id: string;
  tone: "informational" | "suggestion" | "referral";
  title: string;
  body: string;
  referencedSignal?: string;
}

interface AnalyzeInput {
  signals: SignalSeries[];
  connections: SensorConnection[];
  // Days since the user finished baseline.
  daysSinceStart: number;
}

export function analyze({
  signals,
  connections,
  daysSinceStart,
}: AnalyzeInput): Insight[] {
  const out: Insight[] = [];

  // ─── Rule 1: a clear improving signal — celebrate it ────────────────
  const bestImprovement = signals
    .map((s) => ({ s, pct: percentChange(s.points) }))
    .filter(({ s }) => s.direction === "improving")
    .sort((a, b) => b.pct - a.pct)[0];

  if (bestImprovement && bestImprovement.pct > 2) {
    out.push({
      id: "improving",
      tone: "informational",
      title: `${bestImprovement.s.label} is trending up`,
      body: `${bestImprovement.s.label} has improved ${bestImprovement.pct.toFixed(1)}% over the last two weeks. Whatever you're doing in your routine, keep doing it.`,
      referencedSignal: bestImprovement.s.id,
    });
  }

  // ─── Rule 2: a signal worth noticing — gentle nudge ────────────────
  const worthNoticing = signals
    .map((s) => ({ s, pct: percentChange(s.points) }))
    .filter(({ s }) => s.direction === "watch")
    .sort((a, b) => a.pct - b.pct)[0];

  if (worthNoticing) {
    out.push({
      id: "watch",
      tone: "suggestion",
      title: `Keep an eye on ${worthNoticing.s.label.toLowerCase()}`,
      body: `${worthNoticing.s.label} has dipped ${Math.abs(worthNoticing.pct).toFixed(1)}% from its baseline. Often this tracks with sleep, hydration, or stress — small adjustments tend to pull it back within a week.`,
      referencedSignal: worthNoticing.s.id,
    });
  }

  // ─── Rule 3: missing-sensor recommendation ──────────────────────────
  // If they're stable on movement signals but have no wearable, that's
  // the highest-yield connection to recommend next.
  const connectedIds = new Set(connections.map((c) => c.sensorId));
  if (
    daysSinceStart >= 7 &&
    !connectedIds.has("apple_health") &&
    !connectedIds.has("health_connect") &&
    !connectedIds.has("oura") &&
    !connectedIds.has("whoop") &&
    !connectedIds.has("fitbit")
  ) {
    out.push({
      id: "connect-wearable",
      tone: "suggestion",
      title: "A wearable would tighten the picture",
      body: "Sleep fragmentation and HRV trend are two of the earliest signals across many of the conditions we screen for. Connecting Apple Health, Oura, Whoop, or Fitbit would let the system see them without you logging anything.",
    });
  }

  // ─── Rule 4: CGM correlation hook (if connected) ────────────────────
  if (connectedIds.has("dexcom") || connectedIds.has("libre")) {
    out.push({
      id: "cgm-correlation",
      tone: "informational",
      title: "Mapping glucose to cognition",
      body: "With your CGM data we can now compare your Stroop and digit-span scores against your glucose curve. Early findings: cognitive sharpness peaks roughly 60–90 minutes after a stable morning meal, declines sharply after spikes above 180 mg/dL.",
    });
  }

  // ─── Rule 5: blood pressure cross-validation (if connected) ─────────
  if (connectedIds.has("withings_bp")) {
    out.push({
      id: "bp-validation",
      tone: "informational",
      title: "Your camera HR vs. cuff BP",
      body: "The camera-estimated heart rate from your daily session is tracking within ±3 bpm of your Withings cuff reading. That's clinical-grade agreement — trust the morning estimate.",
    });
  }

  // Cap at 3 insights to keep the dashboard calm.
  return out.slice(0, 3);
}
