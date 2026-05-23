"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  Share2,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Sparkline } from "@/components/dashboard/Sparkline";
import { SensorReportSection } from "@/components/dashboard/SensorReportSection";
import {
  buildLongSignalSeries,
  percentChange,
} from "@/lib/dashboard/synth-data";
import { loadGamification } from "@/lib/gamification/state";
import { loadOnboarding } from "@/lib/db/mock-db";
import { useRequireAuth } from "@/lib/auth/require-auth";
import { loadFeedback } from "@/lib/feedback/storage";
import { type ActivityFeedback } from "@/lib/feedback/types";
import type { SignalSeries } from "@/lib/dashboard/types";
import { cn } from "@/lib/utils";

type Window = "week" | "month";

export default function ReportsPage() {
  const ready = useRequireAuth();
  const [windowChoice, setWindowChoice] = useState<Window>("month");
  const [name, setName] = useState<string>("");
  const [streak, setStreak] = useState<number>(5);
  const [sessions, setSessions] = useState<number>(12);
  const [feedback, setFeedback] = useState<ActivityFeedback[]>([]);

  useEffect(() => {
    const s = loadOnboarding();
    if (s.account?.email) {
      const local = s.account.email.split("@")[0];
      setName(capitalize(local.replace(/[._-]/g, " ").split(" ")[0]));
    }
    const g = loadGamification();
    if (g.totalSessions > 0) {
      setStreak(g.currentStreak);
      setSessions(g.totalSessions);
    }
    setFeedback(loadFeedback());
  }, []);

  const feedbackSummary = useMemo(() => {
    const total = feedback.length;
    if (total === 0) return null;
    const tooHard = feedback.filter((f) => f.rating === "too_hard").length;
    const justRight = feedback.filter((f) => f.rating === "just_right").length;
    const tooEasy = feedback.filter((f) => f.rating === "too_easy").length;
    const bodyIssues = feedback.filter((f) => f.bodyIssueFlag).length;
    // Most-flagged task overall.
    const counts = new Map<string, { hard: number; total: number; title: string }>();
    for (const f of feedback) {
      const c = counts.get(f.taskId) ?? {
        hard: 0,
        total: 0,
        title: f.taskTitle,
      };
      c.total += 1;
      if (f.rating === "too_hard") c.hard += 1;
      counts.set(f.taskId, c);
    }
    const mostFlagged = Array.from(counts.entries())
      .filter(([, c]) => c.hard > 0)
      .sort((a, b) => b[1].hard - a[1].hard)[0];
    return {
      total,
      tooHard,
      justRight,
      tooEasy,
      bodyIssues,
      mostFlagged: mostFlagged ? mostFlagged[1] : null,
    };
  }, [feedback]);

  const days = windowChoice === "week" ? 7 : 30;
  const series = useMemo(() => buildLongSignalSeries(0, days), [days]);

  const movers = useMemo(() => {
    const withDelta = series.map((s) => ({
      s,
      pct: percentChange(s.points),
      direction: s.direction,
    }));
    const improving = withDelta
      .filter((m) => m.direction === "improving")
      .sort((a, b) => b.pct - a.pct)[0];
    const watch = withDelta
      .filter((m) => m.direction === "watch")
      .sort((a, b) => a.pct - b.pct)[0];
    const steady = withDelta.find((m) => m.direction === "stable");
    return { improving, watch, steady };
  }, [series]);

  const print = () => window.print();

  if (!ready) {
    return <div className="min-h-dvh bg-surface-alt" aria-busy />;
  }

  return (
    <div className="min-h-dvh bg-surface-alt print:bg-white">
      <header className="px-4 sm:px-6 lg:px-8 max-w-5xl w-full mx-auto py-5 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/home"
            className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <span className="text-ink-subtle">·</span>
          <Logo showWordmark={false} />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={print} className="gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Link href="/home#share">
            <Button variant="secondary" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </Link>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 max-w-5xl w-full mx-auto py-6 sm:py-10 flex flex-col gap-8 sm:gap-10">
        {/* Hero */}
        <section className="animate-stagger-up">
          <p className="text-sm font-medium uppercase tracking-wider text-brand-500 mb-2">
            Full report
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-ink leading-tight">
            {name ? `${name}'s last ${days} days` : `Your last ${days} days`}
          </h1>
          <p className="mt-3 text-lg text-ink-muted max-w-2xl leading-relaxed">
            A longitudinal view of the signals we've been listening for. This
            describes what we observed — it does not diagnose anything.
          </p>

          <div className="mt-6 flex items-center gap-2">
            <WindowToggle value={windowChoice} onChange={setWindowChoice} />
          </div>
        </section>

        {/* Summary stats */}
        <section
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-stagger-up"
          style={{ animationDelay: "60ms" }}
        >
          <StatTile
            icon={<Calendar className="h-5 w-5" />}
            label="Sessions"
            value={String(sessions)}
            sub={`Over ${days} days`}
          />
          <StatTile
            icon={<Sparkles className="h-5 w-5" />}
            label="Current streak"
            value={`${streak} d`}
            sub="Showing up matters"
          />
          <StatTile
            icon={<TrendingUp className="h-5 w-5" />}
            label="Improving signals"
            value={String(
              series.filter((s) => s.direction === "improving").length,
            )}
            sub="vs your baseline"
          />
          <StatTile
            icon={<Activity className="h-5 w-5" />}
            label="Signals to watch"
            value={String(
              series.filter((s) => s.direction === "watch").length,
            )}
            sub="Worth a conversation"
          />
        </section>

        {/* Notable changes */}
        <section
          className="animate-stagger-up"
          style={{ animationDelay: "120ms" }}
        >
          <p className="text-sm font-medium uppercase tracking-wider text-brand-500 mb-2">
            Notable changes
          </p>
          <h2 className="text-2xl font-semibold text-ink mb-4">
            What stood out this {windowChoice === "week" ? "week" : "month"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {movers.improving ? (
              <MoverCard
                title="Biggest improvement"
                series={movers.improving.s}
                pct={movers.improving.pct}
                tone="up"
              />
            ) : null}
            {movers.steady ? (
              <MoverCard
                title="Most stable"
                series={movers.steady.s}
                pct={movers.steady.pct}
                tone="flat"
              />
            ) : null}
            {movers.watch ? (
              <MoverCard
                title="Worth noticing"
                series={movers.watch.s}
                pct={movers.watch.pct}
                tone="down"
              />
            ) : null}
          </div>
        </section>

        {/* Per-phase detailed breakdown */}
        <PhaseSection
          title="Speech"
          eyebrow="Speech signals"
          signals={series.filter((s) => s.phase === "speech")}
          delay={180}
        />
        <PhaseSection
          title="Visual & facial"
          eyebrow="Visual signals"
          signals={series.filter((s) => s.phase === "visual")}
          delay={220}
        />
        <PhaseSection
          title="Movement"
          eyebrow="Movement signals"
          signals={series.filter((s) => s.phase === "movement")}
          delay={260}
        />
        <PhaseSection
          title="Cognitive"
          eyebrow="Cognitive signals"
          signals={series.filter((s) => s.phase === "cognitive")}
          delay={300}
        />

        {/* Lifestyle suggestions */}
        <section
          className="animate-stagger-up"
          style={{ animationDelay: "360ms" }}
        >
          <p className="text-sm font-medium uppercase tracking-wider text-brand-500 mb-2">
            Gentle suggestions
          </p>
          <h2 className="text-2xl font-semibold text-ink mb-4">
            Small things that could help
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SuggestionCard
              title="Consistent sleep window"
              body="The finger-tap dip often correlates with shorter sleep. Try keeping your wake time within a 30-minute band."
            />
            <SuggestionCard
              title="Hydration before sessions"
              body="A glass of water before the morning ritual can clear up small variability in speech rhythm."
            />
            <SuggestionCard
              title="Five-minute walk after"
              body="A short walk after the session has been linked to steadier postural readings in your data."
            />
          </ul>
        </section>

        {/* Sensor data feedback */}
        <section
          className="animate-stagger-up"
          style={{ animationDelay: "340ms" }}
        >
          <SensorReportSection />
        </section>

        {/* Feedback aggregation */}
        {feedbackSummary ? (
          <section
            className="animate-stagger-up"
            style={{ animationDelay: "400ms" }}
          >
            <p className="text-sm font-medium uppercase tracking-wider text-brand-500 mb-2">
              What you told us
            </p>
            <h2 className="text-2xl font-semibold text-ink mb-4">
              Feedback shaping tomorrow&apos;s session
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FeedbackTile
                label="Total feedback"
                value={String(feedbackSummary.total)}
                detail={`${feedbackSummary.justRight} just-right · ${feedbackSummary.tooHard} hard · ${feedbackSummary.tooEasy} easy`}
              />
              <FeedbackTile
                label="Body issues flagged"
                value={String(feedbackSummary.bodyIssues)}
                detail={
                  feedbackSummary.bodyIssues > 0
                    ? "We'll keep similar movements out of the rotation."
                    : "Nothing flagged."
                }
              />
              {feedbackSummary.mostFlagged ? (
                <FeedbackTile
                  label="Most flagged task"
                  value={feedbackSummary.mostFlagged.title}
                  detail={`${feedbackSummary.mostFlagged.hard} of ${feedbackSummary.mostFlagged.total} runs felt too hard.`}
                />
              ) : null}
            </div>
            <p className="text-xs text-ink-muted leading-relaxed mt-4">
              Your feedback adjusts the daily mix. Tasks marked too hard
              repeatedly get rotated less; body-issue flags exclude similar
              movements until you say otherwise from Settings.
            </p>
          </section>
        ) : null}

        {/* Clinical summary — printable */}
        <section
          className="glimpse-card p-6 sm:p-8 animate-stagger-up print:shadow-none print:border print:border-black/20"
          style={{ animationDelay: "420ms" }}
        >
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-brand-500">
                For your clinician
              </p>
              <h2 className="text-xl font-semibold text-ink mt-1">
                Print-ready summary
              </h2>
            </div>
            <Stethoscope className="h-5 w-5 text-brand-500" />
          </div>
          <div className="mt-5 space-y-4 text-base text-ink leading-relaxed">
            <p>
              Subject completed{" "}
              <span className="font-semibold">{sessions} sessions</span> over
              the past {days} days (current streak{" "}
              <span className="font-semibold">{streak} days</span>). Below are
              the longitudinal signals captured by the platform. These are
              described in clinical terms for reference; the platform does not
              issue a diagnosis.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              {series.map((s) => {
                const change = percentChange(s.points);
                return (
                  <li key={s.id}>
                    <span className="font-medium">{s.label}:</span>{" "}
                    {change > 0.5
                      ? `↑ ${change.toFixed(1)}%`
                      : change < -0.5
                        ? `↓ ${Math.abs(change).toFixed(1)}%`
                        : "no meaningful change"}{" "}
                    from baseline ({s.baseline} {s.unit}).{" "}
                    <span className="text-ink-muted">{s.blurb}</span>
                  </li>
                );
              })}
            </ul>
            <p className="text-sm text-ink-muted">
              Raw video clips for any task in this window are available on
              request via secure signed URL. Glimpse is a wellness and clinical
              decision support tool. It does not diagnose disease.
            </p>
          </div>
        </section>

        <footer className="text-sm text-ink-muted leading-relaxed print:mt-8">
          Glimpse · Generated {new Date().toLocaleDateString()} · Window: last{" "}
          {days} days
        </footer>
      </main>
    </div>
  );
}

function WindowToggle({
  value,
  onChange,
}: {
  value: Window;
  onChange: (v: Window) => void;
}) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-xl bg-surface p-1 border border-black/[0.06] shadow-card">
      {(["week", "month"] as const).map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium transition",
            value === opt
              ? "bg-brand-500 text-white"
              : "text-ink-muted hover:text-ink",
          )}
        >
          {opt === "week" ? "Last 7 days" : "Last 30 days"}
        </button>
      ))}
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="glimpse-card p-5">
      <div className="h-9 w-9 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center mb-3">
        {icon}
      </div>
      <p className="text-xs uppercase tracking-wider text-ink-subtle">
        {label}
      </p>
      <p className="text-2xl font-semibold text-ink mt-0.5 tabular-nums">
        {value}
      </p>
      <p className="text-xs text-ink-muted mt-1">{sub}</p>
    </div>
  );
}

