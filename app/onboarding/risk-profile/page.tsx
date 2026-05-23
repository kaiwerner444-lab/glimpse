"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";
import { StepShell } from "@/components/onboarding/StepShell";
import { Button } from "@/components/ui/Button";
import { useOnboardingState } from "@/hooks/useOnboardingState";
import { stratify } from "@/lib/risk/stratify";
import {
  CONDITION_LABELS,
  type RiskProfile,
  type RiskScore,
  type TrackedCondition,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const DRIVER_LABELS: Record<RiskScore["drivers"][number], string> = {
  polygenic: "polygenic",
  family_history: "family history",
  age: "age",
  sex: "sex",
};

export default function RiskProfileStep() {
  const router = useRouter();
  const { state, update, hydrated } = useOnboardingState();
  const [profile, setProfile] = useState<RiskProfile | null>(
    state.riskProfile ?? null,
  );

  useEffect(() => {
    if (!hydrated) return;
    if (state.riskProfile) {
      setProfile(state.riskProfile);
      return;
    }
    const computed = stratify(state.account, state.familyHistory, state.genomics);
    setProfile(computed);
  }, [hydrated, state.account, state.familyHistory, state.genomics, state.riskProfile]);

  const topFive = useMemo(
    () => (profile ? profile.scores.slice(0, 5) : []),
    [profile],
  );

  const toggle = (c: TrackedCondition) => {
    if (!profile) return;
    const isConfirmed = profile.confirmed.includes(c);
    setProfile({
      ...profile,
      confirmed: isConfirmed
        ? profile.confirmed.filter((x) => x !== c)
        : [...profile.confirmed, c],
      deprioritized: isConfirmed
        ? [...profile.deprioritized, c]
        : profile.deprioritized.filter((x) => x !== c),
    });
  };

  const onContinue = () => {
    if (!profile) return;
    update({ riskProfile: profile, step: "baseline" });
    router.push("/onboarding/baseline");
  };

  return (
    <StepShell
      step="risk-profile"
      eyebrow="Your screening focus"
      title="Here's what we'd watch for, based on what you shared"
      description="These are signals worth keeping an eye on — not diagnoses. Confirm the ones you want included in your daily ritual. You can change this anytime."
      footer={
        <>
          <Button
            variant="ghost"
            onClick={() => router.push("/onboarding/family-history")}
          >
            Back
          </Button>
          <Button onClick={onContinue} disabled={!profile}>
            Continue
          </Button>
        </>
      }
    >
      {!profile ? (
        <div className="glimpse-card p-8 text-center text-ink-muted">
          Building your profile…
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="glimpse-card p-4 flex items-start gap-3 bg-brand-50/60 border-brand-200">
            <Info className="h-5 w-5 text-brand-600 mt-0.5 shrink-0" />
            <p className="text-base text-ink">
              These rankings are informational. Glimpse surfaces signals that
              may be worth a conversation with a clinician — it does not
              diagnose anything.
            </p>
          </div>

          {topFive.map((score) => (
            <RiskRow
              key={score.condition}
              score={score}
              confirmed={profile.confirmed.includes(score.condition)}
              onToggle={() => toggle(score.condition)}
            />
          ))}
        </div>
      )}
    </StepShell>
  );
}

function RiskRow({
  score,
  confirmed,
  onToggle,
}: {
  score: RiskScore;
  confirmed: boolean;
  onToggle: () => void;
}) {
  const pct = Math.round(score.score * 100);
  const band =
    score.score >= 0.4
      ? { label: "Elevated", tone: "bg-warn/15 text-warn" }
      : score.score >= 0.2
        ? { label: "Moderate", tone: "bg-brand-50 text-brand-600" }
        : { label: "Baseline", tone: "bg-black/[0.04] text-ink-muted" };

  return (
    <div className="glimpse-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-semibold text-ink">
              {CONDITION_LABELS[score.condition]}
            </h3>
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-xs font-medium",
                band.tone,
              )}
            >
              {band.label}
            </span>
          </div>
          {score.drivers.length ? (
            <p className="text-sm text-ink-muted mt-1.5">
              Driven by{" "}
              {score.drivers
                .map((d) => DRIVER_LABELS[d])
                .join(", ")}
              .
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={confirmed}
          className={cn(
            "shrink-0 rounded-xl px-4 h-10 text-sm font-medium transition border",
            confirmed
              ? "bg-brand-500 text-white border-brand-500"
              : "bg-surface text-ink border-black/15 hover:border-black/30",
          )}
        >
          {confirmed ? "Tracking" : "Track"}
        </button>
      </div>

      <div className="mt-4 h-1.5 w-full bg-black/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-500/80 rounded-full transition-all"
          style={{ width: `${Math.max(4, pct)}%` }}
        />
      </div>
    </div>
  );
}
