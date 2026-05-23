// Tier 1/2/3 alert model per the spec.
//
//   Tier 1 — informational. Biomarker shift within normal day-to-day
//            variation. Surfaces in the daily summary as a neutral
//            observation.
//   Tier 2 — suggestion. Shift beyond ~2 SD from personal baseline,
//            sustained ≥5 days. Lifestyle suggestion + "worth mentioning
//            at next physician visit."
//   Tier 3 — specialist referral. Pattern matching a clinically
//            validated red flag (sudden facial asymmetry, arm drift,
//            speech slurring). Surfaces the specialist connect flow.
//
// Acute red-flag patterns suggesting stroke or other emergency get an
// additional isEmergency flag — the UI shows U.S. 911 guidance
// immediately, no menus.

export type AlertTier = 1 | 2 | 3;

export type AlertDirection = "increase" | "decrease" | "spike" | "drop";

export interface SpecialistSuggestion {
  type: string;
  reason: string;
  // Telehealth partner key — wired to a real referral in v2.
  telehealth?: "amwell" | "teladoc" | "doctor_on_demand";
}

export interface Alert {
  id: string;
  tier: AlertTier;
  signalId: string;
  signalLabel: string;
  direction: AlertDirection;
  changePercent: number;
  series: number[];
  // Short one-line title.
  title: string;
  // Two-line body with the clinical-ish description.
  body: string;
  // What we suggest the user do — phrased gently for Tier 1/2,
  // urgent for Tier 3.
  recommendation: string;
  specialists: SpecialistSuggestion[];
  isEmergency?: boolean;
  detectedAt: string;
  sessionsObserved: number;
}
