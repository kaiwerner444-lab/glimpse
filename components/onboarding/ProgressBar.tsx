import { cn } from "@/lib/utils";

interface ProgressBarProps {
  currentIndex: number;
  total: number;
  className?: string;
}

export function ProgressBar({ currentIndex, total, className }: ProgressBarProps) {
  return (
    <div
      role="progressbar"
      aria-valuenow={currentIndex + 1}
      aria-valuemin={1}
      aria-valuemax={total}
      className={cn("flex items-center gap-1.5 w-full", className)}
    >
      {Array.from({ length: total }).map((_, i) => {
        const state =
          i < currentIndex
            ? "done"
            : i === currentIndex
              ? "active"
              : "pending";
        return (
          <span
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              state === "done" && "bg-brand-500",
              state === "active" && "bg-brand-500/60",
              state === "pending" && "bg-black/10",
            )}
          />
        );
      })}
    </div>
  );
}
