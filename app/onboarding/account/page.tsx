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
import type { FitzpatrickEthnicityHint, Sex } from "@/lib/types";

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

export default function AccountStep() {
  const router = useRouter();
  const { state, update } = useOnboardingState();

  const [email, setEmail] = useState(state.account?.email ?? "");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState(state.account?.dateOfBirth ?? "");
  const [sex, setSex] = useState<Sex>(state.account?.sex ?? "prefer_not_to_say");
  const [heightCm, setHeightCm] = useState<string>(
    state.account ? String(state.account.heightCm) : "",
  );
  const [weightKg, setWeightKg] = useState<string>(
    state.account ? String(state.account.weightKg) : "",
  );
  const [ethnicity, setEthnicity] = useState<FitzpatrickEthnicityHint>(
    state.account?.ethnicityHint ?? "unspecified",
  );
  const [hipaa, setHipaa] = useState(state.account?.hipaaConsent ?? false);
  const [gdpr, setGdpr] = useState(state.account?.gdprConsent ?? false);
  const [submitting, setSubmitting] = useState(false);

  const errors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (!email.match(/.+@.+\..+/)) errs.email = "Enter a valid email";
    if (password.length < 8) errs.password = "Use 8 characters or more";
    if (!dob) errs.dob = "Required";
    if (!heightCm || Number(heightCm) <= 0) errs.heightCm = "Required";
    if (!weightKg || Number(weightKg) <= 0) errs.weightKg = "Required";
    if (!hipaa) errs.hipaa = "Consent required to proceed";
    return errs;
  }, [email, password, dob, heightCm, weightKg, hipaa]);

  const valid = Object.keys(errors).length === 0;

  const onContinue = () => {
    if (!valid) return;
    setSubmitting(true);
    const account = signUp({
      email,
      password,
      dateOfBirth: dob,
      sex,
      heightCm: Number(heightCm),
      weightKg: Number(weightKg),
      ethnicityHint: ethnicity,
      hipaaConsent: hipaa,
      gdprConsent: gdpr,
    });
    update({ account, step: "glasses" });
    router.push("/onboarding/glasses");
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
            <Link href="/onboarding/account" className="text-brand-500">
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
          <Field label="Email" htmlFor="email" required error={errors.email && email ? errors.email : undefined}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </Field>
          <Field label="Password" htmlFor="password" required hint="At least 8 characters." error={errors.password && password ? errors.password : undefined}>
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
          <Field label="Biological sex" htmlFor="sex" required hint="Used to weight risk priors. You can update this later.">
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
          <Field label="Height (cm)" htmlFor="height" required>
            <Input
              id="height"
              type="number"
              inputMode="numeric"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              placeholder="178"
            />
          </Field>
          <Field label="Weight (kg)" htmlFor="weight" required>
            <Input
              id="weight"
              type="number"
              inputMode="numeric"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              placeholder="78"
            />
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
