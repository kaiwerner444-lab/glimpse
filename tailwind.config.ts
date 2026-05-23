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
        warn: "#B7791F", // Tier 2 suggestion
        success: "#2F855A",
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
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