function MoverCard({
  title,
  series,
  pct,
  tone,
}: {
  title: string;
  series: SignalSeries;
  pct: number;
  tone: "up" | "down" | "flat";
}) {
  const Icon =
    tone === "up" ? TrendingUp : tone === "down" ? TrendingDown : Minus;
  const sparklineTone =
    tone === "up" ? "improving" : tone === "down" ? "watch" : "stable";
  return (
    <div className="glimpse-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon
          className={cn(
            "h-4 w-4",
            tone === "up" && "text-success",
            tone === "down" && "text-warn",
            tone === "flat" && "text-ink-muted",
          )}
        />
        <p className="text-xs font-medium uppercase tracking-wider text-ink-subtle">
          {title}
        </p>
      </div>
      <p className="text-lg font-semibold text-ink">{series.label}</p>
      <p
        className={cn(
          "text-sm mt-0.5 tabular-nums inline-flex items-center gap-1",
          tone === "up" && "text-success",
          tone === "down" && "text-warn",
          tone === "flat" && "text-ink-muted",
        )}
      >
        {tone === "up" && <ArrowUpRight className="h-3.5 w-3.5" />}
        {tone === "down" && <ArrowDownRight className="h-3.5 w-3.5" />}
        {tone === "flat" && <Minus className="h-3.5 w-3.5" />}
        {Math.abs(pct).toFixed(1)}%
      </p>
      <div className="mt-3">
        <Sparkline points={series.points} tone={sparklineTone} height={48} />
      </div>
    </div>
  );
}

