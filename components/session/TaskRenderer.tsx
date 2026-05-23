"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { Task, StroopTrial, TaskResult } from "@/lib/session/types";

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
      return (
        <FingerTapTask
          hand={task.hand}
          onUpdate={onInteractionUpdate}
        />
      );
    case "digit_span":
      return (
        <DigitSpanTask
          direction={task.direction}
          digits={task.digits}
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
  // The shell already shows the title + instruction. Add a calm visual cue.
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
  // The dot traces a slow, predictable horizontal sweep.
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
  const [count, setCount] = useState(0);
  const handleTap = () => {
    setCount((c) => {
      const next = c + 1;
      onUpdate?.({ fingerTapCount: next });
      return next;
    });
  };
  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <p className="text-sm uppercase tracking-wider text-ink-muted">
        {hand === "right" ? "Right hand" : "Left hand"}
      </p>
      <button
        type="button"
        onClick={handleTap}
        className="h-40 w-40 rounded-full bg-brand-500 text-white text-3xl font-bold shadow-card hover:bg-brand-600 active:scale-95 transition tabular-nums"
        aria-label="Tap to count"
      >
        {count}
      </button>
      <p className="text-sm text-ink-muted">
        Tap as fast as you can
      </p>
    </div>
  );
}

function DigitSpanTask({
  direction,
  digits,
  onUpdate,
}: {
  direction: "forward" | "backward";
  digits: number[];
  onUpdate?: (patch: Partial<TaskResult>) => void;
}) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [answer, setAnswer] = useState("");
  const expected = useMemo(
    () => (direction === "forward" ? digits : [...digits].reverse()).join(""),
    [direction, digits],
  );
  const correct = answer.replace(/\s/g, "") === expected;

  return (
    <div className="flex flex-col items-center gap-5 py-2">
      <p className="text-sm uppercase tracking-wider text-ink-muted">
        Memorise these digits
      </p>
      <div className="flex gap-2 sm:gap-3 flex-wrap justify-center">
        {digits.map((d, i) => (
          <span
            key={i}
            className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-surface border border-black/10 flex items-center justify-center text-3xl sm:text-4xl font-semibold text-ink tabular-nums"
          >
            {d}
          </span>
        ))}
      </div>
      <p className="text-sm text-ink-muted">
        {direction === "forward"
          ? "Type them in the same order"
          : "Type them in reverse order"}
      </p>
      <input
        type="text"
        inputMode="numeric"
        value={answer}
        onChange={(e) => {
          const v = e.target.value.replace(/[^0-9]/g, "");
          setAnswer(v);
          setShowAnswer(false);
          onUpdate?.({ digitSpanAnswer: v });
        }}
        onBlur={() => setShowAnswer(true)}
        placeholder="e.g. 7294618"
        className="text-center text-2xl font-semibold h-14 w-64 rounded-xl border border-black/10 bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 tracking-widest"
      />
      {showAnswer && answer ? (
        <p
          className={cn(
            "text-sm font-medium",
            correct ? "text-success" : "text-warn",
          )}
        >
          {correct ? "Matches" : "We'll keep this as your baseline"}
        </p>
      ) : null}
    </div>
  );
}

function StroopTask({
  trials,
  onUpdate,
}: {
  trials: StroopTrial[];
  onUpdate?: (patch: Partial<TaskResult>) => void;
}) {
  const [index, setIndex] = useState(0);
  const correctRef = useRef(0);
  const trial = trials[Math.min(index, trials.length - 1)];

  const COLORS: Array<{ value: StroopTrial["color"]; cls: string; label: string }> = [
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
    if (c === trial.color) correctRef.current += 1;
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
          "text-6xl sm:text-7xl font-extrabold tracking-tight select-none",
          COLOR_TEXT[trial.color],
        )}
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
