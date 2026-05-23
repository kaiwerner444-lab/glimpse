"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Mic, Eye, Activity, Brain, SkipForward, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CameraPreview } from "./CameraPreview";
import { TaskRenderer } from "./TaskRenderer";
import { cn } from "@/lib/utils";
import type { Task, TaskResult, Phase } from "@/lib/session/types";

interface SessionRunnerProps {
  tasks: Task[];
  onComplete: (results: TaskResult[]) => void;
  onSkipAll?: () => void;
}

const PHASE_META: Record<Phase, { label: string; icon: React.ReactNode }> = {
  speech: { label: "Speech", icon: <Mic className="h-4 w-4" /> },
  visual: { label: "Visual & facial", icon: <Eye className="h-4 w-4" /> },
  movement: { label: "Movement", icon: <Activity className="h-4 w-4" /> },
  cognitive: { label: "Cognitive", icon: <Brain className="h-4 w-4" /> },
};

export function SessionRunner({
  tasks,
  onComplete,
  onSkipAll,
}: SessionRunnerProps) {
  const [index, setIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [results, setResults] = useState<TaskResult[]>([]);
  const startedAtRef = useRef<string>(new Date().toISOString());
  const interactionRef = useRef<Partial<TaskResult>>({});

  const task = tasks[index];
  const totalTasks = tasks.length;
  const isLast = index === totalTasks - 1;

  const needsAudio = useMemo(
    () => tasks.some((t) => t.modality === "audio" || t.modality === "both"),
    [tasks],
  );
  const needsVideo = useMemo(
    () => tasks.some((t) => t.modality === "video" || t.modality === "both"),
    [tasks],
  );

  // Drive the per-task countdown.
  useEffect(() => {
    if (paused || !task) return;
    if (elapsed >= task.durationSeconds) {
      advance(false);
      return;
    }
    const id = setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, paused, task?.id]);

  const advance = useCallback(
    (skipped: boolean) => {
      if (!task) return;
      const next: TaskResult = {
        taskId: task.id,
        startedAt: startedAtRef.current,
        endedAt: new Date().toISOString(),
        skipped,
        ...interactionRef.current,
      };
      const updated = [...results, next];
      setResults(updated);
      interactionRef.current = {};
      startedAtRef.current = new Date().toISOString();

      if (index + 1 >= totalTasks) {
        onComplete(updated);
        return;
      }
      setIndex((i) => i + 1);
      setElapsed(0);
    },
    [task, results, index, totalTasks, onComplete],
  );

  if (!task) return null;

  const phase = task.phase;
  const remaining = Math.max(0, task.durationSeconds - elapsed);
  const taskProgress = Math.min(1, elapsed / task.durationSeconds);
  const overallProgress = ((index + taskProgress) / totalTasks) * 100;

  return (
    <div className="flex flex-col gap-6">
      {/* Phase + overall progress */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 text-brand-600 px-3 py-1 text-sm font-medium">
            {PHASE_META[phase].icon}
            {PHASE_META[phase].label}
          </span>
          <span className="text-sm text-ink-muted tabular-nums">
            Task {index + 1} of {totalTasks}
          </span>
        </div>
        <span className="text-sm text-ink-muted tabular-nums">
          {Math.round(overallProgress)}% complete
        </span>
      </div>
      <div className="h-1.5 bg-black/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-500 transition-all"
          style={{ width: `${overallProgress}%` }}
        />
      </div>

      {/* Main task card */}
      <div className="glimpse-card p-6 sm:p-8">
        <div className="flex items-start justify-between gap-6 flex-wrap mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl sm:text-3xl font-semibold text-ink leading-tight">
              {task.title}
            </h2>
            <p className="mt-2 text-base sm:text-lg text-ink-muted leading-relaxed">
              {task.instruction}
            </p>
          </div>
          <CountdownRing
            elapsed={elapsed}
            duration={task.durationSeconds}
            remaining={remaining}
          />
        </div>

        <div className="mt-2 animate-fade-up" key={task.id}>
          <TaskRenderer
            task={task}
            elapsedSeconds={elapsed}
            onInteractionUpdate={(patch) => {
              interactionRef.current = { ...interactionRef.current, ...patch };
            }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => setPaused((p) => !p)}
            className="gap-2"
          >
            {paused ? (
              <>
                <Play className="h-4 w-4" />
                Resume
              </>
            ) : (
              <>
                <Pause className="h-4 w-4" />
                Pause
              </>
            )}
          </Button>
          {onSkipAll ? (
            <Button variant="ghost" onClick={onSkipAll}>
              End session
            </Button>
          ) : null}
        </div>
        <Button
          variant="primary"
          onClick={() => advance(elapsed < task.durationSeconds * 0.5)}
          className="gap-2"
        >
          {isLast ? "Finish" : "Next"}
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      {/* Floating camera preview */}
      {(needsAudio || needsVideo) && (
        <CameraPreview
          enabled
          audio={needsAudio}
          video={needsVideo}
          className="fixed bottom-6 right-6 w-44 h-32 sm:w-56 sm:h-40 z-30"
        />
      )}
    </div>
  );
}

function CountdownRing({
  elapsed,
  duration,
  remaining,
}: {
  elapsed: number;
  duration: number;
  remaining: number;
}) {
  const size = 88;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(1, elapsed / duration);
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          fill="none"
          className="text-black/10"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className={cn(
            "transition-[stroke-dashoffset] duration-1000 ease-linear",
            remaining <= 5 ? "text-warn" : "text-brand-500",
          )}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-semibold text-ink tabular-nums">
          {remaining}
        </span>
      </div>
    </div>
  );
}
