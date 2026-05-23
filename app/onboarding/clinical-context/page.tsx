"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Eye, Ear, Pill, Stethoscope } from "lucide-react";
import { StepShell } from "@/components/onboarding/StepShell";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Field } from "@/components/ui/Field";
import { Checkbox } from "@/components/ui/Checkbox";
import { useOnboardingState } from "@/hooks/useOnboardingState";
import {
  CONDITION_LABELS,
  type ClinicalContext,
  type EducationLevel,
  type HearingStatus,
  type MedicationCategory,
  type TrackedCondition,
  type VisionCorrection,
} from "@/lib/types";

const EDUCATION_OPTIONS: Array<{
  value: EducationLevel;
  label: string;
}> = [
  { value: "less_than_high_school", label: "Less than high school" },
  { value: "high_school", label: "High school" },
  { value: "some_college", label: "Some college / associate" },
  { value: "bachelor", label: "Bachelor's degree" },
  { value: "graduate", label: "Graduate degree" },
];

const VISION_OPTIONS: Array<{ value: VisionCorrection; label: string }> = [
  { value: "none", label: "No correction" },
  { value: "glasses", label: "Glasses" },
  { value: "contacts", label: "Contact lenses" },
];

const HEARING_OPTIONS: Array<{ value: HearingStatus; label: string }> = [
  { value: "normal", label: "Hear normally" },
  { value: "hearing_aids", label: "Use hearing aids" },
  { value: "some_loss_no_aids", label: "Some hearing loss, no aids" },
];

const MEDICATION_OPTIONS: Array<{
  value: MedicationCategory;
  label: string;
  hint: string;
}> = [
  {
    value: "beta_blockers",
    label: "Beta blockers",
    hint: "Lower heart rate; affects our HR readings",
  },
  {
    value: "antidepressants",
    label: "Antidepressants (SSRIs, SNRIs, etc.)",
    hint: "Can flatten prosody",
  },
  {
    value: "antianxiety",
    label: "Anxiolytics / benzodiazepines",
    hint: "Reduce tremor",
  },
  {
    value: "antiparkinsonian",
    label: "Anti-Parkinsonian (L-DOPA, etc.)",
    hint: "Confounds movement signals",
  },
  {
    value: "anticholinergics",
    label: "Anticholinergics",
    hint: "Affect cognitive performance",
  },
  {
    value: "diabetes_meds",
    label: "Insulin or diabetes meds",
    hint: "Glycemic confounds",
  },
  {
    value: "bp_meds",
    label: "Blood-pressure medication",
    hint: "Affects HR and BP",
  },
  {
    value: "sleep_meds",
    label: "Sleep medication",
    hint: "Morning prosody and reaction time",
  },
];

// Common diagnoses we want to know about. We pre-tag from TrackedCondition
// + a few additional clinical categories that aren't in the screening
// list but materially affect interpretation.
const DIAGNOSIS_OPTIONS: TrackedCondition[] = [
  "alzheimers",
  "parkinsons",
  "multiple_sclerosis",
  "stroke",
  "hypertension",
  "type_1_diabetes",
  "type_2_diabetes",
  "cardiovascular",
  "depression",
];

export default function ClinicalContextStep() {
  const router = useRouter();
  const { state, update } = useOnboardingState();
  const prev = state.clinicalContext;

  const [education, setEducation] = useState<EducationLevel | "">(
    prev?.educationLevel ?? "",
  );
  const [vision, setVision] = useState<VisionCorrection>(
    prev?.vision ?? "none",
  );
  const [hearing, setHearing] = useState<HearingStatus>(
    prev?.hearing ?? "normal",
  );
  const [diagnoses, setDiagnoses] = useState<TrackedCondition[]>(
    prev?.existingDiagnoses ?? [],
  );
  const [meds, setMeds] = useState<MedicationCategory[]>(prev?.medications ?? []);
  const [notes, setNotes] = useState<string>(prev?.notes ?? "");

  const toggleDiagnosis = (c: TrackedCondition) => {
    setDiagnoses((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
  };
  const toggleMed = (m: MedicationCategory) => {
    setMeds((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m],
    );
  };

  const onContinue = () => {
    const ctx: ClinicalContext = {
      educationLevel: (education as EducationLevel) || undefined,
      vision,
      hearing,
      existingDiagnoses: diagnoses,
      medications: meds,
      notes: notes.trim() || undefined,
    };
    update({ clinicalContext: ctx, step: "glasses" });
    router.push("/onboarding/glasses");
  };

  return (
    <StepShell
      step="clinical-context"
      eyebrow="Clinical context"
      title="A bit more to interpret signals correctly"
      description="These details let the system separate real drift from known modifiers. Years of education sets cognitive norms; current medications and existing diagnoses are confounders we want to know about."
      footer={
        <>
          <Button
            variant="ghost"
            onClick={() => router.push("/onboarding/account")}
          >
            Back
          </Button>
          <Button onClick={onContinue}>Continue</Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Education */}
        <Section
          icon={<GraduationCap className="h-5 w-5" />}
          title="Education"
          subtitle="Standard cognitive norms (MoCA, Trail Making) adjust by education level."
        >
          <Field label="Highest level completed">
            <Select
              value={education}
              onChange={(e) => setEducation(e.target.value as EducationLevel)}
            >
              <option value="">— select —</option>
              {EDUCATION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Field>
        </Section>

        {/* Vision + Hearing */}
        <Section
          icon={<Eye className="h-5 w-5" />}
          title="Vision & hearing"
          subtitle="Vision affects camera-based tests; hearing affects audio instructions."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Vision">
              <Select
                value={vision}
                onChange={(e) => setVision(e.target.value as VisionCorrection)}
              >
                {VISION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Hearing">
              <Select
                value={hearing}
                onChange={(e) => setHearing(e.target.value as HearingStatus)}
              >
                {HEARING_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </Section>

        {/* Existing diagnoses */}
        <Section
          icon={<Stethoscope className="h-5 w-5" />}
          title="Already diagnosed?"
          subtitle="We won't try to re-detect what's already known. Optional, but helps."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {DIAGNOSIS_OPTIONS.map((c) => (
              <Checkbox
                key={c}
                checked={diagnoses.includes(c)}
                onChange={() => toggleDiagnosis(c)}
                label={CONDITION_LABELS[c]}
              />
            ))}
          </div>
        </Section>

        {/* Medications */}
        <Section
          icon={<Pill className="h-5 w-5" />}
          title="Medications"
          subtitle="By category, not specific drug. These confound the measurements — knowing about them lets us model around them."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {MEDICATION_OPTIONS.map((m) => (
              <Checkbox
                key={m.value}
                checked={meds.includes(m.value)}
                onChange={() => toggleMed(m.value)}
                label={m.label}
                hint={m.hint}
              />
            ))}
          </div>
          <Field
            label="Anything else (optional)"
            hint="Conditions, mobility aids, recent surgeries — anything that might affect the daily session."
            className="mt-4"
          >
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. mild essential tremor on the right hand, knee replacement 2024"
              className="min-h-[88px] rounded-xl border border-black/10 bg-surface px-4 py-3 text-base text-ink placeholder:text-ink-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 resize-y w-full"
            />
          </Field>
        </Section>

        <p className="text-xs text-ink-muted leading-relaxed">
          All optional. You can update any of this from Settings at any time.
        </p>
      </div>
    </StepShell>
  );
}

function Section({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glimpse-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <p className="text-base font-semibold text-ink">{title}</p>
          <p className="text-sm text-ink-muted">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
