"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sunrise, Clock, Play, Anchor } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { loadGamification } from "@/lib/gamification/state";

interface SessionPromptProps {
  available: boolean;
  scheduledLabel: string;
  taskCount: number;
  href: string;
}

// Today's-ritual call to action. Uses a programmatic router push instead
// of wrapping the button in a <Link> — nesting <button> inside <a> is
// invalid HTML and Safari/Chrome don't reliably propagate the click,
// which is why "Begin session" appeared dead.
export function SessionPrompt({
  available,
  scheduledLabel,
  taskCount,
  href,
}: SessionPromptProps) {
  const router = useRouter();
  const [habitAnchor, setHabitAnchor] = useState<string | null>(null);
  useEffect(() => {
    setHabitAnchor(loadGamification().habitAnchor);
  }, []);

  return (
    <div className="relative overflow-hidden glimpse-card-elevated p-6 sm:p-8">
      <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(closest-side,_#CCEAEB,_transparent_72%)] opacity-80 pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 h-44 w-44 rounded-full bg-[radial-gradient(closest-side,_#FFEFD7,_transparent_72%)] opacity-70 pointer-events-none" />
      <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="h-14 w-14 rounded-2xl bg-brand-500 text-white flex items-center justify-center shrink-0 shadow-elevated">
          <Sunrise className="h-7 w-7" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-brand-600">
            Today&apos;s ritual
          </p>
          <h2 className="glimpse-display text-3xl sm:text-4xl text-ink mt-1">
            {available
              ? "Five minutes, when you're ready"
              : "Your next session"}
          </h2>
          <p className="mt-2.5 text-base text-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {scheduledLabel}
            </span>
            <span className="mx-2 text-ink-subtle">·</span>
            {taskCount} short tasks
          </p>
          {habitAnchor ? (
            <p className="mt-2 text-sm text-ink-muted inline-flex items-center gap-1.5">
              <Anchor className="h-3.5 w-3.5 text-brand-500" />
              After your <span className="font-medium text-ink">{habitAnchor}</span>.
            </p>
          ) : null}
        </div>
        <div className="shrink-0 flex items-center gap-2">
          {available ? (
            <Button
              size="lg"
              className="gap-2 shadow-elevated"
              onClick={() => router.push(href)}
              onMouseEnter={() => router.prefetch(href)}
            >
              <Play className="h-4 w-4" />
              Begin session
            </Button>
          ) : (
            <Button variant="secondary" size="lg">
              Reschedule
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
