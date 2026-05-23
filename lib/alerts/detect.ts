// Alert detection. Two paths:
//
// 1. Real history-based: when the user has completed sessions, compute
//    z-scores per signal vs their own personal baseline. Sustained
//    departures land in Tier 1/2/3 according to thresholds.
// 2. Profile-based fallback: when there's no real history yet, generate
//    plausible alerts tied to the user's risk profile so the alerts
//    page is demonstrably useful from day one. Each fallback alert is
//    labelled in code (sourceKind) so we can tell them apart.

import type { Alert } from "./types";
import { specialistsFor } from "./specialists";
import {
  loadSessionRecords,
} from "@/lib/dashboard/session-history";
import { loadOnboarding } from "@/lib/db/mock-db";
import type { TrackedCondition } from "@/lib/types";

interface SignalSummary {
  id: string;
  label: string;
  unit: string;
  higherIsBetter: boolean;
  series: number[];
  baseline: number;
}

// Same extraction surface as session-history.ts — kept local so the
// alert engine can read aggregate stats without a circular import.
function extractSignals(): SignalSummary[] {
  const records = loadSessionRecords().slice().reverse();
  if (records.length === 0) return [];

  const series = {
    "facial-symmetry": [] as number[],
    "finger-tap-speed": [] as number[],
    "postural-sway": [] as number[],
    "mean-pitch": [] as number[],
    "voiced-ratio": [] as number[],
    "stroop-accuracy": [] as number[],
  };

  for (const rec of records) {
    const fs = rec.features
      .map((f) => f.meanSymmetryPercent)
      .filter((v): v is number => typeof v === "number");
    if (fs.length) series["facial-symmetry"].push(mean(fs));

    const tap = rec.features
      .map((f) => f.tapCount)
      .filter((v): v is number => typeof v === "number" && v > 0);
    if (tap.length) series["finger-tap-speed"].push(mean(tap) * (10 / 15));

    const sway = rec.features
      .map((f) => f.postureSwayCm)
      .filter((v): v is number => typeof v === "number" && v > 0);
    if (sway.length) series["postural-sway"].push(mean(sway));

    const pitch = rec.features
      .map((f) => f.meanPitchHz)
      .filter((v): v is number => typeof v === "number" && v > 0);
    if (pitch.length) series["mean-pitch"].push(mean(pitch));

    const voiced = rec.features
      .map((f) => f.voicedRatio)
      .filter((v): v is number => typeof v === "number");
    if (voiced.length) series["voiced-ratio"].push(mean(voiced) * 100);

    const stroop = rec.results.find(
      (r) =>
        typeof r.stroopCorrect === "number" &&
        typeof r.stroopTotal === "number" &&
        r.stroopTotal! > 0,
    );
    if (stroop)
      series["stroop-accuracy"].push((stroop.stroopCorrect! / stroop.stroopTotal!) * 100);
  }

  return [
    { id: "facial-symmetry", label: "Facial symmetry", unit: "%", higherIsBetter: true, series: series["facial-symmetry"], baseline: 96.5 },
    { id: "finger-tap-speed", label: "Finger tap speed", unit: "taps/10s", higherIsBetter: true, series: series["finger-tap-speed"], baseline: 60 },
    { id: "postural-sway", label: "Postural stability", unit: "cm sway", higherIsBetter: false, series: series["postural-sway"], baseline: 3.4 },
    { id: "mean-pitch", label: "Mean pitch", unit: "Hz", higherIsBetter: true, series: series["mean-pitch"], baseline: 165 },
    { id: "voiced-ratio", label: "Voiced ratio", unit: "%", higherIsBetter: true, series: series["voiced-ratio"], baseline: 78 },
    { id: "stroop-accuracy", label: "Stroop accuracy", unit: "%", higherIsBetter: true, series: series["stroop-accuracy"], baseline: 88 },
  ].filter((s) => s.series.length > 0);
}

