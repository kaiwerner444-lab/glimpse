import { CheckCircle2, Circle, Dot } from "lucide-react";
import { LEARNING_PATH, currentStage } from "@/lib/dashboard/learning-path";
import { cn } from "@/lib/utils";

interface LearningPathProps {
  daysSinceStart: number;
}

export function LearningPath({ daysSinceStart }: LearningPathProps) {
  const stage = currentStage(daysSinceStart);
  const stageIdx = LEARNING_PATH.findIndex((s) => s.id === stage.id);
  const stageProgress =
    (daysSinceStart - stage.fromDay) / Math.max(1, stage.toDay - stage.fromDay);
  const clampedProgress = Math.max(0, Math.min(1, stageProgress));

  return (
    <section className="glimpse-card p-6">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-brand-500">
            Your learning path
          </p>
          <h2 className="text-xl font-semibold text-ink mt-1">
            {stage.title}
          </h2>
        </div>
        <span className="text-sm text-ink-muted tabular-nums">
          Day {daysSinceStart}
        </span>
      </div>

      <p className="text-base text-ink-muted leading-relaxed mb-5">
        {stage.body}
      </p>

      <div className="space-y-3">
        {LEARNING_PATH.map((s, i) => {
          const isPast = i < stageIdx;
          const isCurrent = i === stageIdx;
          return (
            <div
              key={s.id}
              className="flex items-start gap-3"
            >
              <div className="mt-0.5">
                {isPast ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : isCurrent ? (
                  <span className="relative inline-flex h-5 w-5">
                    <span className="absolute inset-0 rounded-full bg-brand-500/20 animate-glimpse-pulse" />
                    <Dot className="absolute inset-0 m-auto h-3 w-3 text-brand-500 fill-brand-500" />
                  </span>
                ) : (
                  <Circle className="h-5 w-5 text-ink-subtle" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p
                    className={cn(
                      "text-base font-medium",
                      isCurrent ? "text-ink" : "text-ink-muted",
                    )}
                  >
                    {s.title}
                  </p>
                  <span className="text-xs text-ink-subtle tabular-nums">
                    days {s.fromDay}–{s.toDay}
                  </span>
                </div>
                {isCurrent ? (
                  <div className="mt-2 h-1 w-full bg-black/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 transition-[width] duration-1000"
                      style={{ width: `${clampedProgress * 100}%` }}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
