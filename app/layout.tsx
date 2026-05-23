import type { Metadata, Viewport } from "next";
import { Inter_Tight, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { PageTransition } from "@/components/motion/PageTransition";
import { ToastProvider } from "@/components/ui/Toast";

// Editorial medical instrument. Three typefaces with strict roles:
//   - Inter Tight  → body 400, buttons 500. Slightly narrower than
//     regular Inter for a more set-text feel.
//   - Instrument Serif → display headlines and the numerical proof
//     panel. Italics in brand teal for emphasis.
//   - JetBrains Mono → technical labels, numbers, monospace eyebrows.
//     Uppercase, +0.14em tracking, 10-11px.
//
// Variable axes via next/font/google so we pay nothing extra for the
// weights we want and CLS stays at zero.
const interTight = Inter_Tight({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-display",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
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
      className={`${interTight.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <ToastProvider>
          <PageTransition>{children}</PageTransition>
        </ToastProvider>
      </body>
    </html>
  );
}
