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
  // Pulsing dot at the most recent data point. Great on cards;
  // overkill in dense report grids — leave off there.
  showEndDot?: boolean;
}

const TONE_STROKE: Record<NonNullable<SparklineProps["tone"]>, string> = {
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
  showEndDot = true,
}: SparklineProps) {
  const id = useId();
  const stroke = TONE_STROKE[tone];

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const pad = 6;

  const { linePath, areaPath, lineLength, last } = useMemo(() => {
    const stepX = (width - pad * 2) / Math.max(1, points.length - 1);
    const coords = points.map((v, i) => {
      const x = pad + i * stepX;
      const y = pad + (height - pad * 2) * (1 - (v - min) / range);
      return [x, y] as const;
    });

    // Catmull-Rom-like cubic smoothing for prettier curves.
    let line = `M ${coords[0][0]},${coords[0][1]}`;
    for (let i = 1; i < coords.length; i += 1) {
      const [x0, y0] = coords[i - 1];
      const [x1, y1] = coords[i];
      const mx = (x0 + x1) / 2;
      line += ` C ${mx},${y0} ${mx},${y1} ${x1},${y1}`;
    }

    const lastCoord = coords[coords.length - 1];
    const firstCoord = coords[0];
    const area = `${line} L ${lastCoord[0]},${height - pad} L ${firstCoord[0]},${height - pad} Z`;

    // Approximate path length for the draw-in animation.
    let len = 0;
    for (let i = 1; i < coords.length; i += 1) {
      const dx = coords[i][0] - coords[i - 1][0];
      const dy = coords[i][1] - coords[i - 1][1];
      len += Math.sqrt(dx * dx + dy * dy);
    }
    return {
      linePath: line,
      areaPath: area,
      lineLength: Math.ceil(len * 1.05),
      last: lastCoord,
    };
  }, [points, width, height, min, range]);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("w-full h-auto overflow-visible", className)}
      preserveAspectRatio="none"
      role="img"
      aria-hidden
    >
      <defs>
        {/* Two-stop fill gradient with a darker bias up top */}
        <linearGradient id={`fill-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.34" />
          <stop offset="55%" stopColor={stroke} stopOpacity="0.08" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>

        {/* Gradient ALONG the line for a subtle directional shimmer */}
        <linearGradient id={`stroke-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.5" />
          <stop offset="100%" stopColor={stroke} stopOpacity="1" />
        </linearGradient>

        {/* Soft glow filter behind the main line */}
        <filter id={`glow-${id}`} x="-10%" y="-30%" width="120%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.2" />
        </filter>
      </defs>

      {showFill ? <path d={areaPath} fill={`url(#fill-${id})`} /> : null}

      {/* Glow underlay — same shape, blurred, low opacity */}
      <path
        d={linePath}
        fill="none"
        stroke={stroke}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.35"
        filter={`url(#glow-${id})`}
      />

      {/* Main stroke with along-line gradient + draw-in animation */}
      <path
        d={linePath}
        fill="none"
        stroke={`url(#stroke-${id})`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={lineLength}
        className="animate-draw-line"
        style={{ ["--line-length" as never]: lineLength } as React.CSSProperties}
      />

      {/* Pulsing endpoint */}
      {showEndDot ? (
        <g>
          <circle cx={last[0]} cy={last[1]} r="3.5" fill={stroke}>
            <animate
              attributeName="r"
              values="3.5;8.5;3.5"
              dur="2.4s"
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.25 0.1 0.25 1; 0.25 0.1 0.25 1"
            />
            <animate
              attributeName="opacity"
              values="0.55;0;0.55"
              dur="2.4s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx={last[0]} cy={last[1]} r="3" fill={stroke} />
          <circle cx={last[0]} cy={last[1]} r="1.5" fill="#FFFFFF" />
        </g>
      ) : null}
    </svg>
  );
}
