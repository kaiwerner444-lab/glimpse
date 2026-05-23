"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { Task, StroopTrial, TaskResult } from "@/lib/session/types";
import { useReactions } from "./Reactions";
import { useSessionSignals } from "./SessionSignals";

interface TaskRendererProps {
  task: Task;
  elapsedSeconds: number;
  onInteractionUpdate?: (patch: Partial<TaskResult>) => void;
}

export function TaskRenderer({
  task,
  elapsedSeconds,
  onInteractionUpdate,
}: TaskRendererProps) {
  switch (task.kind) {
    case "instruction":
      return <InstructionTask />;
    case "read_passage":
      return <ReadPassageTask passage={task.passage} />;
    case "open_prompt":
      return <OpenPromptTask question={task.question} />;
    case "verbal_fluency":
      return <VerbalFluencyTask category={task.category} />;
    case "countdown_math":
      return (
        <CountdownMathTask
          startFrom={task.startFrom}
          subtractBy={task.subtractBy}
        />
      );
    case "smooth_pursuit":
      return (
        <SmoothPursuitTask
          elapsedSeconds={elapsedSeconds}
          durationSeconds={task.durationSeconds}
        />
      );
    case "finger_tap":
      return <FingerTapTask hand={task.hand} onUpdate={onInteractionUpdate} />;
    case "digit_span":
      return (
        <DigitSpanTask
          direction={task.direction}
          digits={task.digits}
          memorizeSeconds={task.memorizeSeconds ?? 5}
          recallSeconds={task.recallSeconds ?? 8}
          minLength={task.minLength ?? 4}
          maxLength={task.maxLength ?? 7}
          onUpdate={onInteractionUpdate}
        />
      );
    case "stroop":
      return (
        <StroopTask trials={task.trials} onUpdate={onInteractionUpdate} />
      );
  }
}

// ─── Task-specific UIs ─────────────────────────────────────────────────

function InstructionTask() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="h-24 w-24 rounded-full bg-brand-50 flex items-center justify-center">
        <div className="h-12 w-12 rounded-full bg-brand-500/20 flex items-center justify-center">
          <div className="h-5 w-5 rounded-full bg-brand-500 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function ReadPassageTask({ passage }: { passage: string }) {
  return (
    <blockquote className="border-l-4 border-brand-500 pl-5 py-1 text-lg sm:text-xl leading-relaxed text-ink">
      {passage}
    </blockquote>
  );
}

function OpenPromptTask({ question }: { question: string }) {
  return (
    <div className="bg-brand-50/60 rounded-2xl p-6 sm:p-8 text-center">
      <p className="text-2xl sm:text-3xl font-semibold text-brand-700 leading-snug">
        {question}
      </p>
    </div>
  );
}

function VerbalFluencyTask({ category }: { category: string }) {
  return (
    <div className="text-center py-6">
      <p className="text-sm uppercase tracking-wider text-ink-muted mb-3">
        Category
      </p>
      <p className="text-4xl sm:text-5xl font-bold text-brand-500 tracking-tight">
        {category}
      </p>
    </div>
  );
}

function CountdownMathTask({
  startFrom,
  subtractBy,
}: {
  startFrom: number;
  subtractBy: number;
}) {
  return (
    <div className="text-center py-6">
      <p className="text-sm uppercase tracking-wider text-ink-muted mb-3">
        Start from
      </p>
      <p className="text-5xl sm:text-6xl font-bold text-ink tracking-tight tabular-nums">
        {startFrom}
      </p>
      <p className="mt-4 text-base text-ink-muted">
        Subtract <span className="font-semibold text-ink">{subtractBy}</span> each time
      </p>
    </div>
  );
}

function SmoothPursuitTask({
  elapsedSeconds,
  durationSeconds,
}: {
  elapsedSeconds: number;
  durationSeconds: number;
}) {
  const progress = (elapsedSeconds / durationSeconds) * Math.PI * 2;
  const x = 50 + 42 * Math.sin(progress);
  return (
    <div className="relative h-44 sm:h-52 bg-surface-alt rounded-2xl overflow-hidden">
      <div
        className="absolute top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-brand-500 shadow-card transition-none"
        style={{ left: `${x}%`, transform: `translate(-50%, -50%)` }}
      />
    </div>
  );
}

