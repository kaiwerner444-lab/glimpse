"use client";

import { useEffect, useState } from "react";
import { Snowflake, Anchor, Save, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  loadGamification,
  saveGamification,
  withFreshFreezes,
  FREEZES_PER_MONTH,
} from "@/lib/gamification/state";
import type { GamificationState } from "@/lib/gamification/types";
import { cn } from "@/lib/utils";

// Two well-validated interventions surfaced in one card:
//
// 1. Streak freezes (Duolingo, broadly published research on loss-aversion
//    buffers + self-determination): allowing a small number of forgiven
//    days raises long-term retention without raising the anxiety streaks
//    can produce in health-conscious users.
//
// 2. Habit anchoring (BJ Fogg "Tiny Habits"; Wendy Wood "Good Habits, Bad
//    Habits" — habit pairing): tying a new behaviour to an existing daily
//    cue ("after my morning coffee") raises adherence 3-5x in controlled
//    studies vs. unanchored intentions.

export function HabitAndFreeze() {
  const [state, setState] = useState<GamificationState | null>(null);
  const [draftAnchor, setDraftAnchor] = useState<string>("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const fresh = withFreshFreezes(loadGamification());
    if (fresh !== loadGamification()) saveGamification(fresh);
    setState(fresh);
    setDraftAnchor(fresh.habitAnchor ?? "");
  }, []);

  if (!state) return null;

  const saveAnchor = () => {
    const next: GamificationState = {
      ...state,
      habitAnchor: draftAnchor.trim() || null,
    };
    saveGamification(next);
    setState(next);
    setEditing(false);
  };

  return (
    <section className="glimpse-card p-6">
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-brand-500">
            Built to stick
          </p>
          <h2 className="text-xl font-semibold text-ink mt-1">
            Habit anchor & streak freezes
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Habit anchor */}
        <div className="rounded-2xl bg-surface-alt border border-black/[0.06] p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-8 w-8 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center">
              <Anchor className="h-4 w-4" />
            </span>
            <p className="text-sm font-semibold text-ink">Habit anchor</p>
          </div>
          {state.habitAnchor && !editing ? (
            <>
              <p className="text-base text-ink leading-relaxed">
                After your{" "}
                <span className="font-semibold">{state.habitAnchor}</span>,
                take five minutes for Glimpse.
              </p>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="text-sm font-medium text-brand-500 hover:text-brand-600 mt-3"
              >
                Change anchor
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-ink-muted leading-relaxed mb-3">
                Tie your session to something you already do every morning —
                research shows anchored habits stick 3-5× longer than
                untethered ones.
              </p>
              <div className="flex items-center gap-2">
                <Input
                  value={draftAnchor}
                  onChange={(e) => setDraftAnchor(e.target.value)}
                  placeholder="morning coffee · brushing teeth · …"
                  className="text-sm"
                />
                <Button onClick={saveAnchor} className="gap-1.5">
                  <Save className="h-4 w-4" />
                  Save
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Streak freezes */}
        <div className="rounded-2xl bg-surface-alt border border-black/[0.06] p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-8 w-8 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center">
              <Snowflake className="h-4 w-4" />
            </span>
            <p className="text-sm font-semibold text-ink">Streak freezes</p>
          </div>
          <div className="flex items-center gap-2 mb-3">
            {Array.from({ length: FREEZES_PER_MONTH }).map((_, i) => {
              const used = i >= state.streakFreezesAvailable;
              return (
                <span
                  key={i}
                  className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center transition",
                    used
                      ? "bg-black/[0.04] text-ink-subtle"
                      : "bg-brand-500/15 text-brand-500",
                  )}
                  aria-label={used ? "Used freeze" : "Available freeze"}
                >
                  {used ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Snowflake className="h-5 w-5" />
                  )}
                </span>
              );
            })}
          </div>
          <p className="text-sm text-ink-muted leading-relaxed">
            You have{" "}
            <span className="font-semibold text-ink">
              {state.streakFreezesAvailable}
            </span>{" "}
            of {FREEZES_PER_MONTH} freezes this month. We use one
            automatically if life gets in the way — your streak stays
            unbroken without you having to think about it.
          </p>
        </div>
      </div>
    </section>
  );
}
