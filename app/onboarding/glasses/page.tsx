"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bluetooth, Camera, Glasses, ExternalLink } from "lucide-react";
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
  const [pairing, setPairing] = useState(false);
  const [paired, setPaired] = useState(!!state.glasses?.pairedAt);

  const goBack = () => router.push("/onboarding/account");

  const onContinue = () => {
    if (!mode) return;
    update({
      glasses: {
        mode,
        pairedAt: paired ? new Date().toISOString() : undefined,
      },
      step: "genomics",
    });
    router.push("/onboarding/genomics");
  };

  const simulatePair = async () => {
    setPairing(true);
    // Stub. In production, this kicks off the Meta companion SDK handshake
    // or, for the fallback, requests getUserMedia({ video: { facingMode: "user" } }).
    await new Promise((r) => setTimeout(r, 1400));
    setPairing(false);
    setPaired(true);
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
          onChange={(v) => {
            setMode(v);
            if (v !== "ray_ban_meta") setPaired(false);
          }}
          options={[
            {
              value: "ray_ban_meta",
              label: "I have Meta Ray Ban glasses",
              description:
                "Pair over Bluetooth. We'll use the camera, microphone, and IMU during active sessions only.",
              icon: <Glasses className="h-5 w-5" />,
            },
            {
              value: "phone_fallback",
              label: "Use my phone as a fallback",
              description:
                "Mount your phone in front of the mirror with the front camera facing you. Slightly noisier signal, but works everywhere.",
              icon: <Camera className="h-5 w-5" />,
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
          <div className="glimpse-card p-6 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center">
                <Bluetooth className="h-5 w-5" />
              </div>
              <div>
                <p className="text-base font-medium text-ink">
                  {paired ? "Paired with Meta Ray Ban" : "Pair over Bluetooth"}
                </p>
                <p className="text-sm text-ink-muted">
                  {paired
                    ? "Camera, microphone, and IMU access granted for active sessions only."
                    : "We only request access during the daily session, never in the background."}
                </p>
              </div>
            </div>
            <Button
              variant={paired ? "secondary" : "primary"}
              onClick={simulatePair}
              disabled={pairing || paired}
            >
              {pairing ? "Pairing…" : paired ? "Paired" : "Start pairing"}
            </Button>
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
