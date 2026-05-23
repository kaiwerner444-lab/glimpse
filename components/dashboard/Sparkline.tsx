"use client";

import { useId, useMemo } from "react";
import { cn } from "@/lib/utils";

interface SparklineProps {
  points: number[];
  width?: number;
  height?: number;
  tone?: "improving" | "stable" | "watch";
  className?: string;
  showFill?: boolean;
}

const TONE_STROKE: Record<NonNullable<SparklineProps["tone"]>, string> = {
  improving: "#2F855A",
  stable: "#00707E",
  watch: "#B7791F",
};

const TONE_FILL: Record<NonNullable<SparklineProps["tone"]>, string> = {
  improving: "#2F855A",
  stable: "#00707E",
  watch: "#B7791F",
};

export function Sparkline({
  points,
  width = 240,
  height = 64,
  tone = "stable",
  className,
  showFill = true,
}: SparklineProps) {
  const gradId = useId();
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const pad = 4;

  const { linePath, areaPath, lineLength } = useMemo(() => {
    const stepX = (width - pad * 2) / Math.max(1, points.length - 1);
    const coords = points.map((v, i) => {
      const x = pad + i * stepX;
      const y = pad + (height - pad * 2) * (1 - (v - min) / range);
      return [x, y] as const;
    });

    // Smoothed cubic path for a softer curve.
    let line = `M ${coords[0][0]},${coords[0][1]}`;
    for (let i = 1; i < coords.length; i += 1) {
      const [x0, y0] = coords[i - 1];
      const [x1, y1] = coords[i];
      const mx = (x0 + x1) / 2;
      line += ` C ${mx},${y0} ${mx},${y1} ${x1},${y1}`;
    }

    const last = coords[coords.length - 1];
    const first = coords[0];
    const area = `${line} L ${last[0]},${height - pad} L ${first[0]},${height - pad} Z`;

    // Approximate length for stroke-dash draw-in animation.
    let len = 0;
    for (let i = 1; i < coords.length; i += 1) {
      const dx = coords[i][0] - coords[i - 1][0];
      const dy = coords[i][1] - coords[i - 1][1];
      len += Math.sqrt(dx * dx + dy * dy);
    }
    return { linePath: line, areaPath: area, lineLength: Math.ceil(len * 1.05) };
  }, [points, width, height, min, range]);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("w-full h-auto", className)}
      preserveAspectRatio="none"
      role="img"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={TONE_FILL[tone]} stopOpacity="0.22" />
          <stop offset="100%" stopColor={TONE_FILL[tone]} stopOpacity="0" />
        </linearGradient>
      </defs>
      {showFill ? <path d={areaPath} fill={`url(#${gradId})`} /> : null}
      <path
        d={linePath}
        fill="none"
        stroke={TONE_STROKE[tone]}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={lineLength}
        className="animate-draw-line"
        style={{ ["--line-length" as never]: lineLength } as React.CSSProperties}
      />
    </svg>
  );
}