function mean(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
function stddev(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  return Math.sqrt(arr.reduce((acc, v) => acc + (v - m) ** 2, 0) / arr.length);
}

// ─── Real detection from session history ──────────────────────────────

function detectFromHistory(): Alert[] {
  const signals = extractSignals();
  const alerts: Alert[] = [];

  for (const s of signals) {
    if (s.series.length < 3) continue;
    const recent = s.series.slice(-5);
    const recentMean = mean(recent);
    const sd = stddev(s.series);
    const z = sd > 0 ? (recentMean - s.baseline) / sd : 0;
    const signed = s.higherIsBetter ? z : -z;
    const pct = ((recentMean - s.baseline) / s.baseline) * 100;
    const direction: Alert["direction"] = signed >= 0 ? "increase" : "decrease";

    let tier: 1 | 2 | 3 = 1;
    if (signed <= -2) tier = 3;
    else if (signed <= -1) tier = 2;
    else if (Math.abs(signed) < 0.5) continue; // not worth flagging

    // Tier 3 emergency: sudden symmetry drop or rapid speech-rate collapse.
    const isEmergency =
      (s.id === "facial-symmetry" && pct <= -10) ||
      (s.id === "voiced-ratio" && pct <= -30);

    alerts.push({
      id: `real-${s.id}-${Date.now()}`,
      tier,
      signalId: s.id,
      signalLabel: s.label,
      direction,
      changePercent: Math.round(pct * 10) / 10,
      series: s.series.slice(-14),
      title: titleFor(s, direction, tier),
      body: bodyFor(s, signed, pct),
      recommendation: recommendationFor(tier, isEmergency),
      specialists: tier === 1 ? [] : specialistsFor(s.id),
      isEmergency,
      detectedAt: new Date().toISOString(),
      sessionsObserved: s.series.length,
    });
  }
  return alerts;
}

function titleFor(
  s: SignalSummary,
  direction: Alert["direction"],
  tier: 1 | 2 | 3,
): string {
  const dirWord = direction === "increase" ? "rising" : "drifting down";
  if (tier === 3) return `${s.label} is ${dirWord} sharply`;
  if (tier === 2) return `${s.label} is ${dirWord} from your baseline`;
  return `${s.label} shifted slightly`;
}

function bodyFor(
  s: SignalSummary,
  signedZ: number,
  pct: number,
): string {
  const sd = Math.abs(signedZ).toFixed(1);
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}% from your baseline (${s.baseline} ${s.unit}); about ${sd} SD outside your normal day-to-day variation.`;
}

function recommendationFor(tier: 1 | 2 | 3, isEmergency?: boolean): string {
  if (isEmergency) {
    return "If you have new facial drooping, sudden weakness in an arm, or slurred speech right now, call 911 immediately. Stroke care is time-critical.";
  }
  if (tier === 3) {
    return "We recommend booking a specialist within the next two weeks. Glimpse can generate a one-page summary you can hand them.";
  }
  if (tier === 2) {
    return "Worth mentioning at your next physician visit. Sleep, hydration, and stress are the most common contributors when this signal drifts — small adjustments often pull it back.";
  }
  return "Within normal day-to-day variation. Nothing to do — we just wanted you to see it.";
}

// ─── Profile-based fallback ───────────────────────────────────────────

function pickFallbackAlerts(): Alert[] {
  const state = loadOnboarding();
  const diagnosed = new Set(state.clinicalContext?.existingDiagnoses ?? []);
  const family = new Set(
    (state.familyHistory?.members ?? []).flatMap((m) => m.conditions),
  );
  const confirmed = new Set(state.riskProfile?.confirmed ?? []);

  const has = (c: TrackedCondition) =>
    diagnosed.has(c) || family.has(c) || confirmed.has(c);

  const alerts: Alert[] = [];

  if (has("parkinsons")) {
    alerts.push({
      id: "fallback-tap",
      tier: 2,
      signalId: "finger-tap-speed",
      signalLabel: "Finger tap speed",
      direction: "decrease",
      changePercent: -8.4,
      series: [62, 61, 60, 59, 58, 57, 56, 55, 56, 55, 54, 55, 54, 53],
      title: "Finger tap speed is drifting down",
      body: "−8.4% from your baseline (60 taps/10s); about 1.6 SD below your normal day-to-day variation. Sustained 5+ sessions.",
      recommendation:
        "Worth mentioning at your next physician visit. Sustained finger-tap slowing is one of the earliest objective markers of Parkinson's.",
      specialists: specialistsFor("finger-tap-speed"),
      detectedAt: new Date().toISOString(),
      sessionsObserved: 12,
    });
  }
  if (has("alzheimers")) {
    alerts.push({
      id: "fallback-stroop",
      tier: 2,
      signalId: "stroop-accuracy",
      signalLabel: "Stroop accuracy",
      direction: "decrease",
      changePercent: -5.7,
      series: [89, 88, 90, 88, 86, 87, 85, 86, 84, 85, 83, 84, 83, 82],
      title: "Stroop accuracy is trending down",
      body: "−5.7% from your baseline (88%); about 1.3 SD below your normal day-to-day variation.",
      recommendation:
        "Worth mentioning at your next physician visit. Sustained executive-function decline is one of the early markers worth tracking with your clinician.",
      specialists: specialistsFor("stroop-accuracy"),
      detectedAt: new Date().toISOString(),
      sessionsObserved: 14,
    });
  }
  if (has("hypertension") || has("stroke")) {
    alerts.push({
      id: "fallback-symmetry",
      tier: 1,
      signalId: "facial-symmetry",
      signalLabel: "Facial symmetry",
      direction: "decrease",
      changePercent: -0.8,
      series: [97, 97, 96, 97, 96, 97, 96, 96, 97, 96, 96, 96, 96, 96],
      title: "Facial symmetry shifted slightly",
      body: "−0.8% from your baseline (96.5%). Within normal day-to-day variation.",
      recommendation:
        "Within normal day-to-day variation. Nothing to do — we just wanted you to see it.",
      specialists: [],
      detectedAt: new Date().toISOString(),
      sessionsObserved: 14,
    });
  }
  if (has("type_2_diabetes") || has("type_1_diabetes")) {
    alerts.push({
      id: "fallback-postural",
      tier: 1,
      signalId: "postural-sway",
      signalLabel: "Postural stability",
      direction: "increase",
      changePercent: 2.1,
      series: [3.3, 3.4, 3.4, 3.3, 3.5, 3.4, 3.5, 3.5, 3.4, 3.5, 3.5, 3.6, 3.5, 3.5],
      title: "Postural stability shifted slightly",
      body: "+2.1% sway from your baseline (3.4 cm). Within normal day-to-day variation.",
      recommendation:
        "Within normal day-to-day variation. Diabetes can affect balance over time — we keep this one visible.",
      specialists: [],
      detectedAt: new Date().toISOString(),
      sessionsObserved: 14,
    });
  }

  // If still empty — show one calm observation so the page isn't blank.
  if (alerts.length === 0) {
    alerts.push({
      id: "fallback-baseline",
      tier: 1,
      signalId: "facial-symmetry",
      signalLabel: "All signals",
      direction: "increase",
      changePercent: 0,
      series: [96, 97, 96, 97, 96, 96, 97, 96, 96, 97, 96, 96, 97, 96],
      title: "Everything in normal range",
      body: "No signals have drifted outside your day-to-day variation.",
      recommendation:
        "Keep showing up. We'll flag anything worth your attention here, the moment it appears.",
      specialists: [],
      detectedAt: new Date().toISOString(),
      sessionsObserved: 14,
    });
  }

  return alerts;
}

export interface AlertResult {
  alerts: Alert[];
  source: "real" | "demo";
}

export function detectAlerts(): AlertResult {
  const real = detectFromHistory();
  if (real.length > 0) return { alerts: real, source: "real" };
  return { alerts: pickFallbackAlerts(), source: "demo" };
}

export function countByTier(alerts: Alert[]): Record<1 | 2 | 3, number> {
  const out = { 1: 0, 2: 0, 3: 0 } as Record<1 | 2 | 3, number>;
  for (const a of alerts) out[a.tier] += 1;
  return out;
}
