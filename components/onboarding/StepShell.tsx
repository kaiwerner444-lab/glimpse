"use client";

import * as React from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { ProgressBar } from "./ProgressBar";
import { TOTAL_STEPS, stepIndex } from "@/hooks/useOnboardingState";
import type { OnboardingStep } from "@/lib/types";

interface StepShellProps {
  step: OnboardingStep;
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function StepShell({
  step,
  eyebrow,
  title,
  description,
  children,
  footer,
}: StepShellProps) {
  const i = stepIndex(step);
  return (
    <div className="min-h-dvh flex flex-col bg-surface-alt">
      <header className="px-6 py-5 flex items-center justify-between max-w-3xl w-full mx-auto">
        <Link href="/" aria-label="Glimpse home">
          <Logo />
        </Link>
        <span className="text-sm text-ink-muted tabular-nums">
          Step {i + 1} of {TOTAL_STEPS}
        </span>
      </header>

      <div className="px-6 max-w-3xl w-full mx-auto">
        <ProgressBar currentIndex={i} total={TOTAL_STEPS} />
      </div>

      <main className="flex-1 px-6 py-10 max-w-3xl w-full mx-auto animate-fade-up">
        <p className="text-sm font-medium uppercase tracking-wider text-brand-500 mb-2">
          {eyebrow}
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold text-ink leading-tight tracking-tight">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 text-lg text-ink-muted max-w-2xl">{description}</p>
        ) : null}
        <div className="mt-8">{children}</div>
      </main>

      {footer ? (
        <footer className="sticky bottom-0 border-t border-black/[0.06] bg-surface/80 backdrop-blur supports-[backdrop-filter]:bg-surface/70">
          <div className="px-6 py-4 max-w-3xl w-full mx-auto flex items-center justify-between gap-4">
            {footer}
          </div>
        </footer>
      ) : null}
    </div>
  );
}
