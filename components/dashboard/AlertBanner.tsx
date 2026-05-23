"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Stethoscope, ChevronRight, Phone } from "lucide-react";
import { detectAlerts, countByTier } from "@/lib/alerts/detect";
import { onSessionSaved } from "@/lib/dashboard/session-history";
import { cn } from "@/lib/utils";

// Surfaces the highest-priority alert on the dashboard. If a Tier 3 with
// the emergency flag is active, we render an alert-tone banner with a
// direct 911 affordance — that's the spec's "no menus, no surveys"
// requirement for acute red flags. Otherwise we show a single calm
// summary linking to /alerts.

export function AlertBanner() {
  const [result, setResult] = useState<ReturnType<typeof detectAlerts> | null>(
    null,
  );

  useEffect(() => {
    const sync = () => setResult(detectAlerts());
    sync();
    return onSessionSaved(sync);
  }, []);

  const view = useMemo(() => {
    if (!result) return null;
    const counts = countByTier(result.alerts);
    const emergency = result.alerts.find((a) => a.isEmergency);
    if (emergency) {
      return {
        kind: "emergency" as const,
        title: emergency.title,
        body: emergency.recommendation,
      };
    }
    if (counts[3] > 0) {
      return {
        kind: "tier3" as const,
        count: counts[3],
        body: "Sustained departures from your baseline that warrant a specialist conversation.",
      };
    }
    if (counts[2] > 0) {
      return {
        kind: "tier2" as const,
        count: counts[2],
        body: "Worth mentioning at your next physician visit.",
      };
    }
    return null;
  }, [result]);

  if (!view) return null;

  if (view.kind === "emergency") {
    return (
      <section className="glimpse-card p-5 bg-alert/[0.06] border-alert/30 flex items-start gap-4">
        <div className="h-10 w-10 rounded-2xl bg-alert text-white flex items-center justify-center shrink-0">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium uppercase tracking-wider text-alert mb-1">
            Acute pattern — act now if symptoms are happening
          </p>
          <h2 className="text-lg font-semibold text-ink leading-tight">
            {view.title}
          </h2>
          <p className="text-base text-ink-muted mt-1.5 leading-relaxed">
            {view.body}
          </p>
          <div className="mt-4 flex items-center gap-3 flex-wrap">
            <a
              href="tel:911"
              className="inline-flex items-center gap-2 rounded-xl bg-alert text-white px-4 h-10 text-sm font-semibold hover:bg-alert/90 transition shadow-elevated"
            >
              <Phone className="h-4 w-4" />
              Call 911
            </a>
            <Link
              href="/alerts"
              className="text-sm font-medium text-alert inline-flex items-center gap-1"
            >
              View alerts
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const tone =
    view.kind === "tier3"
      ? {
          accent: "text-alert",
          bg: "bg-alert/[0.06]",
          border: "border-alert/30",
          chip: "bg-alert/15 text-alert",
        }
      : {
          accent: "text-warn",
          bg: "bg-warn/[0.06]",
          border: "border-warn/30",
          chip: "bg-warn/15 text-warn",
        };

  return (
    <Link
      href="/alerts"
      className={cn(
        "glimpse-card p-5 flex items-start gap-4 transition hover:shadow-card",
        tone.bg,
        tone.border,
      )}
    >
      <div className={cn("h-10 w-10 rounded-2xl flex items-center justify-center shrink-0", tone.chip)}>
        <Stethoscope className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium uppercase tracking-wider mb-1", tone.accent)}>
          {view.count} {view.count === 1 ? "alert" : "alerts"} worth your attention
        </p>
        <p className="text-base text-ink leading-relaxed">{view.body}</p>
      </div>
      <ChevronRight className={cn("h-5 w-5 shrink-0 mt-2.5", tone.accent)} />
    </Link>
  );
}
