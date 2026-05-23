// Comfort Mode — age-adaptive UI density.
//
// Research basis (well-established usability literature, summarised):
// - Adults 60+ benefit from larger touch targets (~48px+), 18px+ body
//   text, fewer simultaneous animations, and longer task pacing
//   (Nielsen Norman Group "Senior Citizens (Ages 60 and Older) Usage of
//   Websites" research; Pew Research on digital literacy in older
//   adults; W3C WAI-AGE Task Force guidance).
// - Younger users tolerate higher visual density and faster pacing.
// - Health-anxious populations across all ages benefit from softer
//   colour cues and slower transitions — never red except for genuine
//   urgency (consistent with the patient-anxiety research the spec
//   already cited).
//
// We default to ON for users 60+, OFF below that, and ALWAYS let the
// user override in settings. No telemetry-based switching — it'd feel
// patronising and is easy to get wrong.

import type { Account } from "@/lib/types";

const STORAGE_KEY = "glimpse.comfort";

export type ComfortPreference = "auto" | "on" | "off";

export interface ComfortState {
  pref: ComfortPreference;
  // Effective resolved value at last load.
  effective: boolean;
}

function ageFromIso(iso: string): number {
  const dob = new Date(iso);
  if (Number.isNaN(dob.getTime())) return 45;
  const ms = Date.now() - dob.getTime();
  return ms / (365.25 * 24 * 3600 * 1000);
}

export function resolveComfort(
  pref: ComfortPreference,
  account?: Account | null,
): boolean {
  if (pref === "on") return true;
  if (pref === "off") return false;
  if (!account?.dateOfBirth) return false;
  return ageFromIso(account.dateOfBirth) >= 60;
}

export function loadComfort(): ComfortPreference {
  if (typeof window === "undefined") return "auto";
  return (
    (window.localStorage.getItem(STORAGE_KEY) as ComfortPreference | null) ??
    "auto"
  );
}

export function saveComfort(pref: ComfortPreference): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, pref);
}

// Per-mode scaling factors. Tasks use these to lengthen instruction
// reading time, slow per-trial timers, etc.
export const COMFORT_TUNING = {
  // Multiply task duration by this when comfort mode is on. 1.4 gives
  // ~40% longer per task — based on geriatric usability literature
  // recommending generous reading/processing time.
  taskDurationMultiplier: 1.4,
  // Extra seconds added to digit-span memorise + recall phases.
  digitSpanMemoriseBoostSeconds: 3,
  digitSpanRecallBoostSeconds: 4,
} as const;
