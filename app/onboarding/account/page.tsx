"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StepShell } from "@/components/onboarding/StepShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Field } from "@/components/ui/Field";
import { Checkbox } from "@/components/ui/Checkbox";
import { useOnboardingState } from "@/hooks/useOnboardingState";
import { signUp } from "@/lib/auth/mock-auth";
import type {
  FitzpatrickEthnicityHint,
  HandDominance,
  Sex,
  UnitSystem,
} from "@/lib/types";
import {
  cmToFeetInches,
  feetInchesToCm,
  kgToLbs,
  lbsToKg,
} from "@/lib/units";
import { cn } from "@/lib/utils";

const SEX_OPTIONS: Array<{ value: Sex; label: string }> = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "intersex", label: "Intersex" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

const ETHNICITY_OPTIONS: Array<{
  value: FitzpatrickEthnicityHint;
  label: string;
}> = [
  { value: "type_1", label: "Very fair (Fitzpatrick I)" },
  { value: "type_2", label: "Fair (Fitzpatrick II)" },
  { value: "type_3", label: "Medium (Fitzpatrick III)" },
  { value: "type_4", label: "Olive (Fitzpatrick IV)" },
  { value: "type_5", label: "Brown (Fitzpatrick V)" },
  { value: "type_6", label: "Deep brown / black (Fitzpatrick VI)" },
  { value: "unspecified", label: "Prefer not to say" },
];

const HAND_OPTIONS: Array<{ value: HandDominance; label: string }> = [
  { value: "right", label: "Right-handed" },
  { value: "left", label: "Left-handed" },
  { value: "ambidextrous", label: "Ambidextrous" },
];

const LANGUAGE_OPTIONS = [
  "English",
  "Spanish",
  "French",
  "German",
  "Portuguese",
  "Italian",
  "Mandarin",
  "Cantonese",
  "Japanese",
  "Korean",
  "Arabic",
  "Hindi",
  "Russian",
  "Other",
];

