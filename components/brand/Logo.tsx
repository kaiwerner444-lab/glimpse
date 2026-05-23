import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
}

// A minimal wordmark with a stylized "eye/glimpse" glyph. Pure SVG so it
// scales cleanly without an asset pipeline.
export function Logo({ className, showWordmark = true }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        viewBox="0 0 32 32"
        aria-hidden
        className="h-7 w-7 text-brand-500"
        fill="none"
      >
        <path
          d="M2 16 C 8 6, 24 6, 30 16 C 24 26, 8 26, 2 16 Z"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinejoin="round"
        />
        <circle cx="16" cy="16" r="4.5" fill="currentColor" />
        <circle cx="17.5" cy="14.5" r="1.25" fill="#FFFFFF" />
      </svg>
      {showWordmark ? (
        <span className="text-lg font-semibold tracking-tight text-ink">
          Glimpse
        </span>
      ) : null}
    </span>
  );
}
