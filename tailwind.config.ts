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
          700: "#00444D",
          800: "#002F35",
          900: "#001A1D",
        },
        ink: {
          DEFAULT: "#0F1F22",
          muted: "#566366",
          subtle: "#8A9497",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          alt: "#F6F8F8",
          warm: "#FBFAF6",
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
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Inter",
          "sans-serif",
        ],
        serif: ["ui-serif", "Georgia", "Cambria", "serif"],
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
        focus: "0 0 0 3px rgba(0, 112, 126, 0.25)",
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
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
        "fade-in": "fade-in 0.6s ease-out both",
        "glimpse-pulse": "glimpse-pulse 4s ease-in-out infinite",
        "iris-shimmer": "iris-shimmer 6s ease-in-out infinite",
        "draw-line": "draw-line 1.4s ease-out both",
        "horizon-glow": "horizon-glow 6s ease-in-out infinite",
        "stagger-up": "stagger-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
