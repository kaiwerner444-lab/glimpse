"use client";

import { useCallback, useEffect, useState } from "react";
import {
  loadOnboarding,
  saveOnboarding,
  clearOnboarding,
} from "@/lib/db/mock-db";
import type { OnboardingState, OnboardingStep } from "@/lib/types";

const STEP_ORDER: OnboardingStep[] = [
  "account",
  "glasses",
  "genomics",
  "family-history",
  "risk-profile",
  "baseline",
];

export function useOnboardingState() {
  const [state, setState] = useState<OnboardingState>({ step: "account" });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadOnboarding());
    setHydrated(true);
  }, []);

  const update = useCallback((patch: Partial<OnboardingState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      saveOnboarding(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    clearOnboarding();
    setState({ step: "account" });
  }, []);

  return { state, hydrated, update, reset };
}

export function stepIndex(step: OnboardingStep): number {
  return STEP_ORDER.indexOf(step);
}

export function nextStep(step: OnboardingStep): OnboardingStep | null {
  const i = STEP_ORDER.indexOf(step);
  return i >= 0 && i < STEP_ORDER.length - 1 ? STEP_ORDER[i + 1] : null;
}

export const TOTAL_STEPS = STEP_ORDER.length;
