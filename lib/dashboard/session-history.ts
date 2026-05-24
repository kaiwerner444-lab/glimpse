// Real session history derived from completed sessions.
//
// When a session finishes, the SessionRunner already produces a
// TaskResult[] (per-task interaction state) and a TaskFeatures[]
// (per-task ML feature payload). saveSessionRecord persists that pair
// to localStorage keyed by session id. The dashboard's signal series
// reads from this store and aggregates one point per session per signal.
//
// In v2 this swaps to a Supabase-backed query so the user sees the
// same chart across devices; the shape of SessionRecord is the same
// either way.

import type { TaskFeatures } from "@/lib/ml/extractor";
import type { TaskResult } from "@/lib/session/types";
import type { SignalSeries } from "./types";
import { buildSignalSeries } from "./synth-data";

export interface SessionRecord {
  id: string;
  completedAt: string;
  kind: "baseline" | "daily";
  features: TaskFeatures[];
  results: TaskResult[];
}

const STORAGE_KEY = "glimpse.session-history";

export function loadSessionRecords(): SessionRecord[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SessionRecord[];
  } catch {
    return [];
  }
}

export function saveSessionRecord(record: SessionRecord): void {
  if (typeof window === "undefined") return;
  const existing = loadSessionRecords();
  // Replace any record with the same id, then prepend; cap at 90 days.
  const next = [
    record,
    ...existing.filter((r) => r.id !== record.id),
  ].slice(0, 90);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  // Notify in-tab listeners so the dashboard refreshes immediately.
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("glimpse-session-saved"));
  }
}

// ─── Signal extraction ────────────────────────────────────────────────

interface SignalExtraction {
  id: string;
  label: string;
  phase: "speech" | "visual" | "movement" | "cognitive";
  unit: string;
  baseline: number;
  // True when a higher value is better (smile amplitude, symmetry, tap
  // speed). False when lower is better (postural sway, tap variability).
  higherIsBetter: boolean;
  blurb: string;
  extract: (
    features: TaskFeatures[],
    results: TaskResult[],
  ) => number | null;
}

const EXTRACTIONS: SignalExtraction[] = [
  {
    id: "facial-symmetry",
    label: "Facial symmetry",
    phase: "visual",
    unit: "%",
    baseline: 96.5,
    higherIsBetter: true,
    blurb: "Mirrored-pair distances around the canonical face midline.",
    extract: (features) => {
      const vals = features
        .map((f) => f.meanSymmetryPercent)
        .filter((v): v is number => typeof v === "number");
      if (vals.length === 0) return null;
      return vals.reduce((a, b) => a + b, 0) / vals.length;
    },
  },
  {
    id: "finger-tap-speed",
    label: "Finger tap speed",
    phase: "movement",
    unit: "taps/10s",
    baseline: 60,
    higherIsBetter: true,
    blurb: "Camera-detected thumb-index pinches over the task window.",
    extract: (features) => {
      const taps = features
        .map((f) => f.tapCount)
        .filter((v): v is number => typeof v === "number" && v > 0);
      if (taps.length === 0) return null;
      // The finger-tap task is 15s; normalise to taps per 10s.
      return (taps.reduce((a, b) => a + b, 0) / taps.length) * (10 / 15);
    },
  },
  {
    id: "postural-sway",
    label: "Postural stability",
    phase: "movement",
    unit: "cm sway",
    baseline: 3.4,
    // Lower sway = more stable.
    higherIsBetter: false,
    blurb:
      "Hip-displacement variance during the arm-hold and balance tasks.",
    extract: (features) => {
      const vals = features
        .map((f) => f.postureSwayCm)
        .filter((v): v is number => typeof v === "number" && v > 0);
      if (vals.length === 0) return null;
      return vals.reduce((a, b) => a + b, 0) / vals.length;
    },
  },
  {
    id: "mean-pitch",
    label: "Mean pitch",
    phase: "speech",
    unit: "Hz",
    baseline: 165,
    higherIsBetter: true,
    blurb:
      "Fundamental frequency across the speech tasks (autocorrelation estimate).",
    extract: (features) => {
      const vals = features
        .map((f) => f.meanPitchHz)
        .filter((v): v is number => typeof v === "number" && v > 0);
      if (vals.length === 0) return null;
      return vals.reduce((a, b) => a + b, 0) / vals.length;
    },
  },
  {
    id: "voiced-ratio",
    label: "Voiced ratio",
    phase: "speech",
    unit: "%",
    baseline: 78,
    higherIsBetter: true,
    blurb:
      "Fraction of frames classified voiced — proxy for speech rate and clarity.",
    extract: (features) => {
      const vals = features
        .map((f) => f.voicedRatio)
        .filter((v): v is number => typeof v === "number");
      if (vals.length === 0) return null;
      return (vals.reduce((a, b) => a + b, 0) / vals.length) * 100;
    },
  },
  {
    id: "stroop-accuracy",
    label: "Stroop accuracy",
    phase: "cognitive",
    unit: "%",
    baseline: 88,
    higherIsBetter: true,
    blurb: "Correct picks on the colour-vs-word task.",
    extract: (_features, results) => {
      const r = results.find(
        (x) =>
          typeof x.stroopCorrect === "number" &&
          typeof x.stroopTotal === "number" &&
          x.stroopTotal > 0,
      );
      if (!r || !r.stroopTotal) return null;
      return (r.stroopCorrect! / r.stroopTotal) * 100;
    },
  },
];