function FingerTapTask({
  hand,
  onUpdate,
}: {
  hand: "left" | "right";
  onUpdate?: (patch: Partial<TaskResult>) => void;
}) {
  const { push } = useReactions();
  const { liveTapCount } = useSessionSignals();
  // Manual button-tap count, used as a fallback when the camera can't see
  // the hand clearly. The display shows the SUM of both sources so the user
  // sees their effort reflected immediately.
  const [manualCount, setManualCount] = useState(0);
  const total = liveTapCount + manualCount;

  // Milestone reactions, fired once each per task.
  const fired = useRef<Set<number>>(new Set());
  useEffect(() => {
    onUpdate?.({ fingerTapCount: total });
    if (total >= 20 && !fired.current.has(20)) {
      push({ text: "Nice rhythm", tone: "neutral", emoji: "sparkle" });
      fired.current.add(20);
    }
    if (total >= 40 && !fired.current.has(40)) {
      push({ text: "Steady — good", tone: "success", emoji: "check" });
      fired.current.add(40);
    }
    if (total >= 60 && !fired.current.has(60)) {
      push({ text: "Strong pace", tone: "success", emoji: "check" });
      fired.current.add(60);
    }
  }, [total, onUpdate, push]);

  // The pulse cue on every tap (from either source) — small flash animation.
  const [pulseKey, setPulseKey] = useState(0);
  useEffect(() => {
    if (total === 0) return;
    setPulseKey((k) => k + 1);
  }, [total]);

  const handleManualTap = () => setManualCount((c) => c + 1);

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <p className="text-sm uppercase tracking-wider text-ink-muted">
        {hand === "right" ? "Right hand" : "Left hand"}
      </p>
      <div className="relative">
        <span
          key={pulseKey}
          aria-hidden
          className="absolute inset-0 rounded-full bg-brand-500/30 animate-ping"
          style={{ animationDuration: "0.6s", animationIterationCount: 1 }}
        />
        <button
          type="button"
          onClick={handleManualTap}
          className="relative h-40 w-40 rounded-full bg-brand-500 text-white text-3xl font-bold shadow-card hover:bg-brand-600 active:scale-95 transition tabular-nums"
          aria-label="Tap to count"
        >
          {total}
        </button>
      </div>
      <div className="text-center">
        <p className="text-sm text-ink-muted">
          Tap your thumb and index finger together as fast as you can
        </p>
        <p className="text-xs text-ink-subtle mt-1">
          We detect from the camera · the button works as a fallback
        </p>
      </div>
    </div>
  );
}

// ─── Digit Span (memorise → hide → recall, multi-trial) ──────────────

type DigitPhase = "memorize" | "recall" | "feedback";