export default function AccountStep() {
  const router = useRouter();
  const { state, update } = useOnboardingState();

  const [email, setEmail] = useState(state.account?.email ?? "");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState(state.account?.dateOfBirth ?? "");
  const [sex, setSex] = useState<Sex>(state.account?.sex ?? "prefer_not_to_say");

  // Unit system + height/weight state. Internally always cm/kg.
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(
    state.account?.unitSystem ?? "metric",
  );

  const [heightCm, setHeightCm] = useState<number | "">(
    state.account?.heightCm ?? "",
  );
  const [weightKg, setWeightKg] = useState<number | "">(
    state.account?.weightKg ?? "",
  );

  // Imperial display values derived from the canonical cm/kg.
  const heightImperial = useMemo(() => {
    if (heightCm === "" || !Number.isFinite(heightCm))
      return { feet: "", inches: "" };
    const { feet, inches } = cmToFeetInches(heightCm as number);
    return { feet: String(feet), inches: String(inches) };
  }, [heightCm]);
  const weightLbs = useMemo(() => {
    if (weightKg === "" || !Number.isFinite(weightKg)) return "";
    return String(kgToLbs(weightKg as number));
  }, [weightKg]);

  // Imperial inputs (raw text so partial values are editable)
  const [feetInput, setFeetInput] = useState<string>(heightImperial.feet);
  const [inchesInput, setInchesInput] = useState<string>(heightImperial.inches);
  const [lbsInput, setLbsInput] = useState<string>(weightLbs);

  // When the user changes imperial fields, write back to the metric source.
  const updateHeightFromImperial = (feet: string, inches: string) => {
    const f = Number(feet);
    const i = Number(inches);
    if (!Number.isFinite(f) || feet === "") {
      setHeightCm("");
      return;
    }
    const safeInches = Number.isFinite(i) ? i : 0;
    setHeightCm(feetInchesToCm(f, safeInches));
  };
  const updateWeightFromImperial = (lbs: string) => {
    const v = Number(lbs);
    if (!Number.isFinite(v) || lbs === "") {
      setWeightKg("");
      return;
    }
    setWeightKg(lbsToKg(v));
  };

  const [ethnicity, setEthnicity] = useState<FitzpatrickEthnicityHint>(
    state.account?.ethnicityHint ?? "unspecified",
  );
  const [handDominance, setHandDominance] = useState<HandDominance>(
    state.account?.handDominance ?? "right",
  );
  const [language, setLanguage] = useState<string>(
    state.account?.primaryLanguage ?? "English",
  );
  const [hipaa, setHipaa] = useState(state.account?.hipaaConsent ?? false);
  const [gdpr, setGdpr] = useState(state.account?.gdprConsent ?? false);
  const [submitting, setSubmitting] = useState(false);

  const errors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (!email.match(/.+@.+\..+/)) errs.email = "Enter a valid email";
    if (password.length < 8) errs.password = "Use 8 characters or more";
    if (!dob) errs.dob = "Required";
    if (heightCm === "" || (heightCm as number) <= 0) errs.heightCm = "Required";
    if (weightKg === "" || (weightKg as number) <= 0) errs.weightKg = "Required";
    if (!hipaa) errs.hipaa = "Consent required to proceed";
    return errs;
  }, [email, password, dob, heightCm, weightKg, hipaa]);

  const valid = Object.keys(errors).length === 0;

  const onContinue = async () => {
    if (!valid) return;
    setSubmitting(true);
    try {
      const account = await signUp({
        email,
        password,
        dateOfBirth: dob,
        sex,
        heightCm: Number(heightCm),
        weightKg: Number(weightKg),
        unitSystem,
        handDominance,
        primaryLanguage: language,
        ethnicityHint: ethnicity,
        hipaaConsent: hipaa,
        gdprConsent: gdpr,
      });
      update({ account, step: "clinical-context" });
      router.push("/onboarding/clinical-context");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StepShell
      step="account"
      eyebrow="Create your account"
      title="A few details to get started"
      description="We use these to calibrate the screening to you. Skin tone calibration in particular helps remote photoplethysmography work accurately across all users."
      footer={
        <>
          <span className="text-sm text-ink-muted">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-brand-500">
              Sign in
            </Link>
          </span>
          <Button onClick={onContinue} disabled={!valid || submitting}>
            Continue
          </Button>
        </>
      }
    >
      <div className="glimpse-card p-6 sm:p-8 flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field
            label="Email"
            htmlFor="email"
            required
            error={errors.email && email ? errors.email : undefined}
          >
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </Field>
          <Field
            label="Password"
            htmlFor="password"
            required
            hint="At least 8 characters."
            error={errors.password && password ? errors.password : undefined}
          >
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
        </div>

        <div className="glimpse-divider" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Date of birth" htmlFor="dob" required>
            <Input
              id="dob"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </Field>
          <Field
            label="Biological sex"
            htmlFor="sex"
            required
            hint="Used to weight risk priors. You can update this later."
          >
            <Select
              id="sex"
              value={sex}
              onChange={(e) => setSex(e.target.value as Sex)}
            >
              {SEX_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        {/* Units toggle + height/weight */}
        <div>
          <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
            <span className="text-sm font-medium text-ink">
              Height & weight
            </span>
            <UnitToggle value={unitSystem} onChange={setUnitSystem} />
          </div>

          {unitSystem === "metric" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Height (cm)" htmlFor="height-cm" required>
                <Input
                  id="height-cm"
                  type="number"
                  inputMode="numeric"
                  value={heightCm === "" ? "" : heightCm}
                  onChange={(e) =>
                    setHeightCm(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  placeholder="178"
                />
              </Field>
              <Field label="Weight (kg)" htmlFor="weight-kg" required>
                <Input
                  id="weight-kg"
                  type="number"
                  inputMode="numeric"
                  value={weightKg === "" ? "" : weightKg}
                  onChange={(e) =>
                    setWeightKg(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  placeholder="78"
                />
              </Field>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Height" required hint="Feet and inches">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={feetInput}
                      onChange={(e) => {
                        setFeetInput(e.target.value);
                        updateHeightFromImperial(e.target.value, inchesInput);
                      }}
                      placeholder="5"
                      aria-label="Feet"
                    />
                  </div>
                  <span className="text-ink-muted text-sm">ft</span>
                  <div className="flex-1">
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={inchesInput}
                      onChange={(e) => {
                        setInchesInput(e.target.value);
                        updateHeightFromImperial(feetInput, e.target.value);
                      }}
                      placeholder="10"
                      aria-label="Inches"
                    />
                  </div>
                  <span className="text-ink-muted text-sm">in</span>
                </div>
              </Field>
              <Field label="Weight (lb)" required>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={lbsInput}
                  onChange={(e) => {
                    setLbsInput(e.target.value);
                    updateWeightFromImperial(e.target.value);
                  }}
                  placeholder="172"
                />
              </Field>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field
            label="Hand dominance"
            htmlFor="hand"
            hint="Lets us interpret finger-tap differences correctly."
          >
            <Select
              id="hand"
              value={handDominance}
              onChange={(e) => setHandDominance(e.target.value as HandDominance)}
            >
              {HAND_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="Primary language"
            htmlFor="language"
            hint="Affects verbal-fluency norms. App instructions are English in v1."
          >
            <Select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {LANGUAGE_OPTIONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="Skin tone"
            htmlFor="ethnicity"
            className="sm:col-span-2"
            hint="Helps calibrate remote photoplethysmography accurately across Fitzpatrick types."
          >
            <Select
              id="ethnicity"
              value={ethnicity}
              onChange={(e) =>
                setEthnicity(e.target.value as FitzpatrickEthnicityHint)
              }
            >
              {ETHNICITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="glimpse-divider" />

        <div className="flex flex-col gap-3">
          <Checkbox
            id="hipaa"
            checked={hipaa}
            onChange={setHipaa}
            label={
              <>
                I consent to Glimpse processing my protected health information
                under HIPAA.
              </>
            }
            hint="Required. Raw audio and video are processed and discarded; only derived features are kept."
          />
          <Checkbox
            id="gdpr"
            checked={gdpr}
            onChange={setGdpr}
            label={<>I&apos;m in the European Union, and consent under GDPR.</>}
            hint="Only required if you reside in the EU/EEA."
          />
        </div>
      </div>
    </StepShell>
  );
}

function UnitToggle({
  value,
  onChange,
}: {
  value: UnitSystem;
  onChange: (v: UnitSystem) => void;
}) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-xl bg-surface p-1 border border-black/[0.06]">
      {(["metric", "imperial"] as const).map((u) => (
        <button
          key={u}
          type="button"
          onClick={() => onChange(u)}
          aria-pressed={value === u}
          className={cn(
            "rounded-lg px-3 py-1 text-xs font-medium transition",
            value === u
              ? "bg-brand-500 text-white"
              : "text-ink-muted hover:text-ink",
          )}
        >
          {u === "metric" ? "cm · kg" : "ft · lb"}
        </button>
      ))}
    </div>
  );
}
