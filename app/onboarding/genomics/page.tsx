"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dna, Upload, SkipForward, FileCheck2, ListChecks } from "lucide-react";
import { StepShell } from "@/components/onboarding/StepShell";
import { Button } from "@/components/ui/Button";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { Select } from "@/components/ui/Select";
import { Field } from "@/components/ui/Field";
import { Checkbox } from "@/components/ui/Checkbox";
import { useOnboardingState } from "@/hooks/useOnboardingState";
import {
  CONDITION_LABELS,
  type GenomicsPath,
  type GenomicsProvider,
  type TrackedCondition,
} from "@/lib/types";

const PROVIDERS: Array<{ value: GenomicsProvider; label: string }> = [
  { value: "nucleus", label: "Nucleus Genomics (VCF)" },
  { value: "twenty_three_and_me", label: "23andMe (raw .txt)" },
  { value: "ancestry", label: "AncestryDNA (raw .txt)" },
  { value: "myheritage", label: "MyHeritage (raw)" },
  { value: "color", label: "Color Health (VCF)" },
];

const CONDITION_VALUES = Object.keys(CONDITION_LABELS) as TrackedCondition[];

export default function GenomicsStep() {
  const router = useRouter();
  const { state, update } = useOnboardingState();
  const [path, setPath] = useState<GenomicsPath | null>(
    state.genomics?.path ?? null,
  );
  const [provider, setProvider] = useState<GenomicsProvider>(
    state.genomics?.provider ?? "twenty_three_and_me",
  );
  const [fileName, setFileName] = useState<string | undefined>(
    state.genomics?.rawFileName,
  );
  const [selectedConditions, setSelectedConditions] = useState<TrackedCondition[]>(
    state.genomics?.selectedConditions ?? [],
  );

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFileName(f.name);
  };

  const toggleCondition = (c: TrackedCondition) => {
    setSelectedConditions((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
  };

  const selectAll = () => setSelectedConditions(CONDITION_VALUES);
  const clearAll = () => setSelectedConditions([]);

  const canContinue =
    !!path && (path !== "select_diseases" || selectedConditions.length > 0);

  const onContinue = () => {
    if (!path || !canContinue) return;
    update({
      genomics: {
        path,
        provider: path === "import_raw" ? provider : undefined,
        rawFileName: path === "import_raw" ? fileName : undefined,
        orderedAt:
          path === "order_kit" ? new Date().toISOString() : undefined,
        selectedConditions:
          path === "select_diseases" ? selectedConditions : undefined,
      },
      step: "family-history",
    });
    router.push("/onboarding/family-history");
  };

  return (
    <StepShell
      step="genomics"
      eyebrow="Genetics"
      title="How would you like to factor genetics in?"
      description="Polygenic risk scores let us weight what we listen for. You can skip this and add it later — it's not required to start."
      footer={
        <>
          <Button variant="ghost" onClick={() => router.push("/onboarding/glasses")}>
            Back
          </Button>
          <Button onClick={onContinue} disabled={!canContinue}>
            Continue
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <RadioGroup<GenomicsPath>
          name="genomics-path"
          value={path}
          onChange={setPath}
          options={[
            {
              value: "order_kit",
              label: "Order a Nucleus Genomics kit",
              description:
                "Whole genome sequencing, ~$400. Four to six weeks for results. We'll continue without it and weave the data in once it arrives.",
              icon: <Dna className="h-5 w-5" />,
            },
            {
              value: "import_raw",
              label: "Import raw data I already have",
              description:
                "23andMe, AncestryDNA, MyHeritage, Color, or Nucleus. We accept the standard formats.",
              icon: <Upload className="h-5 w-5" />,
            },
            {
              value: "select_diseases",
              label: "Just tell us what to screen for",
              description:
                "Pick the conditions you want monitored. No genetics or family history needed — useful if you already know what's relevant.",
              icon: <ListChecks className="h-5 w-5" />,
            },
            {
              value: "skip",
              label: "Skip for now",
              description:
                "Use family history alone. You can add genetics from your profile at any time.",
              icon: <SkipForward className="h-5 w-5" />,
            },
          ]}
        />

        {path === "import_raw" ? (
          <div className="glimpse-card p-6 flex flex-col gap-5">
            <Field label="Provider" htmlFor="provider">
              <Select
                id="provider"
                value={provider}
                onChange={(e) => setProvider(e.target.value as GenomicsProvider)}
              >
                {PROVIDERS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Raw data file" hint="Stays encrypted at rest. Never shared with third parties.">
              <label className="flex items-center justify-between gap-4 rounded-xl border border-dashed border-black/15 bg-surface-alt px-4 py-4 cursor-pointer hover:border-brand-500/60">
                <span className="flex items-center gap-3 text-base text-ink">
                  {fileName ? (
                    <FileCheck2 className="h-5 w-5 text-success" />
                  ) : (
                    <Upload className="h-5 w-5 text-ink-muted" />
                  )}
                  <span>{fileName ?? "Choose .txt or .vcf file"}</span>
                </span>
                <input
                  type="file"
                  accept=".txt,.vcf,.vcf.gz,.zip"
                  className="hidden"
                  onChange={onFile}
                />
                <span className="text-sm text-brand-500">Browse</span>
              </label>
            </Field>
          </div>
        ) : null}

        {path === "order_kit" ? (
          <div className="glimpse-card p-6">
            <p className="text-base text-ink">
              We&apos;ll send your kit order to Nucleus Genomics after you
              finish onboarding. Results take 4–6 weeks. Your daily ritual can
              start immediately based on family history.
            </p>
          </div>
        ) : null}

        {path === "select_diseases" ? (
          <div className="glimpse-card p-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div>
                <p className="text-base font-semibold text-ink">
                  Pick what to screen for
                </p>
                <p className="text-sm text-ink-muted mt-0.5">
                  {selectedConditions.length} of {CONDITION_VALUES.length} selected
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-sm font-medium text-brand-500 hover:text-brand-600"
                >
                  Select all
                </button>
                <span className="text-ink-subtle">·</span>
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-sm font-medium text-ink-muted hover:text-ink"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CONDITION_VALUES.map((c) => (
                <Checkbox
                  key={c}
                  checked={selectedConditions.includes(c)}
                  onChange={() => toggleCondition(c)}
                  label={CONDITION_LABELS[c]}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </StepShell>
  );
}
