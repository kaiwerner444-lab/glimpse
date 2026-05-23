"use client";

import { useEffect, useState } from "react";
import { GlimpseEye } from "./GlimpseEye";

interface GreetingProps {
  name?: string;
}

const SUPPORT_LINES = [
  "We're here with you, every day.",
  "Small daily moments build the picture.",
  "You showed up. That matters.",
  "Five minutes a day, gentle and steady.",
  "Your normal is the most important thing we'll learn.",
];

export function Greeting({ name }: GreetingProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
  }, []);

  if (!now) {
    return <GreetingSkeleton />;
  }

  const hour = now.getHours();
  const partOfDay =
    hour < 5 ? "night" : hour < 12 ? "morning" : hour < 17 ? "afternoon" : hour < 21 ? "evening" : "night";

  const opener =
    partOfDay === "morning"
      ? "Good morning"
      : partOfDay === "afternoon"
        ? "Good afternoon"
        : partOfDay === "evening"
          ? "Good evening"
          : "It's late";

  // Stable per-day support line so the same day doesn't reshuffle on every render.
  const daySeed =
    now.getFullYear() * 1000 + now.getMonth() * 32 + now.getDate();
  const supportLine = SUPPORT_LINES[daySeed % SUPPORT_LINES.length];

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-50 via-surface to-sunrise-50 px-6 py-8 sm:px-10 sm:py-12 animate-stagger-up">
      <div className="absolute -right-12 -top-12 opacity-90 pointer-events-none">
        <GlimpseEye size={260} />
      </div>
      <div className="relative max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-wider text-brand-500 mb-2">
          {formatDate(now)}
        </p>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-ink leading-tight">
          {opener}
          {name ? `, ${name}` : ""}.
        </h1>
        <p className="mt-3 text-lg text-ink-muted max-w-xl leading-relaxed">
          {supportLine}
        </p>
      </div>
    </section>
  );
}

function GreetingSkeleton() {
  return (
    <section className="rounded-3xl bg-surface px-6 py-8 sm:px-10 sm:py-12 shadow-card">
      <div className="h-3 w-24 bg-black/5 rounded mb-3" />
      <div className="h-9 w-2/3 bg-black/5 rounded mb-3" />
      <div className="h-4 w-1/2 bg-black/5 rounded" />
    </section>
  );
}

function formatDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
