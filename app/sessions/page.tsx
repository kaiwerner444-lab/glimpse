"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import {
  loadSessionRecords,
  onSessionSaved,
  type SessionRecord,
} from "@/lib/dashboard/session-history";
import { averageScore } from "@/lib/session/scoring";
import { useRequireAuth } from "@/lib/auth/require-auth";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

interface SessionSummary {
  record: SessionRecord;
  avgScore: number;
  completedTasks: number;
  totalTasks: number;
}

function summarise(record: SessionRecord): SessionSummary {
  const scores = record.results
    .map((r) => r.taskScore)
    .filter((s): s is number => typeof s === "number");
  return {
    record,
    avgScore: averageScore(scores),
    completedTasks: record.results.filter((r) => !r.skipped).length,
    totalTasks: record.results.length,
  };
}

export default function SessionsPage() {
  const ready = useRequireAuth();
  const [records, setRecords] = useState<SessionRecord[]>([]);

  useEffect(() => {
    const sync = () => setRecords(loadSessionRecords());
    sync();
    return onSessionSaved(sync);
  }, []);

  const summaries = useMemo(
    () => records.map(summarise),
    [records],
  );

  if (!ready) {
    return <div className="min-h-dvh bg-surface-alt" aria-busy />;
  }

  return (
    <div className="min-h-dvh bg-surface-alt">
      <header className="px-4 sm:px-6 lg:px-8 max-w-4xl w-full mx-auto py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/home"
            className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <span className="text-ink-subtle">·</span>
          <Link href="/" aria-label="Glimpse home">
            <Logo showWordmark={false} />
          </Link>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 max-w-4xl w-full mx-auto py-6 sm:py-10 flex flex-col gap-8">
        <Reveal>
          <section>
            <p className="text-sm font-medium uppercase tracking-wider text-brand-500 mb-2">
              Sessions
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-ink">
              Every session you&apos;ve completed
            </h1>
            <p className="mt-3 text-lg text-ink-muted max-w-2xl leading-relaxed">
              Tap any session to read through your answers, see per-task
              scores, and review what the camera and microphone picked up.
            </p>
          </section>
        </Reveal>

        {summaries.length === 0 ? (
          <section className="glimpse-card p-8 text-center">
            <p className="text-base text-ink-muted">
              You haven&apos;t completed a session yet. Start with the daily
              ritual on the dashboard.
            </p>
          </section>
        ) : (
          <ul className="flex flex-col gap-3">
            {summaries.map((s, i) => (
              <Reveal key={s.record.id} delay={i * 0.04}>
                <li>
                  <Link
                    href={`/sessions/${s.record.id}`}
                    className="glimpse-card p-5 flex items-center gap-4 transition hover:shadow-card group"
                  >
                    <ScoreBadge value={s.avgScore} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-base font-semibold text-ink truncate">
                          {formatDate(s.record.completedAt)}
                        </p>
                        <span className="text-xs uppercase tracking-wider text-ink-subtle">
                          {s.record.kind}
                        </span>
                      </div>
                      <p className="text-sm text-ink-muted mt-0.5">
                        {s.completedTasks} of {s.totalTasks} tasks completed
                        {s.completedTasks === s.totalTasks ? (
                          <CheckCircle2 className="inline h-3.5 w-3.5 text-success ml-1.5 -mt-0.5" />
                        ) : (
                          <AlertTriangle className="inline h-3.5 w-3.5 text-warn ml-1.5 -mt-0.5" />
                        )}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-ink-subtle group-hover:text-brand-500 group-hover:translate-x-0.5 transition shrink-0" />
                  </Link>
                </li>
              </Reveal>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

function ScoreBadge({ value }: { value: number }) {
  const tone =
    value >= 80
      ? { bg: "bg-success/15", text: "text-success" }
      : value >= 60
        ? { bg: "bg-brand-50", text: "text-brand-600" }
        : { bg: "bg-warn/15", text: "text-warn" };
  return (
    <div
      className={cn(
        "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0",
        tone.bg,
      )}
    >
      <span className={cn("text-lg font-bold tabular-nums", tone.text)}>
        {value}
      </span>
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
