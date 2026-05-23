import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PageTransition } from "@/components/motion/PageTransition";
import { ToastProvider } from "@/components/ui/Toast";

// Inter as the single typeface across the app, full variable axis.
// Used at every scale — body, UI, and tracking-tight display headlines.
// No serif, no italic display. The aesthetic is closer to Linear /
// Stripe / Vercel: one confident sans, big sizes, lots of whitespace.
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
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
    <html lang="en" className={inter.variable}>
      <body>
        <ToastProvider>
          <PageTransition>{children}</PageTransition>
        </ToastProvider>
      </body>
    </html>
  );
}
