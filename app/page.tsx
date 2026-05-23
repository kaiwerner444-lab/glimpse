"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Shield, Activity, Eye } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { MetaVision } from "@/components/landing/MetaVision";
import { WhatWeScreenFor } from "@/components/landing/WhatWeScreenFor";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { MeshHero } from "@/components/landing/MeshHero";
import { GlimpseEye } from "@/components/dashboard/GlimpseEye";
import { loadOnboarding } from "@/lib/db/mock-db";

export default function Landing() {
  const [resumeHref, setResumeHref] = useState<string>("/onboarding/account");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const state = loadOnboarding();
    if (state.completedAt) {
      setResumeHref("/home");
    } else if (state.step) {
      setResumeHref(`/onboarding/${state.step}`);
    }
    setHydrated(true);
  }, []);

  return (
    <div className="min-h-dvh flex flex-col bg-surface-alt">
      <header className="sticky top-0 z-30 px-6 py-4 backdrop-blur-md bg-surface-alt/80 border-b border-black/[0.04]">
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
          <Link
            href="/"
            aria-label="Glimpse home"
            className="rounded-lg -ml-1 px-1 py-1 hover:bg-black/[0.04] transition"
          >
            <Logo />
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <Link
              href="/clinician"
              className="px-3 py-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-black/[0.04]"
            >
              For clinicians
            </Link>
            <Link
              href="/auth/signin"
              className="px-3 py-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-black/[0.04]"
            >
              Sign in
            </Link>
            <Link
              href={hydrated ? resumeHref : "/onboarding/account"}
              className="ml-1 inline-flex items-center gap-1.5 rounded-xl bg-brand-500 text-white px-4 h-9 text-sm font-medium hover:bg-brand-600 transition"
            >
              Get started
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 max-w-6xl w-full mx-auto">
        {/* Hero */}
        <MeshHero>
          <section className="px-4 sm:px-8 pt-14 sm:pt-24 pb-16 sm:pb-24 relative">
            <div className="absolute right-4 top-12 sm:right-12 sm:top-20 opacity-90 pointer-events-none hidden md:block">
              <GlimpseEye size={220} />
            </div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-brand-600 mb-5 animate-subtle-rise">
              Proactive screening · on your terms
            </p>
            <h1
              className="glimpse-display text-5xl sm:text-7xl lg:text-[5.5rem] text-ink max-w-3xl animate-subtle-rise"
              style={{ animationDelay: "60ms" }}
            >
              See the earliest signals,{" "}
              <em className="text-brand-500 not-italic">years</em>{" "}
              <span className="italic font-normal">before</span> a clinic would.
            </h1>
            <p
              className="mt-7 text-lg sm:text-xl text-ink-muted max-w-xl leading-relaxed animate-subtle-rise"
              style={{ animationDelay: "120ms" }}
            >
              Five minutes a day, in front of any mirror. Meta Ray Ban glasses,
              your phone camera, and your genome — together they pick up the
              small drifts in speech, movement and expression that precede
              neurological and chronic disease.
            </p>
            <div
              className="mt-10 flex flex-wrap items-center gap-3 animate-subtle-rise"
              style={{ animationDelay: "180ms" }}
            >
              <Link href={hydrated ? resumeHref : "/onboarding/account"}>
                <Button size="lg" className="gap-2 shadow-elevated">
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/clinician">
                <Button variant="secondary" size="lg">
                  I&apos;m a clinician
                </Button>
              </Link>
            </div>

            <div
              className="mt-14 flex items-center gap-6 text-sm text-ink-muted animate-subtle-rise"
              style={{ animationDelay: "240ms" }}
            >
              <Trust>HIPAA-aligned</Trust>
              <Trust>Runs on-device</Trust>
              <Trust>Five minutes a day</Trust>
            </div>
          </section>
        </MeshHero>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-16 pb-16">
          <FeatureTile
            icon={<Eye className="h-5 w-5" />}
            title="Five minutes a day"
            body="A short mirror ritual. Speech, facial, movement, and a quick cognitive task — no more than five minutes."
          />
          <FeatureTile
            icon={<Activity className="h-5 w-5" />}
            title="Personal baseline"
            body="We compare you to you, not to a population average. Drifts from your own normal are what matter."
          />
          <FeatureTile
            icon={<Shield className="h-5 w-5" />}
            title="HIPAA-grade privacy"
            body="Raw audio and video are processed and discarded. Only derived features are kept, and you can delete everything at any time."
          />
        </section>

        <section className="pb-16 sm:pb-20">
          <HowItWorks />
        </section>

        <section className="pb-16 sm:pb-20">
          <WhatWeScreenFor />
        </section>

        <section className="pb-20">
          <MetaVision />
        </section>

        <section className="pb-20">
          <FinalCta />
        </section>
      </main>

      <footer className="border-t border-black/[0.06]">
        <div className="px-6 py-6 max-w-5xl w-full mx-auto text-sm text-ink-muted flex flex-wrap items-center justify-between gap-2">
          <span>© Glimpse. A wellness and clinical decision support tool. Not a diagnostic device.</span>
          <span>v0.1 · onboarding preview</span>
        </div>
      </footer>
    </div>
  );
}

function FinalCta() {
  return (
    <div className="relative overflow-hidden rounded-[2rem] p-10 sm:p-16 text-center">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-20 left-1/4 h-[420px] w-[420px] rounded-full bg-[radial-gradient(closest-side,_#99D4D7_0%,_transparent_72%)] opacity-70 animate-mesh-drift-a" />
        <div className="absolute -bottom-24 right-1/4 h-[480px] w-[480px] rounded-full bg-[radial-gradient(closest-side,_#FFDDA9_0%,_transparent_72%)] opacity-60 animate-mesh-drift-b" />
        <div className="absolute inset-0 bg-surface/40 backdrop-blur-xs" />
      </div>
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-brand-600 mb-3">
        Start the ritual
      </p>
      <h2 className="glimpse-display text-4xl sm:text-6xl text-ink max-w-2xl mx-auto">
        Five minutes a day. <em className="not-italic text-brand-500">For the rest of your life.</em>
      </h2>
      <p className="mt-5 text-lg text-ink-muted max-w-xl mx-auto leading-relaxed">
        Onboarding takes about ten minutes once. Then it&apos;s five minutes a
        day, on your own schedule.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/onboarding/account">
          <Button size="lg" className="gap-2 shadow-elevated">
            Get started
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/auth/signin">
          <Button variant="secondary" size="lg">
            I already have an account
          </Button>
        </Link>
      </div>
    </div>
  );
}

function FeatureTile({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="glimpse-card-elevated p-6 transition-shadow hover:shadow-elevated">
      <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-base text-ink-muted leading-relaxed">{body}</p>
    </div>
  );
}

function Trust({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
      {children}
    </span>
  );
}
