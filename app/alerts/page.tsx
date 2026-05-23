"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  AlertTriangle,
  Phone,
  Stethoscope,
  Info,
  Lightbulb,
  ExternalLink,
  ChevronRight,
  Mail,
  Printer,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Sparkline } from "@/components/dashboard/Sparkline";
import { detectAlerts, countByTier } from "@/lib/alerts/detect";
import { TELEHEALTH_URLS } from "@/lib/alerts/specialists";
import { useRequireAuth } from "@/lib/auth/require-auth";
import { onSessionSaved } from "@/lib/dashboard/session-history";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";
import type { Alert, SpecialistSuggestion } from "@/lib/alerts/types";

export default function AlertsPage() {
  const ready = useRequireAuth();
  const [result, setResult] = useState<ReturnType<typeof detectAlerts> | null>(
    null,
  );

  useEffect(() => {
    const sync = () => setResult(detectAlerts());
    sync();
    return onSessionSaved(sync);
  }, []);

  const tiered = useMemo(() => {
    if (!result) return { t3: [], t2: [], t1: [] };
    return {
      t3: result.alerts.filter((a) => a.tier === 3),
      t2: result.alerts.filter((a) => a.tier === 2),
      t1: result.alerts.filter((a) => a.tier === 1),
    };
  }, [result]);

  const counts = result ? countByTier(result.alerts) : { 1: 0, 2: 0, 3: 0 };
  const hasEmergency = result?.alerts.some((a) => a.isEmergency) ?? false;

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
        {hasEmergency ? <EmergencyBanner /> : null}

        <Reveal>
          <section>
            <p className="text-sm font-medium uppercase tracking-wider text-brand-500 mb-2">
              Alerts
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-ink">
              {result?.alerts.length
                ? "What's worth your attention"
                : "All quiet"}
            </h1>
            <p className="mt-3 text-lg text-ink-muted max-w-2xl leading-relaxed">
              {result?.source === "demo"
                ? "These are illustrative based on your risk profile. Real alerts come online once you've completed a few daily sessions."
                : "Each alert compares your recent sessions against your personal baseline. We never compare you to a population average."}
            </p>
            <div className="mt-5 flex items-center gap-3 flex-wrap">
              <TierChip count={counts[3]} tier={3} />
              <TierChip count={counts[2]} tier={2} />
              <TierChip count={counts[1]} tier={1} />
            </div>
          </section>
        </Reveal>

        {tiered.t3.length > 0 ? (
          <section className="flex flex-col gap-4">
            <SectionHeader
              tier={3}
              label="Specialist referral suggested"
              body="Sustained or sudden departures from your baseline that warrant a conversation with a specialist."
            />
            {tiered.t3.map((a) => (
              <Reveal key={a.id}>
                <AlertCard alert={a} />
              </Reveal>
            ))}
          </section>
        ) : null}

        {tiered.t2.length > 0 ? (
          <section className="flex flex-col gap-4">
            <SectionHeader
              tier={2}
              label="Worth a conversation"
              body="Drifting from your baseline, sustained over multiple sessions. Mention at your next physician visit; lifestyle adjustments often pull these back."
            />
            {tiered.t2.map((a) => (
              <Reveal key={a.id}>
                <AlertCard alert={a} />
              </Reveal>
            ))}
          </section>
        ) : null}

        {tiered.t1.length > 0 ? (
          <section className="flex flex-col gap-4">
            <SectionHeader
              tier={1}
              label="Observations"
              body="Within normal day-to-day variation. Shown for transparency, no action needed."
            />
            {tiered.t1.map((a) => (
              <Reveal key={a.id}>
                <AlertCard alert={a} />
              </Reveal>
            ))}
          </section>
        ) : null}

        <footer className="text-sm text-ink-muted leading-relaxed pt-2">
          Glimpse is a wellness and clinical decision support tool. It does not
          diagnose disease. In an emergency, call 911.
        </footer>
      </main>
    </div>
  );
}

// ─── Emergency banner ─────────────────────────────────────────────────

function EmergencyBanner() {
  return (
    <section className="glimpse-card p-5 bg-alert/[0.06] border-alert/30 flex items-start gap-4">
      <div className="h-11 w-11 rounded-2xl bg-alert text-white flex items-center justify-center shrink-0">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium uppercase tracking-wider text-alert mb-1">
          Acute pattern detected
        </p>
        <h2 className="text-xl font-semibold text-ink leading-tight">
          If symptoms are happening right now, call emergency services.
        </h2>
        <p className="text-base text-ink-muted mt-2 leading-relaxed">
          Sudden facial drooping, weakness in one arm, or slurred speech can
          indicate stroke. Stroke care is time-critical — every minute matters.
        </p>
        <div className="mt-4 flex items-center gap-3 flex-wrap">
          <a
            href="tel:911"
            className="inline-flex items-center gap-2 rounded-xl bg-alert text-white px-4 h-11 text-sm font-semibold hover:bg-alert/90 transition shadow-elevated"
          >
            <Phone className="h-4 w-4" />
            Call 911
          </a>
          <span className="text-sm text-ink-muted">
            US & Canada · For other regions, dial your local emergency number.
          </span>
        </div>
      </div>
    </section>
  );
}

// ─── Tier chip ────────────────────────────────────────────────────────

