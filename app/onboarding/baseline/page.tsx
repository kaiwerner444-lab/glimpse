"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Eye, Activity, Brain, CheckCircle2 } from "lucide-react";
import { StepShell } from "@/components/onboarding/StepShell";
import { Button } from "@/components/ui/Button";
import { useOnboardingState } from "@/hooks/useOnboardingState";
import { cn } from "@/lib/utils";

interface Phase {
  key: "speech" | "visual" | "movement" | "cognitive";
  label: string;
  description: string;
  icon: React.ReactNode;
  seconds: number;
}

const PHASES: Phase[] = [
  {
    key: "speech",
    label: "Speech baseline",
    description:
      "Read a short passage and answer two open-ended prompts. We capture pace, prosody and lexical diversity at your normal.",
    icon: <Mic className="h-5 w-5" />,
    seconds: 240,
  },
  {
    key: "visual",
    label: "Visual & facial baseline",
    description:
      "Look at the mirror, hold a neutral expression, then smile and raise your eyebrows. We capture symmetry and micro-expression range.",
    icon: <Eye className="h-5 w-5" />,
    seconds: 180,
  },
  {
    key: "movement",
    label: "Movement baseline",
    description:
      "Finger tapping, arm hold, and a few seconds of single-leg stance. We capture amplitude and stability.",
    icon: <Activity className="h-5 w-5" />,
    seconds: 240,
  },
  {
    key: "cognitive",
    label: "Cognitive baseline",
    description:
      "Three short attention and memory tasks. Sets the reference for daily micro-cognitive checks.",
    icon: <Brain className="h-5 w-5" />,
    seconds: 240,
  },
];

const TOTAL_SECONDS = PHASES.reduce((a, p) => a + p.seconds, 0);

export default function BaselineStep() {
  const router = useRouter();
  const { state, update } = useOnboardingState();
  const [started, setStarted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(!!state.baseline?.completedAt);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!started || done) return;
    timerRef.current = setInterval(() => {
      setElapsed((e) => {
        const next = e + 1;
        if (next >= TOTAL_SECONDS) {
          if (timerRef.current) clearInterval(timerRef.current);
          setDone(true);
        }
        return next;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [started, done]);

  const finish = () => {
    update({
      baseline: {
        completedAt: new Date().toISOString(),
        durationSeconds: elapsed || TOTAL_SECONDS,
        featuresCaptured: true,
      },
      completedAt: new Date().toISOString(),
    });
    router.push("/home");
  };

  const skipForNow = () => {
    update({
      baseline: { featuresCaptured: false },
      completedAt: new Date().toISOString(),
    });
    router.push("/home");
  };

  const currentPhase = phaseAt(elapsed);
  const remaining = Math.max(0, TOTAL_SECONDS - elapsed);

  return (
    <StepShell
      step="baseline"
      eyebrow="Baseline session"
      title={
        done
          ? "Baseline captured"
          : started
            ? "Baseline in progress"
            : "One fifteen-minute baseline, then five minutes a day"
      }
      description={
        done
          ? "Your personal baseline is what every future session will be compared against. We'll start your daily ritual tomorrow morning."
          : "Drift detection only works if we know your normal. Stand in front of a mirror in good light, put on your glasses (or position your phone), and we'll guide you through four short modules."
      }
      footer={
        done ? (
          <>
            <span className="text-sm text-ink-muted">
              You&apos;re all set. Daily session begins tomorrow morning.
            </span>
            <Button onClick={finish}>Go to home</Button>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={skipForNow}>
              Skip for now
            </Button>
            {started ? (
              <Button onClick={finish} disabled={!done}>
                {done ? "Continue" : `Recording… ${formatTime(remaining)} left`}
              </Button>
            ) : (
              <Button onClick={() => setStarted(true)}>Start baseline</Button>
            )}
          </>
        )
      }
    >
      {done ? (
        <div className="glimpse-card p-8 flex items-center gap-4">
          <CheckCircle2 className="h-10 w-10 text-success shrink-0" />
          <div>
            <h3 className="text-xl font-semibold text-ink">All four modules captured</h3>
            <p className="text-base text-ink-muted mt-1">
              Speech, visual, movement, and cognitive baselines saved.
              {state.glasses?.mode === "deferred"
                ? " You'll need to pair hardware before your first daily session."
                : null}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="glimpse-card p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-ink-muted">
                Session progress
              </span>
              <span className="text-sm text-ink-muted tabular-nums">
                {formatTime(elapsed)} / {formatTime(TOTAL_SECONDS)}
              </span>
            </div>
            <div className="h-2 bg-black/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 transition-all"
                style={{ width: `${(elapsed / TOTAL_SECONDS) * 100}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PHASES.map((p) => {
              const isActive = started && currentPhase?.key === p.key;
              const isDone =
                started && elapsed >= cumulativeUpTo(p.key);
              return (
                <div
                  key={p.key}
                  className={cn(
                    "glimpse-card p-5 transition border",
                    isActive && "border-brand-500 shadow-card",
                    !isActive && !isDone && "opacity-90",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center",
                        isDone
                          ? "bg-success/15 text-success"
                          : isActive
                            ? "bg-brand-500 text-white"
                            : "bg-brand-50 text-brand-500",
                      )}
                    >
                      {isDone ? <CheckCircle2 className="h-5 w-5" /> : p.icon}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-ink">{p.label}</h3>
                      <p className="text-xs uppercase tracking-wider text-ink-subtle mt-0.5">
                        {Math.round(p.seconds / 60)} minutes
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-ink-muted mt-3 leading-relaxed">
                    {p.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </StepShell>
  );
}

function phaseAt(elapsed: number): Phase | null {
  let acc = 0;
  for (const p of PHASES) {
    acc += p.seconds;
    if (elapsed < acc) return p;
  }
  return null;
}

function cumulativeUpTo(key: Phase["key"]): number {
  let acc = 0;
  for (const p of PHASES) {
    acc += p.seconds;
    if (p.key === key) return acc;
  }
  return acc;
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}
