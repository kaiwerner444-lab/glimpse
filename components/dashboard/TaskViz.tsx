"use client";

import { Quote } from "lucide-react";
import type { TaskResult } from "@/lib/session/types";
import { taskMetaFor } from "@/lib/session/task-names";
import { cn } from "@/lib/utils";

interface TaskVizProps {
  result: TaskResult;
}

// Renders a task-type-appropriate inline visualisation in the session
// detail card. Keeps each viz under ~80px tall so the page reads as a
// scrolling list of glanceable instruments, not a wall of charts.
export function TaskViz({ result }: TaskVizProps) {
  const meta = taskMetaFor(result.taskId);

  if (result.skipped) {
    return null;
  }

  // Stroop — donut of correct vs total trials.
  if (
    typeof result.stroopCorrect === "number" &&
    typeof result.stroopTotal === "number" &&
    result.stroopTotal > 0
  ) {
    return (
      <StroopDonut correct={result.stroopCorrect} total={result.stroopTotal} />
    );
  }

  // Trail Making — time bar + error pips.
  if (typeof result.trailCompletionSeconds === "number") {
    return (
      <TrailVisualization
        seconds={result.trailCompletionSeconds}
        errors={result.trailErrors ?? 0}
      />
    );
  }

  // Spiral drawing — deviation gauge.
  if (typeof result.spiralMeanDeviation === "number") {
    return <SpiralGauge deviation={result.spiralMeanDeviation} />;
  }

  // Finger tap — horizontal bar showing taps over the 15s window
  // against the healthy reference range (~50-70 taps).
  if (typeof result.fingerTapCount === "number" && meta.kind === "finger_tap") {
    return <FingerTapBar count={result.fingerTapCount} />;
  }

  // Speech tasks — transcript quote block (if captured) or word-count
  // bar (if just acoustic).
  if (
    meta.phase === "speech" &&
    (result.speechTranscript || result.taskScoreNote)
  ) {
    return <SpeechTranscript transcript={result.speechTranscript} />;
  }

  // Symmetry / instruction holds — single-value horizontal gauge fed
  // from the scoreNote. The note is the source of truth for the
  // metric copy at this point (e.g. "98.4% facial symmetry").
  if (meta.kind === "smile_hold" || meta.kind === "neutral_hold") {
    return <SymmetryGauge note={result.taskScoreNote ?? ""} />;
  }

  if (meta.kind === "arm_hold" || meta.kind === "single_leg_stance") {
    return <SwayGauge note={result.taskScoreNote ?? ""} />;
  }

  return null;
}

// ─── Stroop donut ────────────────────────────────────────────────────

