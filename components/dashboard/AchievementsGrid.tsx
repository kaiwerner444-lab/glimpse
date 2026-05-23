import { ACHIEVEMENTS } from "@/lib/gamification/achievements";
import { Award, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface AchievementsGridProps {
  unlockedIds: string[];
}

export function AchievementsGrid({ unlockedIds }: AchievementsGridProps) {
  const unlocked = new Set(unlockedIds);
  const sorted = [...ACHIEVEMENTS].sort((a, b) => a.order - b.order);
  const unlockedCount = sorted.filter((a) => unlocked.has(a.id)).length;

  return (
    <section className="glimpse-card p-6">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-brand-500">
            Achievements
          </p>
          <h2 className="text-xl font-semibold text-ink mt-1">
            Quiet wins
          </h2>
        </div>
        <span className="text-sm text-ink-muted tabular-nums">
          {unlockedCount} / {sorted.length}
        </span>
      </div>

      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {sorted.map((a) => {
          const isUnlocked = unlocked.has(a.id);
          return (
            <li
              key={a.id}
              className={cn(
                "rounded-2xl border px-3 py-3 transition",
                isUnlocked
                  ? "border-brand-500/40 bg-brand-50/50 shadow-card"
                  : "border-black/10 bg-surface-alt opacity-70",
              )}
            >
              <div className="flex items-start gap-2.5">
                <div
                  className={cn(
                    "h-9 w-9 rounded-xl flex items-center justify-center shrink-0",
                    isUnlocked
                      ? "bg-brand-500 text-white"
                      : "bg-black/[0.06] text-ink-subtle",
                  )}
                >
                  {isUnlocked ? (
                    <Award className="h-4.5 w-4.5" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-sm font-semibold leading-tight",
                      isUnlocked ? "text-ink" : "text-ink-muted",
                    )}
                  >
                    {a.title}
                  </p>
                  <p className="text-xs text-ink-muted mt-1 leading-snug line-clamp-2">
                    {a.body}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
