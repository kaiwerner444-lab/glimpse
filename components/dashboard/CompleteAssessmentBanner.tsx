"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, X } from "lucide-react";
import { loadOnboarding } from "@/lib/db/mock-db";

// Persistent banner shown when the user ended the baseline session
// before completing every task. Without the full baseline, drift
// detection has nothing to compare against — surface this prominently
// until they finish. Dismissible per session (sessionStorage), but
// returns next visit so they don't accidentally forget.

const DISMISS_KEY = "glimpse.assessment-banner-dismissed";

export function CompleteAssessmentBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const state = loadOnboarding();
    const wentThroughBaseline = !!state.baseline?.completedAt;
    const fullyCaptured = state.baseline?.featuresCaptured === true;
    const dismissed =
      typeof window !== "undefined" &&
      window.sessionStorage.getItem(DISMISS_KEY) === "true";
    setShow(wentThroughBaseline && !fullyCaptured && !dismissed);
  }, []);

  if (!show) return null;

  const dismiss = () => {
    window.sessionStorage.setItem(DISMISS_KEY, "true");
    setShow(false);
  };

  return (
    <section className="glimpse-card p-5 sm:p-6 border-warn/30 bg-warn/[0.06] flex items-start gap-4">
      <div className="h-10 w-10 rounded-2xl bg-warn/15 text-warn flex items-center justify-center shrink-0">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium uppercase tracking-wider text-warn">
          Finish your baseline
        </p>
        <h2 className="text-lg font-semibold text-ink mt-1">
          Complete the rest of your assessment
        </h2>
        <p className="text-base text-ink-muted mt-1.5 leading-relaxed">
          You ended the session before all tasks were captured. Without the
          full baseline, drift detection has nothing to compare against —
          finish the remaining tasks to unlock the personalised analysis.
        </p>
        <div className="mt-4 flex items-center gap-3 flex-wrap">
          <Link href="/onboarding/baseline">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-warn text-white px-4 h-10 text-sm font-semibold hover:bg-warn/90 transition"
            >
              Finish assessment
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
          <button
            type="button"
            onClick={dismiss}
            className="text-sm text-ink-muted hover:text-ink"
          >
            Remind me later
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="shrink-0 -mt-1 -mr-1 text-ink-subtle hover:text-ink p-1"
      >
        <X className="h-4 w-4" />
      </button>
    </section>
  );
}