function StroopDonut({ correct, total }: { correct: number; total: number }) {
  const size = 64;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = correct / total;
  const offset = c * (1 - pct);
  const tone =
    pct >= 0.85 ? "#2F855A" : pct >= 0.6 ? "#00707E" : "#B7791F";
  return (
    <div className="flex items-center gap-4 mt-3">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="rgba(14, 20, 19, 0.08)"
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={tone}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{
              transition:
                "stroke-dashoffset 1.2s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold tabular-nums">
            {Math.round(pct * 100)}
            <span className="text-[10px] text-ink-muted ml-0.5">%</span>
          </span>
        </div>
      </div>
      <div>
        <p className="text-sm text-ink font-medium tabular-nums">
          {correct} / {total} correct
        </p>
        <p className="text-xs text-ink-muted mt-0.5">Colour-vs-word task</p>
      </div>
    </div>
  );
}

// ─── Trail Making ────────────────────────────────────────────────────

function TrailVisualization({
  seconds,
  errors,
}: {
  seconds: number;
  errors: number;
}) {
  // 15s = healthy fast. 60s = upper bound for the bar.
  const pct = Math.min(1, seconds / 60);
  const tone =
    seconds <= 20 ? "bg-success" : seconds <= 40 ? "bg-brand-500" : "bg-warn";
  return (
    <div className="mt-3 flex items-center gap-4">
      <div className="flex-1">
        <div className="flex items-center justify-between text-[11px] text-ink-subtle mb-1.5 tabular-nums">
          <span>Completion time</span>
          <span>{seconds.toFixed(1)}s</span>
        </div>
        <div className="h-2 rounded-full bg-black/[0.06] overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-[width] duration-1000 ease-out", tone)}
            style={{ width: `${pct * 100}%` }}
          />
        </div>
      </div>
      <div className="shrink-0">
        <p className="text-[11px] uppercase tracking-wider text-ink-subtle">
          Errors
        </p>
        <div className="flex items-center gap-1 mt-1">
          {errors === 0 ? (
            <span className="text-sm text-success font-semibold">None</span>
          ) : (
            Array.from({ length: Math.min(errors, 5) }).map((_, i) => (
              <span
                key={i}
                className="h-2 w-2 rounded-full bg-warn"
                aria-hidden
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Spiral deviation ────────────────────────────────────────────────

function SpiralGauge({ deviation }: { deviation: number }) {
  // 0.03 = smooth, 0.12 = noticeable tremor.
  const pct = Math.min(1, deviation / 0.12);
  const tone =
    deviation < 0.04
      ? "bg-success"
      : deviation < 0.07
        ? "bg-brand-500"
        : "bg-warn";
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-[11px] text-ink-subtle mb-1.5 tabular-nums">
        <span>Deviation from template</span>
        <span>{(deviation * 100).toFixed(1)}%</span>
      </div>
      <div className="h-2 rounded-full bg-black/[0.06] overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-[width] duration-1000 ease-out", tone)}
          style={{ width: `${pct * 100}%` }}
        />
      </div>
    </div>
  );
}

// ─── Finger tap bar ──────────────────────────────────────────────────

function FingerTapBar({ count }: { count: number }) {
  // Healthy adult range ~50-70 taps in 15s. 80 caps the bar.
  const pct = Math.min(1, count / 80);
  const tone =
    count >= 50 ? "bg-success" : count >= 35 ? "bg-brand-500" : "bg-warn";
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-[11px] text-ink-subtle mb-1.5 tabular-nums">
        <span>Detected pinches in 15s</span>
        <span>{count} pinches</span>
      </div>
      <div className="h-2 rounded-full bg-black/[0.06] overflow-hidden relative">
        <div
          className={cn("h-full rounded-full transition-[width] duration-1000 ease-out", tone)}
          style={{ width: `${pct * 100}%` }}
        />
        {/* Healthy adult reference marker at 60 taps */}
        <div
          aria-hidden
          className="absolute top-[-2px] bottom-[-2px] w-px bg-ink/40"
          style={{ left: `${(60 / 80) * 100}%` }}
        />
      </div>
      <p className="text-[10px] text-ink-subtle mt-1.5 tabular-nums">
        Reference healthy adult range: 50–70
      </p>
    </div>
  );
}

// ─── Speech transcript ───────────────────────────────────────────────

function SpeechTranscript({ transcript }: { transcript?: string }) {
  if (!transcript) {
    return (
      <div className="mt-3 rounded-xl bg-surface-alt border border-black/[0.04] px-4 py-3 text-sm text-ink-muted italic">
        Acoustic features captured. No transcript — give Glimpse mic
        permission next time for a richer read.
      </div>
    );
  }
  const wordCount = transcript.split(/\s+/).filter(Boolean).length;
  return (
    <div className="mt-3">
      <div className="rounded-xl bg-surface-alt border border-black/[0.04] px-4 py-3 flex items-start gap-2.5">
        <Quote className="h-3.5 w-3.5 text-ink-subtle mt-1 shrink-0" />
        <p className="text-base text-ink leading-relaxed italic">{transcript}</p>
      </div>
      <p className="text-[10px] text-ink-subtle mt-2 tabular-nums">
        {wordCount} {wordCount === 1 ? "word" : "words"} captured
      </p>
    </div>
  );
}

// ─── Symmetry gauge (visual smile / neutral hold) ────────────────────

function SymmetryGauge({ note }: { note: string }) {
  // Parse a "98.4% facial symmetry" style note.
  const match = note.match(/([\d.]+)\s*%/);
  const value = match ? parseFloat(match[1]) : 0;
  // 100% = perfect mirror. 92% = visible asymmetry.
  const range = 92;
  const pct = value > range ? (value - range) / (100 - range) : 0;
  const tone =
    value >= 97
      ? "bg-success"
      : value >= 95
        ? "bg-brand-500"
        : "bg-warn";
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-[11px] text-ink-subtle mb-1.5 tabular-nums">
        <span>Facial symmetry</span>
        <span>{value.toFixed(1)}%</span>
      </div>
      <div className="h-2 rounded-full bg-black/[0.06] overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-[width] duration-1000 ease-out", tone)}
          style={{ width: `${Math.max(8, pct * 100)}%` }}
        />
      </div>
    </div>
  );
}

// ─── Sway gauge (arm hold / single-leg stance) ───────────────────────

function SwayGauge({ note }: { note: string }) {
  const match = note.match(/([\d.]+)\s*cm/);
  const value = match ? parseFloat(match[1]) : 0;
  // 0.5cm = excellent, 6cm = upper bound shown.
  const pct = Math.min(1, value / 6);
  const tone =
    value < 1.5 ? "bg-success" : value < 3 ? "bg-brand-500" : "bg-warn";
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-[11px] text-ink-subtle mb-1.5 tabular-nums">
        <span>Postural sway</span>
        <span>{value.toFixed(1)} cm</span>
      </div>
      <div className="h-2 rounded-full bg-black/[0.06] overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-[width] duration-1000 ease-out", tone)}
          style={{ width: `${Math.max(6, pct * 100)}%` }}
        />
      </div>
    </div>
  );
}
