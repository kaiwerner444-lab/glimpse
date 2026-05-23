"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Mic, Video, Sparkles } from "lucide-react";
import { StepShell } from "@/components/onboarding/StepShell";
import { Button } from "@/components/ui/Button";
import { SessionRunner } from "@/components/session/SessionRunner";
import { useOnboardingState } from "@/hooks/useOnboardingState";
import {
  BASELINE_TASKS,
  BASELINE_DURATION_SECONDS,
} from "@/lib/session/baseline";
import type { TaskResult } from "@/lib/session/types";

type Stage = "intro" | "running" | "done";

export default function BaselineStep() {
  const router = useRouter();
  const { state, update } = useOnboardingState();
  const [stage, setStage] = useState<Stage>(
    state.baseline?.completedAt ? "done" : "intro",
  );
  const [results, setResults] = useState<TaskResult[]>([]);

  const finish = (completed: boolean) => {
    update({
      baseline: {
        completedAt: completed ? new Date().toISOString() : undefined,
        durationSeconds: completed ? BASELINE_DURATION_SECONDS : undefined,
        featuresCaptured: completed,
      },
      completedAt: new Date().toISOString(),
    });
    router.push("/home");
  };

  if (stage === "running") {
    return (
      <StepShell
        step="baseline"
        eyebrow="Baseline session"
        title="Let's capture your normal"
        description="Follow the on-screen instructions for each task. We'll guide you, time you, and move you on automatically."
      >
        <SessionRunner
          tasks={BASELINE_TASKS}
          onComplete={(r) => {
            setResults(r);
            setStage("done");
          }}
          onSkipAll={() => setStage("done")}
        />
      </StepShell>
    );
  }

  if (stage === "done") {
    return (
      <StepShell
        step="baseline"
        eyebrow="Baseline session"
        title="Baseline captured"
        description="Your personal baseline is what every future session will be compared against. Your daily ritual starts tomorrow morning."
        footer={
          <>
            <span className="text-sm text-ink-muted">
              We&apos;ll send a gentle reminder around your usual morning time.
            </span>
            <Button onClick={() => finish(true)}>Go to home</Button>
          </>
        }
      >
        <div className="flex flex-col gap-5">
          <div className="glimpse-card p-6 flex items-center gap-4">
            <CheckCircle2 className="h-10 w-10 text-success shrink-0" />
            <div>
              <h3 className="text-xl font-semibold text-ink">
                All four modules captured
              </h3>
              <p className="text-base text-ink-muted mt-1">
                Speech, visual, movement and cognitive baselines saved.
              </p>
            </div>
          </div>
          <ResultsRecap results={results} />
        </div>
      </StepShell>
    );
  }

  return (
    <StepShell
      step="baseline"
      eyebrow="Baseline session"
      title="One ~15-minute baseline, then five minutes a day"
      description="Drift detection only works if we know your normal. Stand in front of a mirror in good light, put on your glasses (or position your phone), and we'll guide you through each task."
      footer={
        <>
          <Button variant="ghost" onClick={() => finish(false)}>
            Skip for now
          </Button>
          <Button onClick={() => setStage("running")}>Begin baseline</Button>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="glimpse-card p-6 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="h-14 w-14 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center shrink-0">
            <Sparkles className="h-7 w-7" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-ink">
              What happens during the session
            </h3>
            <p className="text-base text-ink-muted mt-1.5 leading-relaxed">
              We&apos;ll show you each task one at a time with a countdown.
              Some are passive — just speak, hold a position, or follow a dot.
              Others (Stroop, digit span, finger tapping) ask you to interact
              on screen. The session auto-advances; you can pause or skip
              anytime.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <PermissionTile
            icon={<Mic className="h-5 w-5" />}
            title="Microphone access"
            body="We'll ask for permission when the session starts. Used only during active tasks."
          />
          <PermissionTile
            icon={<Video className="h-5 w-5" />}
            title="Camera access"
            body="A small mirror preview shows what's captured. Raw video is processed and discarded."
          />
        </div>

        <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Speech", count: 4 },
            { label: "Visual", count: 5 },
            { label: "Movement", count: 5 },
            { label: "Cognitive", count: 4 },
          ].map((p) => (
            <li
              key={p.label}
              className="glimpse-card p-4 text-center"
            >
              <p className="text-xs uppercase tracking-wider text-ink-subtle">
                {p.label}
              </p>
              <p className="text-2xl font-semibold text-ink mt-1">
                {p.count}
              </p>
              <p className="text-xs text-ink-muted">tasks</p>
            </li>
          ))}
        </ul>
      </div>
    </StepShell>
  );
}

function PermissionTile({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="glimpse-card p-5">
      <div className="h-9 w-9 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center mb-3">
        {icon}
      </div>
      <p className="text-base font-semibold text-ink">{title}</p>
      <p className="text-sm text-ink-muted mt-1 leading-relaxed">{body}</p>
    </div>
  );
}

function ResultsRecap({ results }: { results: TaskResult[] }) {
  if (results.length === 0) return null;
  const completed = results.filter((r) => !r.skipped).length;
  const tapCounts = results.flatMap((r) =>
    typeof r.fingerTapCount === "number" ? [r.fingerTapCount] : [],
  );
  const stroop = results.find(
    (r) =>
      typeof r.stroopCorrect === "number" &&
      typeof r.stroopTotal === "number" &&
      r.stroopTotal > 0,
  );

  return (
    <div className="glimpse-card p-6">
      <p className="text-sm font-medium uppercase tracking-wider text-ink-subtle mb-4">
        Session recap
      </p>
      <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Stat label="Tasks completed" value={`${completed} / ${results.length}`} />
        {tapCounts.length ? (
          <Stat
            label="Finger taps captured"
            value={tapCounts.join(" · ")}
          />
        ) : null}
        {stroop ? (
          <Stat
            label="Stroop accuracy"
            value={`${stroop.stroopCorrect} / ${stroop.stroopTotal}`}
          />
        ) : null}
      </dl>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-ink-subtle">{label}</dt>
      <dd className="text-lg font-semibold text-ink mt-1 tabular-nums">{value}</dd>
    </div>
  );
}
