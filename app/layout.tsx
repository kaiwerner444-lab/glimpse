import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";

// Body sans — Inter with the optical-size axis enabled for cleaner
// large-display sizes. Loaded as a variable font so we can use full
// weight range without hammering CLS.
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

// Display serif for the hero "moment" lines. Instrument Serif is open
// source, has a confident editorial feel, and reads naturally next to
// Inter. Used sparingly — landing hero + the single defining metric on
// the dashboard.
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Glimpse — Proactive neurological & chronic disease screening",
  description:
    "A five minute daily mirror ritual that surfaces the earliest signals of neurological and chronic disease, longitudinally and on your terms.",
};

export const viewport: Viewport = {
  themeColor: "#00707E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${instrumentSerif.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
