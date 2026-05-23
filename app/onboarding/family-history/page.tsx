"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { StepShell } from "@/components/onboarding/StepShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Field } from "@/components/ui/Field";
import { Checkbox } from "@/components/ui/Checkbox";
import { useOnboardingState } from "@/hooks/useOnboardingState";
import {
  CONDITION_LABELS,
  RELATIONSHIP_LABELS,
  type FamilyMember,
  type Relationship,
  type TrackedCondition,
} from "@/lib/types";

function blankMember(): FamilyMember {
  return {
    id: crypto.randomUUID(),
    relationship: "mother",
    ageOrAgeAtDeath: null,
    deceased: false,
    conditions: [],
  };
}

export default function FamilyHistoryStep() {
  const router = useRouter();
  const { state, update } = useOnboardingState();
  const [members, setMembers] = useState<FamilyMember[]>(
    state.familyHistory?.members?.length
      ? state.familyHistory.members
      : [blankMember()],
  );

  const setMember = (id: string, patch: Partial<FamilyMember>) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    );
  };

  const toggleCondition = (id: string, c: TrackedCondition) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              conditions: m.conditions.includes(c)
                ? m.conditions.filter((x) => x !== c)
                : [...m.conditions, c],
            }
          : m,
      ),
    );
  };

  const addMember = () => setMembers((prev) => [...prev, blankMember()]);
  const removeMember = (id: string) =>
    setMembers((prev) =>
      prev.length > 1 ? prev.filter((m) => m.id !== id) : prev,
    );

  const onContinue = () => {
    update({
      familyHistory: { members },
      step: "risk-profile",
    });
    router.push("/onboarding/risk-profile");
  };

  return (
    <StepShell
      step="family-history"
      eyebrow="Family history"
      title="Who in your family, and what did they have?"
      description="First-degree relatives carry the most signal, but second-degree relatives matter too. Add as many as you'd like — you can come back to this later."
      footer={
        <>
          <Button
            variant="ghost"
            onClick={() => router.push("/onboarding/genomics")}
          >
            Back
          </Button>
          <Button onClick={onContinue}>Continue</Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {members.map((m, idx) => (
          <MemberCard
            key={m.id}
            member={m}
            index={idx}
            onChange={(patch) => setMember(m.id, patch)}
            onToggleCondition={(c) => toggleCondition(m.id, c)}
            onRemove={() => removeMember(m.id)}
            removable={members.length > 1}
          />
        ))}

        <button
          type="button"
          onClick={addMember}
          className="self-start inline-flex items-center gap-2 text-brand-500 hover:text-brand-600 text-base font-medium"
        >
          <Plus className="h-4 w-4" />
          Add another relative
        </button>
      </div>
    </StepShell>
  );
}

const RELATIONSHIP_VALUES = Object.keys(RELATIONSHIP_LABELS) as Relationship[];
const CONDITION_VALUES = Object.keys(CONDITION_LABELS) as TrackedCondition[];

function MemberCard({
  member,
  index,
  onChange,
  onToggleCondition,
  onRemove,
  removable,
}: {
  member: FamilyMember;
  index: number;
  onChange: (patch: Partial<FamilyMember>) => void;
  onToggleCondition: (c: TrackedCondition) => void;
  onRemove: () => void;
  removable: boolean;
}) {
  return (
    <div className="glimpse-card p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-ink">Relative {index + 1}</h3>
        {removable ? (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-alert"
            aria-label="Remove relative"
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Field label="Relationship">
          <Select
            value={member.relationship}
            onChange={(e) =>
              onChange({ relationship: e.target.value as Relationship })
            }
          >
            {RELATIONSHIP_VALUES.map((r) => (
              <option key={r} value={r}>
                {RELATIONSHIP_LABELS[r]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={member.deceased ? "Age at death" : "Current age"}>
          <Input
            type="number"
            inputMode="numeric"
            value={member.ageOrAgeAtDeath ?? ""}
            onChange={(e) =>
              onChange({
                ageOrAgeAtDeath: e.target.value === "" ? null : Number(e.target.value),
              })
            }
            placeholder="—"
          />
        </Field>
        <Field label="Status">
          <div className="h-11 flex items-center">
            <Checkbox
              checked={member.deceased}
              onChange={(v) => onChange({ deceased: v })}
              label="Deceased"
            />
          </div>
        </Field>
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium text-ink mb-3">Conditions</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {CONDITION_VALUES.map((c) => (
            <Checkbox
              key={c}
              checked={member.conditions.includes(c)}
              onChange={() => onToggleCondition(c)}
              label={CONDITION_LABELS[c]}
            />
          ))}
        </div>
        <Field
          label="Other conditions"
          hint="Optional. Anything not in the list above."
          className="mt-4"
        >
          <Input
            value={member.otherConditions ?? ""}
            onChange={(e) => onChange({ otherConditions: e.target.value })}
            placeholder="e.g. essential tremor, early-onset hearing loss"
          />
        </Field>
      </div>
    </div>
  );
}
