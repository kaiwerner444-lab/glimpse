import { Sparkles } from "lucide-react";
import { levelFromXp, progressToNext } from "@/lib/gamification/state";

interface LevelBadgeProps {
  xp: number;
}

export function LevelBadge({ xp }: LevelBadgeProps) {
  const level = levelFromXp(xp);
  const { ratio, xpToNext } = progressToNext(xp);
  const isMax = !Number.isFinite(level.nextXp);

  // Conic progress ring around the level number.
  const ringStyle = {
    background: `conic-gradient(#00707E ${ratio * 360}deg, rgba(0,112,126,0.12) 0deg)`,
  } as React.CSSProperties;

  return (
    <div className="glimpse-card p-5 flex items-center gap-4 relative overflow-hidden">
      <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-sunrise-100/70 blur-2xl pointer-events-none" />
      <div className="relative shrink-0">
        <div className="h-16 w-16 rounded-full p-1.5" style={ringStyle}>
          <div className="h-full w-full rounded-full bg-surface flex items-center justify-center">
            <span className="text-2xl font-bold text-brand-500 tabular-nums">
              {level.level}
            </span>
          </div>
        </div>
        <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-sunrise-400 text-white flex items-center justify-center shadow-card">
          <Sparkles className="h-3 w-3" />
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-ink-subtle">
          Level {level.level}
        </p>
        <p className="text-lg font-semibold text-ink truncate">{level.title}</p>
        <p className="text-sm text-ink-muted mt-0.5 tabular-nums">
          {isMax
            ? `${xp.toLocaleString()} XP · max level`
            : `${xp.toLocaleString()} XP · ${xpToNext} to next`}
        </p>
      </div>
    </div>
  );
}
