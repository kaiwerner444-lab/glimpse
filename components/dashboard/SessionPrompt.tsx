import Link from "next/link";
import { Sunrise, Clock, Play } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface SessionPromptProps {
  available: boolean;
  scheduledLabel: string;
  taskCount: number;
  href: string;
}

// The "today's session" call to action. When the session window is open
// we surface a primary CTA that routes into the session runner.
export function SessionPrompt({
  available,
  scheduledLabel,
  taskCount,
  href,
}: SessionPromptProps) {
  return (
    <div className="relative overflow-hidden glimpse-card p-6 sm:p-7">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-50 blur-3xl pointer-events-none" />
      <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="h-14 w-14 rounded-2xl bg-brand-500 text-white flex items-center justify-center shrink-0 shadow-card">
          <Sunrise className="h-7 w-7" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium uppercase tracking-wider text-brand-500">
            Today&apos;s ritual
          </p>
          <h2 className="text-2xl font-semibold text-ink leading-tight mt-1">
            {available
              ? "Five minutes, when you're ready"
              : "Your next session"}
          </h2>
          <p className="mt-1.5 text-base text-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {scheduledLabel}
            </span>
            <span className="mx-2 text-ink-subtle">·</span>
            {taskCount} short tasks
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          {available ? (
            <Link href={href}>
              <Button size="lg" className="gap-2">
                <Play className="h-4 w-4" />
                Begin session
              </Button>
            </Link>
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
