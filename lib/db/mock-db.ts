// Mock data layer backed by localStorage. The function signatures here are
// the contract the rest of the app codes against — swap the body for a
// Supabase client when keys are available; nothing else should change.

import type { OnboardingState } from "@/lib/types";

const STORAGE_KEY = "glimpse.onboarding";

export function loadOnboarding(): OnboardingState {
  if (typeof window === "undefined") {
    return { step: "account" };
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return { step: "account" };
  try {
    return JSON.parse(raw) as OnboardingState;
  } catch {
    return { step: "account" };
  }
}

export function saveOnboarding(state: OnboardingState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearOnboarding(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
