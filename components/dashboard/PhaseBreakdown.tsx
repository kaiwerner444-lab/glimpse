"use client";

import { Mic, Eye, Activity, Brain } from "lucide-react";
import { taskMetaFor } from "@/lib/session/task-names";
import type { TaskResult } from "@/lib/session/types";
import { cn } from "@/lib/utils";

interface PhaseBreakdownProps {
  results: TaskResult[];
}

const PHASE_META = {
  speech: { label: "Speech", icon: Mic },
  visual: { label: "Visual", icon: Eye },
  movement: { label: "Movement", icon: Activity },
  cognitive: { label: "Cognitive", icon: Brain },
} as const;

const PHASES: Array<keyof typeof PHASE_META> = [
  "speech",
  "visual",
  "movement",
  "cognitive",
];

// Per-phase score bars. Each phase aggregates its task scores into an
// average. Skipped tasks (score 0) are excluded so a single skipped
// task doesn't drag the phase down to look like a failure.
export function PhaseBreakdown({ results }: PhaseBreakdownProps) {
  const buckets = PHASES.reduce(
    (acc, p) => ({ ...acc, [p]: [] as number[] }),
    {} as Record<keyof typeof PHASE_META, number[]>,
  );
  for (const r of results) {
    if (r.skipped || typeof r.taskScore !== "number" || r.taskScore === 0) continue;
    const phase = taskMetaFor(r.taskId).phase;
    buckets[phase].push(r.taskScore);
  }

  const avgs = PHASES.map((p) => {
    const arr = buckets[p];
    return {
      phase: p,
      avg:
        arr.length === 0
          ? null
          : Math.round(arr.reduce((a, b) => a + b, 0) / arr.length),
      count: arr.length,
    };
  });

  // If literally nothing scored — skip the section entirely.
  if (avgs.every((a) => a.avg === null)) return null;

  return (
    <section className="glimpse-card p-6">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-subtle mb-4">
        By phase
      </p>
      <ul className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-5">
        {avgs.map(({ phase, avg, count }) => {
          const Meta = PHASE_META[phase];
          const Icon = Meta.icon;
          const tone =
            avg === null
              ? "bg-black/[0.06]"
              : avg >= 80
                ? "bg-success"
                : avg >= 60
                  ? "bg-brand-500"
                  : "bg-warn";
          const ratio = avg === null ? 0 : avg / 100;
          return (
            <li key={phase}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted">
                  <Icon className="h-3.5 w-3.5" />
                  {Meta.label}
                </span>
                <span className="text-sm font-semibold text-ink tabular-nums">
                  {avg === null ? "—" : avg}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-black/[0.06] overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-[width] duration-1000 ease-out",
                    tone,
                  )}
                  style={{ width: `${ratio * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-ink-subtle mt-1 tabular-nums">
                {count} {count === 1 ? "task" : "tasks"}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
