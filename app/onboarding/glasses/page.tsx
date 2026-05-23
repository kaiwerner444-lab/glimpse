"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bluetooth, Camera, Glasses, ExternalLink, AlertTriangle, Info } from "lucide-react";
import { StepShell } from "@/components/onboarding/StepShell";
import { Button } from "@/components/ui/Button";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { useOnboardingState } from "@/hooks/useOnboardingState";
import type { GlassesMode } from "@/lib/types";

export default function GlassesStep() {
  const router = useRouter();
  const { state, update } = useOnboardingState();
  const [mode, setMode] = useState<GlassesMode | null>(
    state.glasses?.mode ?? null,
  );
  const goBack = () => router.push("/onboarding/clinical-context");

  const onContinue = () => {
    if (!mode) return;
    update({
      glasses: {
        // Meta Ray Ban genuinely cannot be paired today — store the intent
        // but never claim it's actively paired. The honest version reads
        // 'ray_ban_meta' as "selected, deferred until SDK ships." The phone
        // fallback DOES become live the moment the first session starts
        // getUserMedia.
        mode,
        pairedAt:
          mode === "phone_fallback" ? new Date().toISOString() : undefined,
      },
      step: "genomics",
    });
    router.push("/onboarding/genomics");
  };

  return (
    <StepShell
      step="glasses"
      eyebrow="Hardware setup"
      title="Pair your glasses, or use a phone fallback"
      description="Meta Ray Ban glasses give the cleanest signal because the camera is at eye level. If you don't have a pair yet, the phone front camera works as a fallback while you decide."
      footer={
        <>
          <Button variant="ghost" onClick={goBack}>
            Back
          </Button>
          <Button onClick={onContinue} disabled={!mode}>
            Continue
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <RadioGroup<GlassesMode>
          name="glasses-mode"
          value={mode}
          onChange={(v) => setMode(v)}
          options={[
            {
              value: "phone_fallback",
              label: "Use my phone or laptop camera",
              description:
                "Front camera, requested at the start of every session. Works today, slightly noisier signal than glasses would give.",
              icon: <Camera className="h-5 w-5" />,
            },
            {
              value: "ray_ban_meta",
              label: "Meta Ray Ban (when developer access ships)",
              description:
                "Live streaming from consumer Ray Ban Meta is not yet possible. We'll flip this on the moment Meta opens its SDK to third parties.",
              icon: <Glasses className="h-5 w-5" />,
            },
            {
              value: "deferred",
              label: "Decide later",
              description:
                "Continue onboarding without hardware. You won't be able to run a session until you choose one.",
            },
          ]}
        />

        {mode === "ray_ban_meta" ? (
          <div className="rounded-xl bg-warn/10 border border-warn/20 p-4 flex items-start gap-3">
            <Info className="h-5 w-5 text-warn shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-base font-semibold text-warn mb-1">
                Honest note about Meta Ray Ban
              </p>
              <p className="text-sm text-ink-muted leading-relaxed">
                Meta has not released a public SDK that lets third-party web
                apps stream from consumer Ray Ban Meta glasses in real time.
                For now your sessions will run on the phone or laptop camera
                regardless. Glimpse picks the moment Meta opens developer
                access — until then, this preference is stored without
                fake-pairing.
              </p>
              <a
                href="https://developers.meta.com/wearables/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-warn hover:underline mt-2"
              >
                Meta wearables developer page
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        ) : null}

        {mode === "phone_fallback" ? (
          <div className="glimpse-card p-6">
            <p className="text-base text-ink">
              We&apos;ll request camera access at the start of each session.
              For best results, mount your phone at chest height, facing the
              mirror, in good frontal light.
            </p>
          </div>
        ) : null}

        {mode === null || mode === "deferred" ? (
          <a
            href="https://www.meta.com/smart-glasses/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-brand-500 hover:text-brand-600 text-sm"
          >
            Where to buy Meta Ray Ban glasses
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : null}
      </div>
    </StepShell>
  );
}
