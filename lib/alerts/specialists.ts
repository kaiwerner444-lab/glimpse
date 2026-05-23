// Signal → specialist mapping. Drives the "connect with a specialist"
// flow on every Tier 2/3 alert. Telehealth partners listed are the
// integrations we'd wire in v2.

import type { SpecialistSuggestion } from "./types";

export const SPECIALISTS_BY_SIGNAL: Record<string, SpecialistSuggestion[]> = {
  "facial-symmetry": [
    {
      type: "Neurologist",
      reason:
        "Facial-asymmetry drift can indicate facial-nerve involvement, stroke, or early Parkinson's masking. Neurology is the right first stop.",
      telehealth: "amwell",
    },
    {
      type: "Primary care",
      reason: "A PCP can rule out benign causes and refer onward if needed.",
      telehealth: "teladoc",
    },
  ],
  "finger-tap-speed": [
    {
      type: "Movement-disorder neurologist",
      reason:
        "Slowing of finger tapping (bradykinesia) is one of the earliest objective signs of Parkinson's. A movement specialist can confirm.",
      telehealth: "amwell",
    },
    {
      type: "Neurologist",
      reason: "General neurology if a movement-disorder specialist isn't immediately available.",
      telehealth: "teladoc",
    },
  ],
  "postural-sway": [
    {
      type: "Physiatrist or geriatrician",
      reason:
        "Increasing postural sway flags fall risk and possible vestibular or musculoskeletal involvement.",
      telehealth: "doctor_on_demand",
    },
    {
      type: "Physical therapist",
      reason:
        "A short PT consult can build a balance-training program before things worsen.",
    },
  ],
  "mean-pitch": [
    {
      type: "Neurologist",
      reason:
        "Pitch flattening and reduced prosody are sensitive markers for Parkinson's, depression, and frontotemporal changes.",
      telehealth: "amwell",
    },
    {
      type: "Speech-language pathologist",
      reason:
        "An SLP can run the formal acoustic battery and recommend voice-therapy interventions.",
    },
  ],
  "voiced-ratio": [
    {
      type: "Speech-language pathologist",
      reason:
        "Reduced voiced ratio is one of the earliest markers of dysarthria.",
    },
    {
      type: "Neurologist",
      reason: "Rule out a neurological cause for the speech change.",
      telehealth: "amwell",
    },
  ],
  "stroop-accuracy": [
    {
      type: "Neurologist",
      reason:
        "Sustained drop in executive-function tasks (like Stroop) is one of the earliest signs of MCI and small-vessel disease.",
      telehealth: "amwell",
    },
    {
      type: "Neuropsychologist",
      reason:
        "Formal cognitive assessment provides a clinical-grade comparison to population norms.",
    },
  ],
};

export const TELEHEALTH_URLS: Record<
  NonNullable<SpecialistSuggestion["telehealth"]>,
  string
> = {
  amwell: "https://patients.amwell.com/",
  teladoc: "https://www.teladoc.com/",
  doctor_on_demand: "https://www.doctorondemand.com/",
};

export function specialistsFor(signalId: string): SpecialistSuggestion[] {
  return SPECIALISTS_BY_SIGNAL[signalId] ?? [];
}
