import { Sun } from "lucide-react";

interface StreakBadgeProps {
  days: number;
  totalSessions: number;
}

export function StreakBadge({ days, totalSessions }: StreakBadgeProps) {
  return (
    <div className="glimpse-card p-5 flex items-center gap-4">
      <div className="relative h-14 w-14 shrink-0">
        <div className="absolute inset-0 rounded-2xl bg-sunrise-100 animate-horizon-glow" />
        <div className="absolute inset-0 flex items-center justify-center text-sunrise-500">
          <Sun className="h-7 w-7" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold text-ink tabular-nums">
            {days}
          </span>
          <span className="text-base text-ink-muted">
            {days === 1 ? "day" : "days"} in a row
          </span>
        </div>
        <p className="text-sm text-ink-muted mt-0.5">
          {totalSessions} {totalSessions === 1 ? "session" : "sessions"} so far.
          Keep going at your own pace.
        </p>
      </div>
    </div>
  );
}
