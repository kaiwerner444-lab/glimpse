import { cn } from "@/lib/utils";

interface GlimpseEyeProps {
  className?: string;
  size?: number;
}

// Animated Glimpse motif. The lash arc and iris pulse slowly; a soft
// shimmer line sweeps across the iris like a glimpse of light.
// Pure SVG + CSS so it costs nothing on the network and respects
// prefers-reduced-motion automatically through the harness.
export function GlimpseEye({ className, size = 240 }: GlimpseEyeProps) {
  return (
    <div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {/* Soft warm halo behind the eye. */}
      <div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-sunrise-100/70 via-brand-50 to-transparent blur-2xl animate-horizon-glow"
      />
      <svg
        viewBox="0 0 240 240"
        className="relative w-full h-full"
        fill="none"
      >
        <defs>
          <linearGradient id="iris" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#33A9B0" />
            <stop offset="100%" stopColor="#00444D" />
          </linearGradient>
          <radialGradient id="pupilGloss" cx="0.35" cy="0.35" r="0.5">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          <clipPath id="eyeClip">
            <path d="M20 120 C 60 60, 180 60, 220 120 C 180 180, 60 180, 20 120 Z" />
          </clipPath>
        </defs>

        {/* Eye outline */}
        <path
          d="M20 120 C 60 60, 180 60, 220 120 C 180 180, 60 180, 20 120 Z"
          stroke="#00707E"
          strokeWidth="3"
          strokeLinejoin="round"
          fill="#FFFFFF"
        />

        {/* Iris + pupil pulse */}
        <g clipPath="url(#eyeClip)">
          <g className="animate-glimpse-pulse origin-center" style={{ transformOrigin: "120px 120px" }}>
            <circle cx="120" cy="120" r="42" fill="url(#iris)" />
            <circle cx="120" cy="120" r="20" fill="#001A1D" />
            <circle cx="111" cy="111" r="6" fill="url(#pupilGloss)" />
          </g>
          {/* Shimmer line — the 'glimpse' of light sweeping across. */}
          <g className="animate-iris-shimmer">
            <rect
              x="60"
              y="80"
              width="6"
              height="80"
              fill="#FFFFFF"
              opacity="0.5"
              transform="rotate(12 63 120)"
              rx="3"
            />
          </g>
        </g>

        {/* Upper lash arc — gives the eye a gentle warmth */}
        <path
          d="M20 120 C 60 60, 180 60, 220 120"
          stroke="#00707E"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
}
