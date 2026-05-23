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
    <section className="relative overflow-hidden rounded-3xl px-6 py-10 sm:px-12 sm:py-14 animate-subtle-rise">
      {/* Layered mesh background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-20 h-[420px] w-[420px] rounded-full bg-[radial-gradient(closest-side,_#99D4D7_0%,_transparent_72%)] opacity-70 animate-mesh-drift-a" />
        <div className="absolute -bottom-40 right-[-10%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(closest-side,_#FFDDA9_0%,_transparent_70%)] opacity-60 animate-mesh-drift-b" />
        <div className="absolute inset-0 bg-gradient-to-br from-surface/40 via-transparent to-surface/40" />
      </div>
      <div className="absolute right-2 top-2 sm:right-6 sm:top-6 opacity-95 pointer-events-none">
        <GlimpseEye size={220} />
      </div>
      <div className="relative max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-brand-600 mb-3">
          {formatDate(now)}
        </p>
        <h1 className="glimpse-display text-4xl sm:text-5xl lg:text-6xl text-ink">
          {opener}
          {name ? <>, <span className="text-brand-500">{name}</span></> : ""}.
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-ink-muted max-w-xl leading-relaxed">
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
