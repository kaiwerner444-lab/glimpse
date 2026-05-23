// Stub risk stratification. In production this is replaced by a server-side
// pipeline that combines polygenic risk scores (PLINK / Nucleus API) with
// the user's structured family history and demographic priors. The output
// shape is what the rest of the app consumes — keep that stable.

import type {
  FamilyHistory,
  GenomicsSetup,
  RiskProfile,
  RiskScore,
  TrackedCondition,
  Account,
} from "@/lib/types";

const ALL_CONDITIONS: TrackedCondition[] = [
  "alzheimers",
  "parkinsons",
  "huntingtons",
  "als",
  "multiple_sclerosis",
  "frontotemporal_dementia",
  "stroke",
  "hypertension",
  "type_1_diabetes",
  "type_2_diabetes",
  "cardiovascular",
  "breast_cancer",
  "colorectal_cancer",
  "melanoma",
  "depression",
  "bipolar",
  "schizophrenia",
];

// First-degree relatives carry more weight than second-degree.
const FIRST_DEGREE = new Set([
  "mother",
  "father",
  "sibling",
  "child",
]);

export function stratify(
  account: Account | undefined,
  history: FamilyHistory | undefined,
  genomics: GenomicsSetup | undefined,
): RiskProfile {
  const ageYears = account
    ? Math.max(0, yearsSince(account.dateOfBirth))
    : 50;

  const scores: RiskScore[] = ALL_CONDITIONS.map((condition) => {
    let familyScore = 0;
    const drivers: RiskScore["drivers"] = [];

    if (history) {
      for (const member of history.members) {
        if (!member.conditions.includes(condition)) continue;
        familyScore += FIRST_DEGREE.has(member.relationship) ? 0.28 : 0.12;
        if (!drivers.includes("family_history")) drivers.push("family_history");
      }
    }

    // Lightweight demographic priors — placeholders, not clinical truth.
    const agePrior = agePriorFor(condition, ageYears);
    if (agePrior > 0.05) drivers.push("age");

    const sexPrior = account ? sexPriorFor(condition, account.sex) : 0;
    if (sexPrior > 0.02) drivers.push("sex");

    // Genomics: in v1 we award a small bump for any provided polygenic source,
    // since we are not yet running real PRS computation in-browser.
    const genoBump =
      genomics && genomics.path !== "skip" ? 0.05 : 0;
    if (genoBump > 0) drivers.push("polygenic");

    const raw = familyScore + agePrior + sexPrior + genoBump;
    const score = Math.max(0, Math.min(1, raw));
    return { condition, score, drivers };
  });

  scores.sort((a, b) => b.score - a.score);

  // Pre-confirm anything above a soft threshold — user can adjust on next screen.
  const confirmed = scores
    .filter((s) => s.score >= 0.18)
    .slice(0, 5)
    .map((s) => s.condition);

  return {
    scores,
    confirmed,
    deprioritized: [],
  };
}

function yearsSince(iso: string): number {
  const dob = new Date(iso);
  if (Number.isNaN(dob.getTime())) return 50;
  const ms = Date.now() - dob.getTime();
  return ms / (365.25 * 24 * 3600 * 1000);
}

function agePriorFor(condition: TrackedCondition, age: number): number {
  if (age < 30) return 0;
  switch (condition) {
    case "alzheimers":
    case "frontotemporal_dementia":
      return age >= 65 ? 0.18 : age >= 50 ? 0.08 : 0.02;
    case "parkinsons":
    case "stroke":
    case "cardiovascular":
      return age >= 60 ? 0.14 : age >= 45 ? 0.07 : 0.02;
    case "hypertension":
    case "type_2_diabetes":
      return age >= 50 ? 0.12 : age >= 40 ? 0.06 : 0.02;
    case "colorectal_cancer":
    case "breast_cancer":
      return age >= 50 ? 0.08 : 0.03;
    default:
      return 0.02;
  }
}

function sexPriorFor(
  condition: TrackedCondition,
  sex: Account["sex"],
): number {
  if (sex === "female" && condition === "breast_cancer") return 0.06;
  if (sex === "female" && condition === "multiple_sclerosis") return 0.03;
  if (sex === "male" && condition === "parkinsons") return 0.03;
  if (sex === "male" && condition === "cardiovascular") return 0.03;
  return 0;
}
