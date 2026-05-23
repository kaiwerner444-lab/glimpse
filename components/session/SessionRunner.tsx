"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Mic,
  Eye,
  Activity,
  Brain,
  ArrowRight,
  Pause,
  Play,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CameraPreview } from "./CameraPreview";
import { TaskRenderer } from "./TaskRenderer";
import { ReactionProvider } from "./Reactions";
import { SessionSignalsProvider, useSessionSignals } from "./SessionSignals";
import { useComfort } from "@/lib/preferences/useComfort";
import { COMFORT_TUNING } from "@/lib/preferences/comfort";
import { cn } from "@/lib/utils";
import type { Task, TaskResult, Phase } from "@/lib/session/types";
import { TaskExtractor, type TaskFeatures } from "@/lib/ml/extractor";
import { scoreTask } from "@/lib/session/scoring";
import { TaskRecorder } from "@/lib/storage/recorder";
import {
  startSession,
  endSession,
  uploadTaskVideo,
  persistTaskFeatures,
  type SessionRecord,
} from "@/lib/storage/session-storage";

interface SessionRunnerProps {
  tasks: Task[];
  onComplete: (results: TaskResult[], features: TaskFeatures[]) => void;
  onSkipAll?: () => void;
}

const PHASE_META: Record<Phase, { label: string; icon: React.ReactNode }> = {
  speech: { label: "Speech", icon: <Mic className="h-4 w-4" /> },
  visual: { label: "Visual & facial", icon: <Eye className="h-4 w-4" /> },
  movement: { label: "Movement", icon: <Activity className="h-4 w-4" /> },
  cognitive: { label: "Cognitive", icon: <Brain className="h-4 w-4" /> },
};

export function SessionRunner(props: SessionRunnerProps) {
  return (
    <ReactionProvider>
      <SessionSignalsProvider>
        <SessionRunnerInner {...props} />
      </SessionSignalsProvider>
    </ReactionProvider>
  );
}

