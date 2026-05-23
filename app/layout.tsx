import type { Metadata, Viewport } from "next";
import "./globals.css";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