export interface RealSeriesResult {
  series: SignalSeries[];
  source: "real" | "demo";
  sessionCount: number;
}

export function buildSignalSeriesFromHistory(maxPoints = 14): RealSeriesResult {
  const records = loadSessionRecords().slice().reverse(); // oldest → newest

  if (records.length === 0) {
    return {
      series: buildSignalSeries(),
      source: "demo",
      sessionCount: 0,
    };
  }

  // We keep up to maxPoints-1 real sessions so we have room to prepend
  // the baseline as the anchor point. The chart always reads as
  // "baseline → session_1 → ... → session_N", which renders cleanly even
  // when there's only one real session.
  const recent = records.slice(-(maxPoints - 1));
  const series: SignalSeries[] = EXTRACTIONS.map((e) => {
    const realPoints: number[] = [];
    for (const rec of recent) {
      const v = e.extract(rec.features, rec.results);
      if (v !== null) realPoints.push(round(v));
    }

    // Always anchor with the user's baseline. This means a fresh user
    // sees: 1 session → 2-point chart (baseline → today). 5 sessions →
    // 6 points. And so on, up to maxPoints. If we have zero real points
    // for this signal across all sessions, the chart still renders as a
    // flat baseline-only line so the card is never empty.
    const points = [e.baseline, ...realPoints];

    const direction = computeDirection(realPoints, e.baseline, e.higherIsBetter);
    return {
      id: e.id,
      label: e.label,
      phase: e.phase,
      unit: e.unit,
      points,
      baseline: e.baseline,
      direction,
      blurb: buildBlurb(realPoints, e, records.length),
    };
  });

  return { series, source: "real", sessionCount: records.length };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

// realPoints is just the captured session readings (no baseline prepend).
// Direction is computed from those vs the canonical baseline.
function computeDirection(
  realPoints: number[],
  baseline: number,
  higherIsBetter: boolean,
): SignalSeries["direction"] {
  if (realPoints.length === 0) return "stable";
  const latest = realPoints[realPoints.length - 1];
  const pct = ((latest - baseline) / baseline) * 100;
  const improvingThreshold = 3;
  const watchThreshold = -3;
  const signed = higherIsBetter ? pct : -pct;
  if (signed >= improvingThreshold) return "improving";
  if (signed <= watchThreshold) return "watch";
  return "stable";
}

function buildBlurb(
  realPoints: number[],
  e: SignalExtraction,
  totalSessions: number,
): string {
  if (realPoints.length === 0) {
    return `${e.blurb} Not captured in the last ${totalSessions} ${
      totalSessions === 1 ? "session" : "sessions"
    } — try a session that includes this measure.`;
  }
  const latest = realPoints[realPoints.length - 1];
  const pct = ((latest - e.baseline) / e.baseline) * 100;
  const direction = computeDirection(realPoints, e.baseline, e.higherIsBetter);
  const sessionWord = realPoints.length === 1 ? "session" : "sessions";
  const measured = `Compared against your baseline (${e.baseline} ${e.unit}) over ${realPoints.length} ${sessionWord}.`;
  if (direction === "improving") {
    return `${e.blurb} ${measured} ${pct >= 0 ? "+" : ""}${pct.toFixed(1)}% in the right direction.`;
  }
  if (direction === "watch") {
    return `${e.blurb} ${measured} ${Math.abs(pct).toFixed(1)}% from baseline — keep an eye on it.`;
  }
  return `${e.blurb} ${measured} Holding within normal day-to-day variation.`;
}

// Lets components subscribe to live updates after a session lands.
export function onSessionSaved(handler: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener("glimpse-session-saved", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("glimpse-session-saved", handler);
    window.removeEventListener("storage", handler);
  };
}
