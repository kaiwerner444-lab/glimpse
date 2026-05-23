// Domain types for Glimpse onboarding. Kept narrow and serializable so they
// survive the eventual swap from mock storage to Supabase row-level-security
// tables without rewrites.

export type Sex = "female" | "male" | "intersex" | "prefer_not_to_say";

export type UnitSystem = "metric" | "imperial";

export type HandDominance = "right" | "left" | "ambidextrous";

export type VisionCorrection = "none" | "glasses" | "contacts";

export type HearingStatus = "normal" | "hearing_aids" | "some_loss_no_aids";

export type EducationLevel =
  | "less_than_high_school"
  | "high_school"
  | "some_college"
  | "bachelor"
  | "graduate";

export type MedicationCategory =
  | "beta_blockers"
  | "antidepressants"
  | "antianxiety"
  | "antiparkinsonian"
  | "anticholinergics"
  | "diabetes_meds"
  | "bp_meds"
  | "sleep_meds"
  | "other";

export type FitzpatrickEthnicityHint =
  | "type_1"
  | "type_2"
  | "type_3"
  | "type_4"
  | "type_5"
  | "type_6"
  | "unspecified";

export interface Account {
  id: string;
  email: string;
  dateOfBirth: string; // ISO date
  sex: Sex;
  // Source of truth is always metric. unitSystem just tracks the user's
  // display preference so we render the same units they entered.
  heightCm: number;
  weightKg: number;
  unitSystem: UnitSystem;
  // Hand dominance — known modifier for finger-tap baseline; labelling
  // 'dominant' / 'non-dominant' is more clinically meaningful than L/R.
  handDominance?: HandDominance;
  // Primary language — affects verbal-fluency norms; instructions are
  // English-only in v1.
  primaryLanguage?: string;
  ethnicityHint: FitzpatrickEthnicityHint;
  hipaaConsent: boolean;
  gdprConsent: boolean;
  createdAt: string;
}

// Clinical context — captured in its own onboarding step so the daily
// session can interpret signals correctly (education modifies cognitive
// norms; medications confound HR / tremor / prosody; existing diagnoses
// tell us NOT to flag what's already known).
export interface ClinicalContext {
  educationLevel?: EducationLevel;
  vision?: VisionCorrection;
  hearing?: HearingStatus;
  // Conditions already diagnosed — we won't re-detect what's known.
  existingDiagnoses: TrackedCondition[];
  // Medication categories that meaningfully affect captured signals.
  medications: MedicationCategory[];
  notes?: string;
}

export type GlassesMode = "ray_ban_meta" | "phone_fallback" | "deferred";

export interface GlassesSetup {
  mode: GlassesMode;
  pairedAt?: string;
}

export type GenomicsPath =
  | "order_kit"
  | "import_raw"
  | "select_diseases"
  | "skip";

export type GenomicsProvider =
  | "nucleus"
  | "twenty_three_and_me"
  | "ancestry"
  | "myheritage"
  | "color";

export interface GenomicsSetup {
  path: GenomicsPath;
  provider?: GenomicsProvider;
  rawFileName?: string;
  orderedAt?: string;
  // Set when the user picks "tell us what to screen for" instead of
  // providing genetics. Treated as the source of truth on the risk
  // profile step — auto-stratification still runs but these win.
  selectedConditions?: TrackedCondition[];
}

export type Relationship =
  | "mother"
  | "father"
  | "sibling"
  | "child"
  | "maternal_grandmother"
  | "maternal_grandfather"
  | "paternal_grandmother"
  | "paternal_grandfather"
  | "aunt_uncle"
  | "other";

export type TrackedCondition =
  | "alzheimers"
  | "parkinsons"
  | "huntingtons"
  | "als"
  | "multiple_sclerosis"
  | "frontotemporal_dementia"
  | "stroke"
  | "hypertension"
  | "type_1_diabetes"
  | "type_2_diabetes"
  | "cardiovascular"
  | "chronic_kidney_disease"
  | "breast_cancer"
  | "colorectal_cancer"
  | "melanoma"
  | "depression"
  | "bipolar"
  | "schizophrenia";

export interface FamilyMember {
  id: string;
  relationship: Relationship;
  ageOrAgeAtDeath: number | null;
  deceased: boolean;
  conditions: TrackedCondition[];
  otherConditions?: string;
}

export interface FamilyHistory {
  members: FamilyMember[];
}

export interface RiskScore {
  condition: TrackedCondition;
  // Combined polygenic + familial + demographic signal, 0..1.
  score: number;
  drivers: Array<"polygenic" | "family_history" | "age" | "sex">;
}

export interface RiskProfile {
  scores: RiskScore[];
  confirmed: TrackedCondition[];
  deprioritized: TrackedCondition[];
}

export interface BaselineSession {
  completedAt?: string;
  durationSeconds?: number;
  // We do not store raw audio/video in onboarding state. Only the fact that
  // a baseline was captured. The feature vectors live in the time-series store.
  featuresCaptured: boolean;
}

export type OnboardingStep =
  | "account"
  | "clinical-context"
  | "glasses"
  | "genomics"
  | "family-history"
  | "risk-profile"
  | "baseline";

export interface OnboardingState {
  step: OnboardingStep;
  account?: Account;
  clinicalContext?: ClinicalContext;
  glasses?: GlassesSetup;
  genomics?: GenomicsSetup;
  familyHistory?: FamilyHistory;
  riskProfile?: RiskProfile;
  baseline?: BaselineSession;
  completedAt?: string;
}

export const CONDITION_LABELS: Record<TrackedCondition, string> = {
  alzheimers: "Alzheimer's disease",
  parkinsons: "Parkinson's disease",
  huntingtons: "Huntington's disease",
  als: "Amyotrophic lateral sclerosis",
  multiple_sclerosis: "Multiple sclerosis",
  frontotemporal_dementia: "Frontotemporal dementia",
  stroke: "Stroke",
  hypertension: "Hypertension",
  type_1_diabetes: "Type 1 diabetes",
  type_2_diabetes: "Type 2 diabetes",
  cardiovascular: "Cardiovascular disease",
  chronic_kidney_disease: "Chronic kidney disease",
  breast_cancer: "Breast cancer",
  colorectal_cancer: "Colorectal cancer",
  melanoma: "Melanoma",
  depression: "Depression",
  bipolar: "Bipolar disorder",
  schizophrenia: "Schizophrenia",
};

export const RELATIONSHIP_LABELS: Record<Relationship, string> = {
  mother: "Mother",
  father: "Father",
  sibling: "Sibling",
  child: "Child",
  maternal_grandmother: "Maternal grandmother",
  maternal_grandfather: "Maternal grandfather",
  paternal_grandmother: "Paternal grandmother",
  paternal_grandfather: "Paternal grandfather",
  aunt_uncle: "Aunt or uncle",
  other: "Other relative",
};