function TierChip({ count, tier }: { count: number; tier: 1 | 2 | 3 }) {
  const meta = {
    3: {
      label: "Specialist suggested",
      cls: "bg-alert/10 text-alert border-alert/20",
    },
    2: {
      label: "Worth a conversation",
      cls: "bg-warn/10 text-warn border-warn/20",
    },
    1: {
      label: "Observations",
      cls: "bg-brand-50 text-brand-600 border-brand-500/15",
    },
  }[tier];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium",
        meta.cls,
      )}
    >
      <span className="font-semibold tabular-nums">{count}</span>
      {meta.label}
    </span>
  );
}

// ─── Section header ───────────────────────────────────────────────────

function SectionHeader({
  tier,
  label,
  body,
}: {
  tier: 1 | 2 | 3;
  label: string;
  body: string;
}) {
  const icon =
    tier === 3 ? (
      <Stethoscope className="h-4 w-4" />
    ) : tier === 2 ? (
      <Lightbulb className="h-4 w-4" />
    ) : (
      <Info className="h-4 w-4" />
    );
  const tone =
    tier === 3
      ? "text-alert"
      : tier === 2
        ? "text-warn"
        : "text-brand-600";
  return (
    <div>
      <p
        className={cn(
          "text-sm font-medium uppercase tracking-wider inline-flex items-center gap-1.5",
          tone,
        )}
      >
        {icon}
        {label}
      </p>
      <p className="text-sm text-ink-muted mt-1 leading-relaxed max-w-2xl">
        {body}
      </p>
    </div>
  );
}

// ─── Alert card ───────────────────────────────────────────────────────

function AlertCard({ alert }: { alert: Alert }) {
  const sparklineTone =
    alert.tier === 3
      ? "watch"
      : alert.tier === 2
        ? "watch"
        : "stable";

  return (
    <article
      className={cn(
        "glimpse-card p-5 sm:p-6",
        alert.tier === 3 && "border-alert/30 bg-alert/[0.03]",
        alert.tier === 2 && "border-warn/20",
      )}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-xs font-medium uppercase tracking-wider",
              alert.tier === 3 && "text-alert",
              alert.tier === 2 && "text-warn",
              alert.tier === 1 && "text-brand-600",
            )}
          >
            {alert.signalLabel} ·{" "}
            {alert.changePercent >= 0 ? "+" : ""}
            {alert.changePercent}%
          </p>
          <h3 className="text-lg sm:text-xl font-semibold text-ink mt-1 leading-tight">
            {alert.title}
          </h3>
        </div>
        <span className="text-xs text-ink-subtle tabular-nums">
          Over {alert.sessionsObserved} sessions
        </span>
      </div>

      <div className="my-4">
        <Sparkline
          points={alert.series}
          tone={sparklineTone}
          height={64}
        />
      </div>

      <p className="text-base text-ink-muted leading-relaxed">{alert.body}</p>
      <p className="text-base text-ink mt-3 leading-relaxed">
        {alert.recommendation}
      </p>

      {alert.specialists.length > 0 ? (
        <div className="mt-5 pt-5 border-t border-black/[0.06]">
          <p className="text-sm font-medium uppercase tracking-wider text-brand-500 mb-3 inline-flex items-center gap-1.5">
            <Stethoscope className="h-3.5 w-3.5" />
            Connect with a specialist
          </p>
          <ul className="space-y-2.5">
            {alert.specialists.map((s, i) => (
              <SpecialistRow key={i} specialist={s} alert={alert} />
            ))}
          </ul>

          <div className="mt-4 flex items-center gap-2 flex-wrap text-sm">
            <Link
              href="/reports"
              className="inline-flex items-center gap-1.5 rounded-lg bg-surface-alt border border-black/[0.06] px-3 h-9 text-ink hover:bg-black/[0.04] transition"
            >
              <Printer className="h-3.5 w-3.5" />
              Print a one-pager
            </Link>
            <Link
              href="/home#share"
              className="inline-flex items-center gap-1.5 rounded-lg bg-surface-alt border border-black/[0.06] px-3 h-9 text-ink hover:bg-black/[0.04] transition"
            >
              <Mail className="h-3.5 w-3.5" />
              Share with my clinician
            </Link>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function SpecialistRow({
  specialist,
  alert,
}: {
  specialist: SpecialistSuggestion;
  alert: Alert;
}) {
  return (
    <li className="rounded-xl border border-black/[0.06] bg-surface px-4 py-3 flex items-start gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-base font-medium text-ink">{specialist.type}</p>
        <p className="text-sm text-ink-muted leading-snug mt-0.5">
          {specialist.reason}
        </p>
      </div>
      {specialist.telehealth ? (
        <a
          href={TELEHEALTH_URLS[specialist.telehealth]}
          target="_blank"
          rel="noreferrer"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3 h-9 text-sm font-medium transition shrink-0",
            alert.tier === 3
              ? "bg-alert text-white hover:bg-alert/90"
              : "bg-brand-500 text-white hover:bg-brand-600",
          )}
        >
          Schedule
          <ExternalLink className="h-3 w-3" />
        </a>
      ) : (
        <span className="inline-flex items-center gap-1 text-xs text-ink-subtle">
          Find one
          <ChevronRight className="h-3 w-3" />
        </span>
      )}
    </li>
  );
}
