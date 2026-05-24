"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mic,
  Eye,
  Activity,
  Brain,
  CheckCircle2,
  CircleSlash,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import {
  loadSessionRecords,
  type SessionRecord,
} from "@/lib/dashboard/session-history";
import { averageScore } from "@/lib/session/scoring";
import { useRequireAuth } from "@/lib/auth/require-auth";
import { Reveal } from "@/components/motion/Reveal";
import { ScoreRing } from "@/components/dashboard/ScoreRing";
import { PhaseBreakdown } from "@/components/dashboard/PhaseBreakdown";
import { TaskViz } from "@/components/dashboard/TaskViz";
import { taskMetaFor, type TaskMeta } from "@/lib/session/task-names";
import { cn } from "@/lib/utils";
import type { TaskResult } from "@/lib/session/types";

export default function SessionDetailPage() {
  const ready = useRequireAuth();
  const params = useParams<{ id: string }>();
  const [record, setRecord] = useState<SessionRecord | null>(null);

  useEffect(() => {
    const recs = loadSessionRecords();
    const found = recs.find((r) => r.id === params?.id) ?? null;
    setRecord(found);
  }, [params?.id]);

  const scores = useMemo(
    () =>
      record?.results
        .filter((r) => !r.skipped && typeof r.taskScore === "number" && r.taskScore > 0)
        .map((r) => r.taskScore as number) ?? [],
    [record],
  );
  const avg = averageScore(scores);

  if (!ready) {
    return <div className="min-h-dvh bg-surface-alt" aria-busy />;
  }

  const completedCount = record
    ? record.results.filter((r) => !r.skipped).length
    : 0;
  const transcriptCount = record
    ? record.results.filter((r) => r.speechTranscript).length
    : 0;

  return (
    <div className="min-h-dvh bg-surface-alt">
      <header className="px-4 sm:px-6 lg:px-8 max-w-4xl w-full mx-auto py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/sessions"
            className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
            All sessions
          </Link>
          <span className="text-ink-subtle">·</span>
          <Link href="/" aria-label="Glimpse home">
            <Logo showWordmark={false} />
          </Link>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 max-w-4xl w-full mx-auto py-6 sm:py-10 flex flex-col gap-6">
        {!record ? (
          <section className="glimpse-card p-8 text-center">
            <p className="text-base text-ink-muted">
              We couldn&apos;t find that session on this device.
            </p>
          </section>
        ) : (
          <>
            {/* Hero — score ring + meta */}
            <Reveal>
              <section className="glimpse-card p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-6">
                <ScoreRing
                  value={avg}
                  label="Overall"
                  sublabel={`${completedCount} of ${record.results.length} tasks`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-brand-600 mb-2">
                    Session detail · {record.kind}
                  </p>
                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink leading-tight">
                    {formatDate(record.completedAt)}
                  </h1>
                  <dl className="mt-5 grid grid-cols-3 gap-4">
                    <Stat label="Completed" value={`${completedCount}/${record.results.length}`} />
                    <Stat
                      label="Speech captured"
                      value={`${transcriptCount}`}
                    />
                    <Stat
                      label="Frames analysed"
                      value={record.features
                        .reduce((acc, f) => acc + (f.framesAnalysed || 0), 0)
                        .toLocaleString()}
                    />
                  </dl>
                </div>
              </section>
            </Reveal>

            {/* Phase breakdown */}
            <Reveal delay={0.06}>
              <PhaseBreakdown results={record.results} />
            </Reveal>

            {/* Task list */}
            <section className="flex flex-col gap-3 mt-2">
              {record.results.map((r, i) => (
                <Reveal key={r.taskId + i} delay={i * 0.03}>
                  <TaskCard result={r} />
                </Reveal>
              ))}
            </section>

            <footer className="text-sm text-ink-muted leading-relaxed pt-2">
              Scores are a soft heuristic from the captured features — they
              are not a clinical grade. The longitudinal signal is what
              matters; one bad morning isn&apos;t.
            </footer>
          </>
        )}
      </main>
    </div>
  );
}

const PHASE_ICONS: Record<TaskMeta["phase"], React.ReactNode> = {
  speech: <Mic className="h-4 w-4" />,
  visual: <Eye className="h-4 w-4" />,
  movement: <Activity className="h-4 w-4" />,
  cognitive: <Brain className="h-4 w-4" />,
};

function TaskCard({ result }: { result: TaskResult }) {
  const meta = taskMetaFor(result.taskId);
  const score = result.taskScore ?? 0;

  const tone =
    result.skipped
      ? { badge: "bg-black/[0.05] text-ink-subtle", border: "border-black/[0.04]" }
      : score >= 80
        ? { badge: "bg-success/15 text-success", border: "border-success/20" }
        : score >= 60
          ? { badge: "bg-brand-50 text-brand-600", border: "border-black/[0.04]" }
          : { badge: "bg-warn/15 text-warn", border: "border-warn/20" };

  return (
    <article
      className={cn(
        "glimpse-card p-5 transition",
        result.skipped && "opacity-75",
        tone.border,
      )}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <span className="h-10 w-10 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center shrink-0">
            {PHASE_ICONS[meta.phase]}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-base font-semibold text-ink leading-tight">
                {meta.name}
              </p>
              <span className="inline-flex items-center gap-1 rounded-full bg-black/[0.04] text-ink-muted text-[10px] uppercase tracking-wider font-medium px-2 py-0.5">
                {meta.phase}
              </span>
            </div>
            <p className="text-xs text-ink-muted mt-1 inline-flex items-center gap-1.5">
              {result.skipped ? (
                <>
                  <CircleSlash className="h-3 w-3" />
                  Skipped
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3 w-3 text-success" />
                  Completed
                </>
              )}
              <span className="text-ink-subtle">·</span>
              <span className="tabular-nums">
                {duration(result.startedAt, result.endedAt)}
              </span>
            </p>
          </div>
        </div>
        <span
          className={cn(
            "inline-flex items-center justify-center h-9 min-w-[3.5rem] rounded-xl text-sm font-bold tabular-nums px-3 shrink-0",
            tone.badge,
          )}
        >
          {result.skipped ? "—" : score}
        </span>
      </div>

      {/* Task-type-specific visualisation */}
      <TaskViz result={result} />

      {/* Score note as a tail caption — only when something was actually
          measured. */}
      {!result.skipped && result.taskScoreNote ? (
        <p className="text-sm text-ink-muted leading-relaxed mt-3">
          {result.taskScoreNote}
        </p>
      ) : null}
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wider text-ink-subtle">
        {label}
      </dt>
      <dd className="text-base font-semibold text-ink tabular-nums mt-0.5">
        {value}
      </dd>
    </div>
  );
}

function duration(start: string, end: string): string {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (ms < 0 || Number.isNaN(ms)) return "—";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${s - m * 60}s`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
