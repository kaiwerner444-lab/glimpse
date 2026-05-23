// Synthetic dashboard data. Replaced by real time-series queries in v2.
// Curves are gently shaped so the demo conveys movement without being
// alarming — no value here represents a real diagnosis.

import type { SignalSeries } from "./types";

function jitter(base: number, amplitude: number, n: number, slope = 0): number[] {
  const out: number[] = [];
  let prev = base;
  for (let i = 0; i < n; i += 1) {
    const drift = slope * i;
    // Smooth random walk biased toward the trend line.
    const target = base + drift;
    const noise = (Math.random() - 0.5) * amplitude * 0.7;
    prev = prev * 0.55 + (target + noise) * 0.45;
    out.push(Math.round(prev * 100) / 100);
  }
  return out;
}

export function buildSignalSeries(seed = 0): SignalSeries[] {
  // Deterministic-ish across reloads by seeding Math.random via fixed offsets.
  // We're not aiming for crypto-quality randomness — just a stable demo feel.
  Math.random = mulberry32(seed || 42);

  return [
    {
      id: "speech-rhythm",
      label: "Speech rhythm",
      phase: "speech",
      unit: "wpm",
      points: jitter(128, 6, 14, 0.4),
      baseline: 128,
      direction: "improving",
      blurb: "Your reading pace has trended up slightly. Articulation has stayed clean.",
    },
    {
      id: "facial-symmetry",
      label: "Facial symmetry",
      phase: "visual",
      unit: "%",
      points: jitter(97, 1.5, 14, 0.05),
      baseline: 96.5,
      direction: "stable",
      blurb: "No drift from your baseline — both sides of your face track together.",
    },
    {
      id: "finger-tap-speed",
      label: "Finger tap speed",
      phase: "movement",
      unit: "taps/10s",
      points: jitter(58, 4, 14, -0.25),
      baseline: 60,
      direction: "watch",
      blurb: "A small dip over the past week. Could be sleep, hydration, or stress — worth noticing.",
    },
    {
      id: "verbal-fluency",
      label: "Verbal fluency",
      phase: "speech",
      unit: "words/60s",
      points: jitter(22, 2, 14, 0.18),
      baseline: 22,
      direction: "improving",
      blurb: "More words per minute on the fluency task — your warm-up is working.",
    },
    {
      id: "postural-sway",
      label: "Postural stability",
      phase: "movement",
      unit: "cm sway",
      points: jitter(3.2, 0.4, 14, -0.03),
      baseline: 3.4,
      direction: "improving",
      blurb: "Less sway during the single-leg stance — your balance is steadier.",
    },
    {
      id: "stroop-accuracy",
      label: "Stroop accuracy",
      phase: "cognitive",
      unit: "%",
      points: jitter(89, 3, 14, 0.15),
      baseline: 88,
      direction: "stable",
      blurb: "Holding right at your baseline. Reaction time still well within range.",
    },
  ];
}

// Tiny seeded RNG so the demo is stable across reloads.
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function percentChange(points: number[]): number {
  if (points.length < 2) return 0;
  const first = points[0];
  const last = points[points.length - 1];
  if (first === 0) return 0;
  return ((last - first) / first) * 100;
}
