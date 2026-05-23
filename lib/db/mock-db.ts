// Data layer. localStorage remains the source of truth in-browser so the
// app keeps working offline (a spec requirement). When Supabase env vars
// are present, every write is mirrored to the `onboarding` table on a
// best-effort basis. Hydration from Supabase on fresh devices is a v2
// concern; for v1, the user starts onboarding on the device they sign up
// on, and the mirror lets a clinician see the same data server-side.

import type { OnboardingState } from "@/lib/types";
import { supabase } from "@/lib/supabase/client";

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
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  void mirrorToSupabase(state);
}

export function clearOnboarding(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

async function mirrorToSupabase(state: OnboardingState): Promise<void> {
  const sb = supabase();
  if (!sb) return;
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return;
  await sb.from("onboarding").upsert({
    user_id: user.id,
    step: state.step,
    glasses: state.glasses ?? null,
    genomics: state.genomics ?? null,
    family_history: state.familyHistory ?? null,
    risk_profile: state.riskProfile ?? null,
    baseline: state.baseline ?? null,
    completed_at: state.completedAt ?? null,
  });
}
