import { Target, CheckCheck } from "lucide-react";
import { WEEKLY_CHALLENGE_TARGET } from "@/lib/gamification/state";

interface WeeklyChallengeProps {
  progress: number;
}

export function WeeklyChallenge({ progress }: WeeklyChallengeProps) {
  const target = WEEKLY_CHALLENGE_TARGET;
  const ratio = Math.min(1, progress / target);
  const done = progress >= target;

  return (
    <div className="glimpse-card p-5 relative overflow-hidden">
      <div className="absolute -bottom-10 -right-8 h-32 w-32 rounded-full bg-brand-50 blur-2xl pointer-events-none" />
      <div className="relative flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center shrink-0">
          {done ? <CheckCheck className="h-6 w-6 text-success" /> : <Target className="h-6 w-6" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-subtle">
            This week's gentle challenge
          </p>
          <p className="text-base font-semibold text-ink">
            {done ? "Done — well held." : `Five sessions, anytime this week`}
          </p>
          <div className="mt-2.5 h-1.5 w-full bg-black/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 transition-[width] duration-700"
              style={{ width: `${ratio * 100}%` }}
            />
          </div>
          <p className="text-xs text-ink-muted mt-1.5 tabular-nums">
            {Math.min(progress, target)} / {target}
            {done ? " · +50 XP earned" : null}
          </p>
        </div>
      </div>
    </div>
  );
}
