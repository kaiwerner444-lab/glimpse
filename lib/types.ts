// Domain types for Glimpse onboarding. Kept narrow and serializable so they
// survive the eventual swap from mock storage to Supabase row-level-security
// tables without rewrites.

export type Sex = "female" | "male" | "intersex" | "prefer_not_to_say";

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
  heightCm: number;
  weightKg: number;
  ethnicityHint: FitzpatrickEthnicityHint;
  hipaaConsent: boolean;
  gdprConsent: boolean;
  createdAt: string;
}

export type GlassesMode = "ray_ban_meta" | "phone_fallback" | "deferred";

export interface GlassesSetup {
  mode: GlassesMode;
  pairedAt?: string;
}

export type GenomicsPath = "order_kit" | "import_raw" | "skip";

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
  | "glasses"
  | "genomics"
  | "family-history"
  | "risk-profile"
  | "baseline";

export interface OnboardingState {
  step: OnboardingStep;
  account?: Account;
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
