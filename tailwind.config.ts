import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        // Glimpse brand — calm clinical palette anchored on deep teal.
        brand: {
          50: "#E6F4F5",
          100: "#CCEAEB",
          200: "#99D4D7",
          300: "#66BFC4",
          400: "#33A9B0",
          500: "#00707E", // primary
          600: "#005A66",
          700: "#004E58", // editorial brand teal dark
          800: "#002F35",
          900: "#001A1D",
        },
        // Editorial medical instrument tokens. ink scale follows the spec:
        // 0E1413 / 4A4842 / 8B8880. Aliased on ink.DEFAULT/muted/subtle so
        // the existing utilities continue to work.
        ink: {
          DEFAULT: "#0E1413",
          muted: "#4A4842",
          subtle: "#8B8880",
        },
        // Paper-feel surfaces. FAF8F4 is the warm off-white background;
        // F3EFE7 is the slightly-darker paper used for the instrument
        // panels. Never stark white.
        surface: {
          DEFAULT: "#FAF8F4",
          alt: "#FAF8F4",
          paper: "#F3EFE7",
          warm: "#FBFAF6",
        },
        // Hairline rules instead of borders. .08 for default, .18 for
        // emphasised hairlines.
        hairline: {
          DEFAULT: "rgba(14, 20, 19, 0.08)",
          strong: "rgba(14, 20, 19, 0.18)",
        },
        // Reserved exclusively for Tier 3 specialist referral flags.
        alert: "#C0392B",
        warn: "#B7791F", // Tier 2 suggestion / "watch this" on dashboard
        success: "#2F855A",
        // Warm support accents — used for encouragement and "someone's with you" moments.
        sunrise: {
          50: "#FFF8EE",
          100: "#FFEFD7",
          200: "#FFDDA9",
          300: "#FFC773",
          400: "#F2A347",
          500: "#D88424",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
        // Display headlines + numerical proof. Instrument Serif at
        // weight 400, italic available in brand teal for emphasis.
        display: [
          "var(--font-display)",
          "ui-serif",
          "Georgia",
          "serif",
        ],
        // Technical labels / numbers / monospace eyebrows. JetBrains
        // Mono at 10-11px uppercase, +0.14em tracking.
        mono: [
          "var(--font-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      fontSize: {
        // 16px floor for body text per accessibility spec.
        base: ["1rem", { lineHeight: "1.6" }],
        lg: ["1.125rem", { lineHeight: "1.6" }],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 31, 34, 0.04), 0 8px 24px rgba(15, 31, 34, 0.06)",
        // Premium two-layer shadow used on hero CTAs and elevated cards.
        elevated:
          "0 1px 2px rgba(15, 31, 34, 0.04), 0 12px 32px -8px rgba(0, 112, 126, 0.18), 0 32px 80px -16px rgba(15, 31, 34, 0.12)",
        glass:
          "0 1px 0 rgba(255,255,255,0.6) inset, 0 1px 2px rgba(15, 31, 34, 0.04), 0 24px 64px -16px rgba(0, 112, 126, 0.15)",
        focus: "0 0 0 3px rgba(0, 112, 126, 0.25)",
        ring: "0 0 0 1px rgba(0, 112, 126, 0.15)",
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "glimpse-pulse": {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.04)" },
        },
        "iris-shimmer": {
          "0%, 100%": { transform: "translateX(-30%)" },
          "50%": { transform: "translateX(30%)" },
        },
        "draw-line": {
          "0%": { strokeDashoffset: "var(--line-length, 200)" },
          "100%": { strokeDashoffset: "0" },
        },
        "horizon-glow": {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "0.6" },
        },
        "stagger-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "reaction-toast": {
          "0%": { opacity: "0", transform: "translateY(-6px) scale(0.92)" },
          "15%": { opacity: "1", transform: "translateY(0) scale(1)" },
          "70%": { opacity: "1", transform: "translateY(0) scale(1)" },
          "100%": { opacity: "0", transform: "translateY(-6px) scale(0.96)" },
        },
        "sparkle-pop": {
          "0%": { opacity: "0", transform: "scale(0.4) rotate(0deg)" },
          "30%": { opacity: "1", transform: "scale(1.1) rotate(20deg)" },
          "100%": { opacity: "0", transform: "scale(0.6) rotate(40deg) translateY(-12px)" },
        },
        "mesh-drift-a": {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%": { transform: "translate3d(8%, -6%, 0) scale(1.15)" },
        },
        "mesh-drift-b": {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1.1)" },
          "50%": { transform: "translate3d(-10%, 8%, 0) scale(0.95)" },
        },
        "mesh-drift-c": {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(0.95)" },
          "50%": { transform: "translate3d(6%, 10%, 0) scale(1.1)" },
        },
        "subtle-rise": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        // Choreographed hero entrance — vertical lift + fade.
        "hero-rise": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        // Instrument panel slides in from the right (translateX 24px → 0).
        "hero-instrument": {
          "0%": { opacity: "0", transform: "translateX(24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        // Slow continuous breathing on the waveform's envelope.
        breathe: {
          "0%, 100%": { transform: "scaleY(0.96)" },
          "50%": { transform: "scaleY(1.06)" },
        },
        // Live capture indicator pulse.
        "capture-pulse": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(0.92)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
        "fade-in": "fade-in 0.6s ease-out both",
        "glimpse-pulse": "glimpse-pulse 4s ease-in-out infinite",
        "iris-shimmer": "iris-shimmer 6s ease-in-out infinite",
        "draw-line": "draw-line 1.4s ease-out both",
        "horizon-glow": "horizon-glow 6s ease-in-out infinite",
        "stagger-up": "stagger-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        "reaction-toast": "reaction-toast 1.8s cubic-bezier(0.22, 1, 0.36, 1) both",
        "sparkle-pop": "sparkle-pop 1.2s ease-out both",
        "mesh-drift-a": "mesh-drift-a 22s ease-in-out infinite",
        "mesh-drift-b": "mesh-drift-b 28s ease-in-out infinite",
        "mesh-drift-c": "mesh-drift-c 34s ease-in-out infinite",
        "subtle-rise": "subtle-rise 0.9s cubic-bezier(0.22, 1, 0.36, 1) both",
        // Brief-defined choreography for the hero.
        "hero-rise": "hero-rise 700ms cubic-bezier(0.2, 0.7, 0.2, 1) both",
        "hero-instrument":
          "hero-instrument 800ms cubic-bezier(0.2, 0.7, 0.2, 1) both",
        breathe: "breathe 4.5s ease-in-out infinite",
        "capture-pulse": "capture-pulse 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
