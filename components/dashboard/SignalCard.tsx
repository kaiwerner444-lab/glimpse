import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { Sparkline } from "./Sparkline";
import { percentChange } from "@/lib/dashboard/synth-data";
import type { SignalSeries } from "@/lib/dashboard/types";
import { cn } from "@/lib/utils";

interface SignalCardProps {
  series: SignalSeries;
}

const TONE_PILL: Record<SignalSeries["direction"], string> = {
  improving: "bg-success/12 text-success",
  stable: "bg-brand-50 text-brand-600",
  watch: "bg-warn/15 text-warn",
};

const TONE_LABEL: Record<SignalSeries["direction"], string> = {
  improving: "Improving",
  stable: "Holding steady",
  watch: "Worth noticing",
};

export function SignalCard({ series }: SignalCardProps) {
  const change = percentChange(series.points);
  const latest = series.points[series.points.length - 1];
  const sign = change > 0.5 ? "up" : change < -0.5 ? "down" : "flat";

  return (
    <div className="glimpse-card p-5 group hover:shadow-card transition-shadow flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-ink truncate">
            {series.label}
          </h3>
          <p className="text-xs uppercase tracking-wider text-ink-subtle mt-0.5">
            {series.phase}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
            TONE_PILL[series.direction],
          )}
        >
          {TONE_LABEL[series.direction]}
        </span>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold text-ink tabular-nums leading-none">
          {formatValue(latest)}
        </span>
        <span className="text-sm text-ink-muted">{series.unit}</span>
        <span
          className={cn(
            "ml-auto inline-flex items-center gap-1 text-sm font-medium tabular-nums",
            sign === "up" && "text-success",
            sign === "down" && "text-warn",
            sign === "flat" && "text-ink-muted",
          )}
        >
          {sign === "up" && <ArrowUpRight className="h-3.5 w-3.5" />}
          {sign === "down" && <ArrowDownRight className="h-3.5 w-3.5" />}
          {sign === "flat" && <Minus className="h-3.5 w-3.5" />}
          {Math.abs(change).toFixed(1)}%
        </span>
      </div>

      <Sparkline
        points={series.points}
        tone={series.direction}
        height={56}
      />

      <p className="text-sm text-ink-muted leading-relaxed line-clamp-2">
        {series.blurb}
      </p>
    </div>
  );
}

function formatValue(v: number): string {
  return v >= 100 ? Math.round(v).toString() : v.toFixed(1);
}
