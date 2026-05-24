"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ScoreRingProps {
  value: number; // 0-100
  size?: number;
  label?: string;
  sublabel?: string;
  className?: string;
}

// Animated circular progress ring. Used in the session detail hero
// to turn the overall score into a defining visual.
export function ScoreRing({
  value,
  size = 132,
  label,
  sublabel,
  className,
}: ScoreRingProps) {
  const [drawn, setDrawn] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setDrawn(value));
    return () => cancelAnimationFrame(id);
  }, [value]);

  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.max(0, Math.min(100, drawn)) / 100);

  const tone =
    value >= 80
      ? { ring: "#2F855A", text: "text-success" }
      : value >= 60
        ? { ring: "#00707E", text: "text-brand-600" }
        : value > 0
          ? { ring: "#B7791F", text: "text-warn" }
          : { ring: "#8A9497", text: "text-ink-subtle" };

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(14, 20, 19, 0.06)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={tone.ring}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{
            transition:
              "stroke-dashoffset 1.4s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-3xl font-semibold tabular-nums leading-none", tone.text)}>
          {value > 0 ? value : "—"}
        </span>
        {label ? (
          <span className="text-[10px] uppercase tracking-[0.16em] text-ink-subtle mt-1.5">
            {label}
          </span>
        ) : null}
        {sublabel ? (
          <span className="text-xs text-ink-muted mt-0.5 tabular-nums">
            {sublabel}
          </span>
        ) : null}
      </div>
    </div>
  );
}
