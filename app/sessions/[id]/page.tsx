"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Quote,
  Mic,
  Eye,
  Activity,
  Brain,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import {
  loadSessionRecords,
  type SessionRecord,
} from "@/lib/dashboard/session-history";
import { averageScore } from "@/lib/session/scoring";
import { useRequireAuth } from "@/lib/auth/require-auth";
import { Reveal } from "@/components/motion/Reveal";
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
        .map((r) => r.taskScore)
        .filter((s): s is number => typeof s === "number") ?? [],
    [record],
  );
  const avg = averageScore(scores);

  if (!ready) {
    return <div className="min-h-dvh bg-surface-alt" aria-busy />;
  }

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

      <main className="px-4 sm:px-6 lg:px-8 max-w-4xl w-full mx-auto py-6 sm:py-10 flex flex-col gap-8">
        {!record ? (
          <section className="glimpse-card p-8 text-center">
            <p className="text-base text-ink-muted">
              We couldn&apos;t find that session on this device.
            </p>
          </section>
        ) : (
          <>
            <Reveal>
              <section>
                <p className="text-sm font-medium uppercase tracking-wider text-brand-500 mb-2">
                  Session detail · {record.kind}
                </p>
                <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-ink">
                  {formatDate(record.completedAt)}
                </h1>
                <div className="mt-4 flex items-center gap-4 flex-wrap">
                  <Stat label="Overall" value={`${avg}/100`} big />
                  <Stat
                    label="Tasks"
                    value={`${record.results.filter((r) => !r.skipped).length} / ${record.results.length}`}
                  />
                  <Stat
                    label="Captured speech"
                    value={`${record.results.filter((r) => r.speechTranscript).length} task${record.results.filter((r) => r.speechTranscript).length === 1 ? "" : "s"}`}
                  />
                </div>
              </section>
            </Reveal>

            <section className="flex flex-col gap-3">
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

function TaskCard({ result }: { result: TaskResult }) {
  const score = result.taskScore;
  const tone =
    typeof score !== "number"
      ? "neutral"
      : score >= 80
        ? "good"
        : score >= 60
          ? "ok"
          : "watch";
  const toneCls = {
    neutral: "bg-black/[0.04] text-ink-muted",
    good: "bg-success/15 text-success",
    ok: "bg-brand-50 text-brand-600",
    watch: "bg-warn/15 text-warn",
  }[tone];

  // Map taskId prefix back to phase for the leading icon.
  const phaseIcon = result.taskId.includes("speech") ? (
    <Mic className="h-4 w-4" />
  ) : result.taskId.includes("visual") ? (
    <Eye className="h-4 w-4" />
  ) : result.taskId.includes("movement") ? (
    <Activity className="h-4 w-4" />
  ) : (
    <Brain className="h-4 w-4" />
  );

  return (
    <article
      className={cn(
        "glimpse-card p-5",
        result.skipped && "opacity-70",
      )}
    >
      <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="h-9 w-9 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center shrink-0">
            {phaseIcon}
          </span>
          <div className="min-w-0">
            <p className="text-base font-semibold text-ink truncate">
              {prettyTaskId(result.taskId)}
            </p>
            <p className="text-xs text-ink-muted mt-0.5">
              {result.skipped ? "Skipped" : "Completed"}
              <span className="mx-1.5 text-ink-subtle">·</span>
              {duration(result.startedAt, result.endedAt)}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "inline-flex items-center justify-center h-9 min-w-[3.5rem] rounded-xl text-sm font-bold tabular-nums px-3 shrink-0",
            toneCls,
          )}
        >
          {typeof score === "number" ? score : "—"}
        </span>
      </div>

      {result.taskScoreNote ? (
        <p className="text-sm text-ink-muted leading-relaxed">
          {result.taskScoreNote}
        </p>
      ) : null}

      {result.speechTranscript ? (
        <div className="mt-3 rounded-xl bg-surface-alt border border-black/[0.04] px-4 py-3 flex items-start gap-2.5">
          <Quote className="h-4 w-4 text-ink-subtle mt-1 shrink-0" />
          <p className="text-base text-ink leading-relaxed italic">
            {result.speechTranscript}
          </p>
        </div>
      ) : null}

      {/* Surface interactive task captures inline */}
      {typeof result.fingerTapCount === "number" ? (
        <p className="text-sm text-ink-muted mt-2">
          Detected pinches: <span className="font-medium text-ink">{result.fingerTapCount}</span>
        </p>
      ) : null}
      {typeof result.stroopCorrect === "number" &&
      typeof result.stroopTotal === "number" ? (
        <p className="text-sm text-ink-muted mt-2">
          Stroop: <span className="font-medium text-ink">{result.stroopCorrect} / {result.stroopTotal}</span>
        </p>
      ) : null}
      {typeof result.trailCompletionSeconds === "number" ? (
        <p className="text-sm text-ink-muted mt-2">
          Trail Making: <span className="font-medium text-ink">{result.trailCompletionSeconds.toFixed(1)}s · {result.trailErrors ?? 0} errors</span>
        </p>
      ) : null}
      {typeof result.spiralMeanDeviation === "number" ? (
        <p className="text-sm text-ink-muted mt-2">
          Spiral deviation: <span className="font-medium text-ink">{(result.spiralMeanDeviation * 100).toFixed(1)}%</span>
        </p>
      ) : null}
    </article>
  );
}

function Stat({
  label,
  value,
  big,
}: {
  label: string;
  value: string;
  big?: boolean;
}) {
  return (
    <div className="glimpse-card px-4 py-3">
      <p className="text-[10px] uppercase tracking-wider text-ink-subtle">
        {label}
      </p>
      <p
        className={cn(
          "font-semibold text-ink tabular-nums mt-0.5",
          big ? "text-2xl" : "text-base",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function prettyTaskId(id: string): string {
  return id
    .replace(/^daily-|^baseline-|^d\d+$/, "")
    .replace(/-d\d+$/, "")
    .replace(/-/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
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