function SessionRunnerInner({
  tasks: rawTasks,
  onComplete,
  onSkipAll,
}: SessionRunnerProps) {
  const { publishTap, resetSignals } = useSessionSignals();
  const { enabled: comfort } = useComfort();
  // Stretch task durations in comfort mode so older or more anxious users
  // have generous reading + response time. Digit span gets explicit
  // memorise/recall boosts since shorter windows are the main pain point.
  const tasks = useMemo(() => {
    if (!comfort) return rawTasks;
    return rawTasks.map((t) => {
      const stretched = {
        ...t,
        durationSeconds: Math.round(
          t.durationSeconds * COMFORT_TUNING.taskDurationMultiplier,
        ),
      };
      if (t.kind === "digit_span") {
        return {
          ...stretched,
          memorizeSeconds:
            (t.memorizeSeconds ?? 5) + COMFORT_TUNING.digitSpanMemoriseBoostSeconds,
          recallSeconds:
            (t.recallSeconds ?? 8) + COMFORT_TUNING.digitSpanRecallBoostSeconds,
        };
      }
      return stretched;
    });
  }, [rawTasks, comfort]);
  const [index, setIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [results, setResults] = useState<TaskResult[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Persistent across the whole session
  const sessionRef = useRef<SessionRecord | null>(null);
  const sessionStartRef = useRef<number>(Date.now());
  const featuresRef = useRef<TaskFeatures[]>([]);

  // Per-task lifecycle
  const extractorRef = useRef<TaskExtractor | null>(null);
  const recorderRef = useRef<TaskRecorder | null>(null);
  const videoElRef = useRef<HTMLVideoElement | null>(null);

  // For the interaction state stored on each TaskResult
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

  // Mount: request mediastream + start session once.
  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          audio: needsAudio,
          video: needsVideo ? { facingMode: "user", width: 640, height: 480 } : false,
        });
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        setStream(s);
        // Create the hidden video element the extractor reads from.
        const v = document.createElement("video");
        v.srcObject = s;
        v.muted = true;
        v.playsInline = true;
        await v.play().catch(() => undefined);
        videoElRef.current = v;
        sessionRef.current = await startSession();
        sessionStartRef.current = Date.now();
      } catch (e) {
        setPermissionError(
          e instanceof Error
            ? e.message
            : "Camera and microphone access were denied. The session can still continue without recording.",
        );
        sessionRef.current = await startSession();
        sessionStartRef.current = Date.now();
      }
    }
    init();
    return () => {
      cancelled = true;
      const s = stream;
      if (s) s.getTracks().forEach((t) => t.stop());
    };
    // Run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Per-task lifecycle: start extractor + recorder when a new task arrives.
  useEffect(() => {
    if (!stream || !videoElRef.current || !task) return;
    resetSignals();
    const extractor = new TaskExtractor(task, videoElRef.current, stream, {
      onTap: publishTap,
    });
    extractorRef.current = extractor;
    extractor.run();

    // Record only when the task actually involves recordable signal.
    if (
      task.modality !== "none" &&
      stream.getTracks().some((t) => t.readyState === "live")
    ) {
      const rec = new TaskRecorder({ stream });
      recorderRef.current = rec;
      rec.start();
    } else {
      recorderRef.current = null;
    }

    return () => {
      // Cleanup happens in advance() so we can collect features. No-op here.
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task?.id, stream]);

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
    async (skipped: boolean) => {
      if (!task) return;
      // Stop and persist the current task's extractor + recorder.
      // Grab the speech transcript BEFORE stopping the extractor —
      // pullTranscript stops the SpeechRecognition cleanly.
      const transcript = extractorRef.current?.pullTranscript();
      const features = extractorRef.current?.stop();
      const blob = recorderRef.current
        ? await recorderRef.current.stop()
        : null;
      extractorRef.current = null;
      recorderRef.current = null;

      if (features) featuresRef.current.push(features);

      if (sessionRef.current) {
        if (features) {
          void persistTaskFeatures(sessionRef.current, features);
        }
        if (blob && blob.size > 0) {
          void uploadTaskVideo(sessionRef.current, task.id, blob);
        }
      }

      const baseResult: TaskResult = {
        taskId: task.id,
        startedAt: startedAtRef.current,
        endedAt: new Date().toISOString(),
        skipped,
        speechTranscript: transcript,
        ...interactionRef.current,
      };
      const scored = scoreTask({ task, result: baseResult, features });
      const next: TaskResult = {
        ...baseResult,
        taskScore: scored.score,
        taskScoreNote: scored.note,
      };
      const updated = [...results, next];
      setResults(updated);
      interactionRef.current = {};
      startedAtRef.current = new Date().toISOString();

      if (index + 1 >= totalTasks) {
        const dur = Math.round((Date.now() - sessionStartRef.current) / 1000);
        if (sessionRef.current) await endSession(sessionRef.current, dur);
        onComplete(updated, [...featuresRef.current]);
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

      {permissionError ? (
        <div className="glimpse-card p-4 bg-warn/10 border-warn/30 text-sm text-ink-muted">
          {permissionError}
        </div>
      ) : null}

      <div className="glimpse-card p-6 sm:p-8">
        <div className="flex items-start justify-between gap-6 flex-wrap mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl sm:text-3xl font-semibold text-ink leading-tight">
              {task.title}
            </h2>
            <p className="mt-2 text-base sm:text-lg text-ink-muted leading-relaxed">
              {task.instruction}
            </p>
            {task.whyToday ? (
              <div className="mt-4 rounded-xl bg-brand-50/60 border border-brand-500/15 px-4 py-3 flex items-start gap-2.5">
                <span className="inline-flex h-5 w-5 rounded-full bg-brand-500 text-white items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  ?
                </span>
                <p className="text-sm text-ink leading-relaxed">
                  <span className="font-medium text-brand-700">Why today: </span>
                  {task.whyToday}
                </p>
              </div>
            ) : null}
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

      <div className="sticky bottom-4 z-20 -mx-2 px-2 pt-2">
        <div className="glimpse-card flex items-center justify-between gap-3 flex-wrap px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-surface/95">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => setPaused((p) => !p)}
              className="gap-2"
              size="sm"
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
              <Button variant="ghost" onClick={onSkipAll} size="sm">
                End session
              </Button>
            ) : null}
          </div>
          <Button
            variant="primary"
            onClick={() => advance(elapsed < task.durationSeconds * 0.5)}
            className="gap-2"
          >
            {isLast ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Finish baseline
              </>
            ) : (
              <>
                I&apos;m done
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>

      {(needsAudio || needsVideo) && (
        <CameraPreview
          stream={stream}
          audio={needsAudio}
          video={needsVideo}
          capturing={!paused && !!stream}
          // Top-right of the viewport: stays visible during the task
          // without covering the primary "I'm done" action at the
          // bottom of the page.
          className="fixed top-20 right-4 sm:right-6 w-36 h-24 sm:w-44 sm:h-32 z-30"
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