function DigitSpanTask({
  direction,
  digits,
  memorizeSeconds,
  recallSeconds,
  minLength,
  maxLength,
  onUpdate,
}: {
  direction: "forward" | "backward";
  digits: number[];
  memorizeSeconds: number;
  recallSeconds: number;
  minLength: number;
  maxLength: number;
  onUpdate?: (patch: Partial<TaskResult>) => void;
}) {
  const { push } = useReactions();
  const [trial, setTrial] = useState(0);
  const [phase, setPhase] = useState<DigitPhase>("memorize");
  const [phaseElapsed, setPhaseElapsed] = useState(0);
  const [answer, setAnswer] = useState("");
  const [lastResult, setLastResult] = useState<
    null | { correct: boolean; expected: string; given: string }
  >(null);
  const correctCount = useRef(0);
  const totalCount = useRef(0);

  // Generate the current trial's sequence by sampling a sub-array.
  // Length grows with each trial, capped at maxLength.
  const sequence = useMemo(() => {
    const len = Math.min(maxLength, minLength + trial);
    // Deterministic pick: use trial as a rotation offset over the pool.
    const out: number[] = [];
    for (let i = 0; i < len; i += 1) {
      out.push(digits[(i + trial * 3) % digits.length]);
    }
    return out;
  }, [trial, digits, minLength, maxLength]);

  const expected = useMemo(
    () =>
      (direction === "forward" ? sequence : [...sequence].reverse()).join(""),
    [direction, sequence],
  );

  // Drive the phase clock.
  useEffect(() => {
    setPhaseElapsed(0);
    if (phase === "memorize") {
      const id = setInterval(() => setPhaseElapsed((e) => e + 1), 1000);
      return () => clearInterval(id);
    }
    if (phase === "recall") {
      const id = setInterval(() => setPhaseElapsed((e) => e + 1), 1000);
      return () => clearInterval(id);
    }
    return undefined;
  }, [phase, trial]);

  // Auto-advance phases.
  useEffect(() => {
    if (phase === "memorize" && phaseElapsed >= memorizeSeconds) {
      setPhase("recall");
    } else if (phase === "recall" && phaseElapsed >= recallSeconds) {
      grade();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, phaseElapsed]);

  function grade() {
    const given = answer.replace(/\s/g, "");
    const correct = given === expected;
    totalCount.current += 1;
    if (correct) correctCount.current += 1;
    setLastResult({ correct, expected, given });
    onUpdate?.({
      digitSpanAnswer: given,
      stroopCorrect: correctCount.current,
      stroopTotal: totalCount.current,
    });
    if (correct) {
      push({ text: "Spot on", tone: "success", emoji: "check" });
    } else if (given.length > 0 && hammingClose(given, expected)) {
      push({
        text: "Close — your baseline learns this",
        tone: "gentle",
        emoji: "heart",
      });
    } else {
      push({
        text: "That's okay, we're still learning your normal",
        tone: "gentle",
        emoji: "heart",
      });
    }
    setPhase("feedback");
    // Briefly show feedback, then advance.
    setTimeout(() => {
      setAnswer("");
      setLastResult(null);
      setTrial((t) => t + 1);
      setPhase("memorize");
    }, 1800);
  }

  const memorizeProgress = Math.min(1, phaseElapsed / memorizeSeconds);
  const recallProgress = Math.min(1, phaseElapsed / recallSeconds);

  return (
    <div className="flex flex-col items-center gap-5 py-2 min-h-[280px]">
      <div className="flex items-center gap-3">
        <p className="text-sm uppercase tracking-wider text-ink-muted">
          Trial {trial + 1}
        </p>
        <span className="text-xs text-ink-subtle tabular-nums">
          {correctCount.current} of {totalCount.current} correct so far
        </span>
      </div>

      {phase === "memorize" ? (
        <>
          <div className="flex gap-2 sm:gap-3 flex-wrap justify-center">
            {sequence.map((d, i) => (
              <span
                key={`${trial}-${i}`}
                className={cn(
                  "h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-surface border border-black/10 flex items-center justify-center text-3xl sm:text-4xl font-semibold text-ink tabular-nums animate-fade-up",
                )}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {d}
              </span>
            ))}
          </div>
          <PhaseTimer
            label="memorise"
            remaining={memorizeSeconds - phaseElapsed}
            progress={memorizeProgress}
          />
        </>
      ) : null}

      {phase === "recall" ? (
        <>
          <div className="flex gap-2 sm:gap-3 flex-wrap justify-center">
            {sequence.map((_, i) => (
              <span
                key={`${trial}-hidden-${i}`}
                className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-ink/90 flex items-center justify-center text-white text-2xl font-semibold animate-fade-in"
              >
                ?
              </span>
            ))}
          </div>
          <p className="text-sm text-ink-muted">
            {direction === "forward"
              ? "Type them in the same order"
              : "Type them in reverse order"}
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              grade();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              inputMode="numeric"
              autoFocus
              autoComplete="off"
              spellCheck={false}
              value={answer}
              onChange={(e) =>
                setAnswer(e.target.value.replace(/[^0-9]/g, ""))
              }
              aria-label="Type the digits you memorised"
              className="text-center text-2xl font-semibold h-14 w-64 rounded-xl border border-black/10 bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 tracking-widest"
            />
            <button
              type="submit"
              className="h-14 px-5 rounded-xl bg-brand-500 text-white font-semibold hover:bg-brand-600 transition"
            >
              Enter
            </button>
          </form>
          <PhaseTimer
            label="recall"
            remaining={recallSeconds - phaseElapsed}
            progress={recallProgress}
          />
        </>
      ) : null}

      {phase === "feedback" && lastResult ? (
        <div
          className={cn(
            "rounded-2xl px-6 py-4 text-center w-full max-w-md animate-fade-up",
            lastResult.correct
              ? "bg-success/10 text-success"
              : "bg-sunrise-50 text-sunrise-500",
          )}
        >
          <p className="text-sm font-medium uppercase tracking-wider">
            {lastResult.correct ? "Spot on" : "Captured"}
          </p>
          <p className="text-2xl font-semibold mt-1 tracking-widest tabular-nums">
            {lastResult.expected}
          </p>
          {!lastResult.correct && lastResult.given ? (
            <p className="text-sm text-ink-muted mt-1">
              You said: <span className="font-semibold">{lastResult.given}</span>
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function PhaseTimer({
  label,
  remaining,
  progress,
}: {
  label: string;
  remaining: number;
  progress: number;
}) {
  return (
    <div className="w-full max-w-xs flex flex-col items-center gap-1.5">
      <div className="h-1 w-full bg-black/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-500 transition-[width] duration-1000 ease-linear"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <p className="text-xs text-ink-subtle tabular-nums">
        {label} · {Math.max(0, remaining)}s
      </p>
    </div>
  );
}

function hammingClose(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  let diffs = 0;
  const max = Math.max(a.length, b.length);
  for (let i = 0; i < max; i += 1) {
    if (a[i] !== b[i]) diffs += 1;
    if (diffs > 1) return false;
  }
  return diffs <= 1;
}

// ─── Stroop with reactions ───────────────────────────────────────────

function StroopTask({
  trials,
  onUpdate,
}: {
  trials: StroopTrial[];
  onUpdate?: (patch: Partial<TaskResult>) => void;
}) {
  const { push } = useReactions();
  const [index, setIndex] = useState(0);
  const correctRef = useRef(0);
  const streakRef = useRef(0);
  const trial = trials[Math.min(index, trials.length - 1)];

  const COLORS: Array<{
    value: StroopTrial["color"];
    cls: string;
    label: string;
  }> = [
    { value: "red", cls: "bg-red-500", label: "Red" },
    { value: "blue", cls: "bg-blue-500", label: "Blue" },
    { value: "green", cls: "bg-green-500", label: "Green" },
    { value: "yellow", cls: "bg-yellow-500", label: "Yellow" },
  ];

  const COLOR_TEXT: Record<StroopTrial["color"], string> = {
    red: "text-red-500",
    blue: "text-blue-500",
    green: "text-green-500",
    yellow: "text-yellow-500",
  };

  const pick = (c: StroopTrial["color"]) => {
    const isRight = c === trial.color;
    if (isRight) {
      correctRef.current += 1;
      streakRef.current += 1;
      if (streakRef.current === 3) {
        push({ text: "Three in a row — nice", tone: "success", emoji: "check" });
      } else if (streakRef.current === 6) {
        push({ text: "Lovely streak", tone: "success", emoji: "sparkle" });
      } else if (streakRef.current === 1 && index > 0) {
        // First correct after a miss — keep it gentle.
      }
    } else {
      streakRef.current = 0;
      if (index % 4 === 3) {
        push({ text: "That's okay, keep going", tone: "gentle", emoji: "heart" });
      }
    }
    const next = index + 1;
    setIndex(next);
    onUpdate?.({
      stroopCorrect: correctRef.current,
      stroopTotal: Math.min(next, trials.length),
    });
  };

  if (index >= trials.length) {
    return (
      <div className="text-center py-6">
        <p className="text-base text-ink-muted mb-2">All trials complete</p>
        <p className="text-3xl font-semibold text-ink">
          {correctRef.current} / {trials.length} correct
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 py-2">
      <p className="text-sm uppercase tracking-wider text-ink-muted">
        Trial {index + 1} of {trials.length} · Tap the colour, not the word
      </p>
      <p
        className={cn(
          "text-6xl sm:text-7xl font-extrabold tracking-tight select-none transition-opacity animate-fade-up",
          COLOR_TEXT[trial.color],
        )}
        key={index}
      >
        {trial.word}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-md">
        {COLORS.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => pick(c.value)}
            className={cn(
              "h-14 rounded-xl text-white text-base font-semibold shadow-card hover:opacity-90 active:scale-95 transition",
              c.cls,
            )}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
