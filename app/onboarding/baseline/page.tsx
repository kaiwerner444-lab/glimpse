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
import type { TaskFeatures } from "@/lib/ml/extractor";
import { saveSessionRecord } from "@/lib/dashboard/session-history";
import {
  clearBaselineProgress,
  loadBaselineProgress,
  saveBaselineProgress,
} from "@/lib/session/baseline-progress";
import { cn } from "@/lib/utils";

type Stage = "intro" | "running" | "done";

export default function BaselineStep() {
  const router = useRouter();
  const { state, update } = useOnboardingState();
  // Hydrate any in-progress baseline once on mount so a resumed session
  // skips past already-finished tasks and keeps their results.
  const [resumed] = useState(() => loadBaselineProgress());
  const [stage, setStage] = useState<Stage>(
    state.baseline?.completedAt ? "done" : "intro",
  );
  const [results, setResults] = useState<TaskResult[]>(resumed?.results ?? []);
  const [features, setFeatures] = useState<TaskFeatures[]>([]);
  // Distinguishes "all tasks completed" from "user clicked End session
  // partway through" so the dashboard can prompt them to finish.
  const [fullyCompleted, setFullyCompleted] = useState<boolean>(false);
  // First-time started timestamp survives across resume cycles.
  const baselineStartedAt = resumed?.startedAt ?? new Date().toISOString();

  const finish = (skipForNow: boolean) => {
    update({
      baseline: {
        // completedAt is set the moment the user leaves the session — we
        // record that they passed through this step. featuresCaptured
        // tells the dashboard whether to surface the "complete your
        // assessment" banner.
        completedAt: new Date().toISOString(),
        durationSeconds: fullyCompleted ? BASELINE_DURATION_SECONDS : undefined,
        featuresCaptured: fullyCompleted && !skipForNow,
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
          skipTaskIds={resumed?.completedTaskIds}
          initialResults={resumed?.results}
          onTaskComplete={(taskId, r) => {
            // Incremental save after every task. If the user closes
            // the tab between tasks, the home screen will show a
            // "Resume baseline" card on next load.
            saveBaselineProgress({
              completedTaskIds: r.map((x) => x.taskId),
              results: r,
              startedAt: baselineStartedAt,
            });
          }}
          onComplete={(r, f) => {
            setResults(r);
            setFeatures(f);
            setFullyCompleted(true);
            // Persist real ML features + interaction results so the
            // dashboard signal charts have a real first point.
            saveSessionRecord({
              id: crypto.randomUUID(),
              completedAt: new Date().toISOString(),
              kind: "baseline",
              features: f,
              results: r,
            });
            // Baseline is complete — drop the in-progress marker so
            // the resume card disappears.
            clearBaselineProgress();
            setStage("done");
          }}
          onSkipAll={() => {
            // User chose to bail out partway. Keep the in-progress
            // marker so they can resume later from the dashboard.
            setFullyCompleted(false);
            setStage("done");
          }}
        />
      </StepShell>
    );
  }

  if (stage === "done") {
    return (
      <StepShell
        step="baseline"
        eyebrow="Baseline session"
        title={fullyCompleted ? "Baseline captured" : "Session ended early"}
        description={
          fullyCompleted
            ? "Your personal baseline is what every future session will be compared against. Your daily ritual starts tomorrow morning."
            : "No problem — you can finish the rest from the dashboard anytime. We'll prompt you there until it's complete."
        }
        footer={
          <>
            <span className="text-sm text-ink-muted">
              {fullyCompleted
                ? "We'll send a gentle reminder around your usual morning time."
                : "Finish later for personalised analysis."}
            </span>
            <Button onClick={() => finish(false)}>Go to home</Button>
          </>
        }
      >
        <div className="flex flex-col gap-5">
          <div className="glimpse-card p-6 flex items-center gap-4">
            <CheckCircle2
              className={cn(
                "h-10 w-10 shrink-0",
                fullyCompleted ? "text-success" : "text-warn",
              )}
            />
            <div>
              <h3 className="text-xl font-semibold text-ink">
                {fullyCompleted
                  ? "All four modules captured"
                  : `${results.length} of ${BASELINE_TASKS.length} tasks captured`}
              </h3>
              <p className="text-base text-ink-muted mt-1">
                {fullyCompleted
                  ? "Speech, visual, movement and cognitive baselines saved."
                  : "Partial data saved. Complete the rest to unlock the full personalised analysis."}
              </p>
            </div>
          </div>
          <ResultsRecap results={results} features={features} />
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

function ResultsRecap({
  results,
  features,
}: {
  results: TaskResult[];
  features: TaskFeatures[];
}) {
  if (results.length === 0) return null;
  const completed = results.filter((r) => !r.skipped).length;
  const stroop = results.find(
    (r) =>
      typeof r.stroopCorrect === "number" &&
      typeof r.stroopTotal === "number" &&
      r.stroopTotal > 0,
  );

  // Aggregate across all task-feature payloads.
  const allSymmetry = features
    .map((f) => f.meanSymmetryPercent)
    .filter((v): v is number => typeof v === "number");
  const meanSymmetry = allSymmetry.length
    ? allSymmetry.reduce((a, b) => a + b, 0) / allSymmetry.length
    : null;

  const tapFeatures = features.find((f) => typeof f.tapCount === "number");
  const audioFeatures = features.find(
    (f) => typeof f.meanPitchHz === "number",
  );
  const poseFeatures = features.find(
    (f) => typeof f.postureSwayCm === "number",
  );
  const totalFrames = features.reduce((acc, f) => acc + (f.framesAnalysed || 0), 0);

  return (
    <div className="glimpse-card p-6">
      <p className="text-sm font-medium uppercase tracking-wider text-ink-subtle mb-4">
        Session recap
      </p>
      <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Stat label="Tasks completed" value={`${completed} / ${results.length}`} />
        <Stat
          label="Frames analysed"
          value={totalFrames.toLocaleString()}
        />
        {meanSymmetry !== null ? (
          <Stat
            label="Facial symmetry"
            value={`${meanSymmetry.toFixed(1)}%`}
          />
        ) : null}
        {tapFeatures ? (
          <Stat
            label="Detected taps"
            value={String(tapFeatures.tapCount ?? 0)}
          />
        ) : null}
        {audioFeatures?.meanPitchHz ? (
          <Stat
            label="Mean pitch"
            value={`${audioFeatures.meanPitchHz.toFixed(0)} Hz`}
          />
        ) : null}
        {poseFeatures?.postureSwayCm ? (
          <Stat
            label="Postural sway"
            value={`${poseFeatures.postureSwayCm.toFixed(1)} cm`}
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