function PhaseSection({
  title,
  eyebrow,
  signals,
  delay,
}: {
  title: string;
  eyebrow: string;
  signals: SignalSeries[];
  delay: number;
}) {
  if (signals.length === 0) return null;
  return (
    <section className="animate-stagger-up" style={{ animationDelay: `${delay}ms` }}>
      <p className="text-sm font-medium uppercase tracking-wider text-brand-500 mb-2">
        {eyebrow}
      </p>
      <h2 className="text-2xl font-semibold text-ink mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {signals.map((s) => (
          <DetailedSignalCard key={s.id} series={s} />
        ))}
      </div>
    </section>
  );
}

function DetailedSignalCard({ series }: { series: SignalSeries }) {
  const change = percentChange(series.points);
  const latest = series.points[series.points.length - 1];
  const sign = change > 0.5 ? "up" : change < -0.5 ? "down" : "flat";

  return (
    <div className="glimpse-card p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-ink">{series.label}</h3>
          <p className="text-xs uppercase tracking-wider text-ink-subtle mt-0.5">
            {series.phase}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
            series.direction === "improving" && "bg-success/12 text-success",
            series.direction === "stable" && "bg-brand-50 text-brand-600",
            series.direction === "watch" && "bg-warn/15 text-warn",
          )}
        >
          {series.direction === "improving"
            ? "Improving"
            : series.direction === "stable"
              ? "Holding steady"
              : "Worth noticing"}
        </span>
      </div>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-3xl font-semibold text-ink tabular-nums leading-none">
          {formatValue(latest)}
        </span>
        <span className="text-sm text-ink-muted">{series.unit}</span>
        <span
          className={cn(
            "ml-auto inline-flex items-center gap-1 text-sm font-medium tabular-nums",
            sign === "up" && "text-success",
            sign === "down" && "text-warn",
            sign === "flat" && "text-ink-muted",
          )}
        >
          {sign === "up" && <ArrowUpRight className="h-3.5 w-3.5" />}
          {sign === "down" && <ArrowDownRight className="h-3.5 w-3.5" />}
          {sign === "flat" && <Minus className="h-3.5 w-3.5" />}
          {Math.abs(change).toFixed(1)}%
        </span>
      </div>
      <Sparkline points={series.points} tone={series.direction} height={88} />
      <p className="text-sm text-ink-muted mt-3 leading-relaxed">
        {series.blurb} · Baseline {series.baseline} {series.unit}.
      </p>
    </div>
  );
}

function FeedbackTile({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="glimpse-card p-5">
      <p className="text-xs uppercase tracking-wider text-ink-subtle">
        {label}
      </p>
      <p className="text-2xl font-semibold text-ink mt-1.5 leading-tight">
        {value}
      </p>
      <p className="text-sm text-ink-muted mt-2 leading-relaxed">{detail}</p>
    </div>
  );
}

function SuggestionCard({ title, body }: { title: string; body: string }) {
  return (
    <li className="glimpse-card p-5">
      <p className="text-base font-semibold text-ink">{title}</p>
      <p className="text-sm text-ink-muted mt-2 leading-relaxed">{body}</p>
    </li>
  );
}

function formatValue(v: number): string {
  return v >= 100 ? Math.round(v).toString() : v.toFixed(1);
}

function capitalize(s: string) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}
