"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Shield, Activity, Eye } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { MetaVision } from "@/components/landing/MetaVision";
import { WhatWeScreenFor } from "@/components/landing/WhatWeScreenFor";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { EditorialHero } from "@/components/landing/EditorialHero";
import { Reveal } from "@/components/motion/Reveal";
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
    <div className="min-h-dvh flex flex-col glimpse-paper">
      <header className="sticky top-0 z-30 px-6 py-4 bg-surface/85 backdrop-blur-md border-b border-hairline">
        <div className="max-w-[1200px] w-full mx-auto flex items-center justify-between">
          <Link
            href="/"
            aria-label="Glimpse home"
            className="-ml-1 px-1 py-1 hover:bg-surface-paper transition rounded"
          >
            <Logo />
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              href="/clinician"
              className="glimpse-mono px-3 py-1.5 text-ink-muted hover:text-ink transition"
            >
              FOR CLINICIANS
            </Link>
            <Link
              href="/auth/signin"
              className="glimpse-mono px-3 py-1.5 text-ink-muted hover:text-ink transition"
            >
              SIGN IN
            </Link>
            <Link
              href={hydrated ? resumeHref : "/onboarding/account"}
              className="group ml-1 inline-flex items-center gap-1.5 rounded-full bg-ink text-surface px-4 h-9 text-[13px] font-medium transition-transform duration-200 hover:-translate-y-px"
            >
              Get started
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-[3px]" />
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 px-6 sm:px-8 max-w-[1200px] w-full mx-auto">
        <EditorialHero
          resumeHref={hydrated ? resumeHref : "/onboarding/account"}
        />

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-16 pb-16">
          {[
            {
              icon: <Eye className="h-5 w-5" />,
              title: "Five minutes a day",
              body: "A short mirror ritual. Speech, facial, movement, and a quick cognitive task — no more than five minutes.",
            },
            {
              icon: <Activity className="h-5 w-5" />,
              title: "Personal baseline",
              body: "We compare you to you, not to a population average. Drifts from your own normal are what matter.",
            },
            {
              icon: <Shield className="h-5 w-5" />,
              title: "HIPAA-grade privacy",
              body: "Raw audio and video are processed and discarded. Only derived features are kept, and you can delete everything at any time.",
            },
          ].map((f, i) => (
            <Reveal key={f.title} delay={i * 0.06}>
              <FeatureTile {...f} />
            </Reveal>
          ))}
        </section>

        <Reveal>
          <section className="pb-16 sm:pb-20">
            <HowItWorks />
          </section>
        </Reveal>

        <Reveal>
          <section className="pb-16 sm:pb-20">
            <WhatWeScreenFor />
          </section>
        </Reveal>

        <Reveal>
          <section className="pb-20">
            <MetaVision />
          </section>
        </Reveal>

        <Reveal>
          <section className="pb-20">
            <FinalCta />
          </section>
        </Reveal>
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
    <div className="relative overflow-hidden rounded-[2rem] border border-black/[0.06] bg-ink text-white p-10 sm:p-16 text-center">
      <div className="absolute inset-0 -z-0 opacity-50">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[520px] w-[520px] rounded-full bg-[radial-gradient(closest-side,_rgba(51,169,176,0.45)_0%,_transparent_70%)] animate-mesh-drift-a" />
      </div>
      <div className="relative">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-brand-300 mb-4">
          Start the ritual
        </p>
        <h2 className="glimpse-display text-4xl sm:text-6xl text-white max-w-2xl mx-auto">
          Five minutes a day. For the rest of your life.
        </h2>
        <p className="mt-5 text-lg text-white/70 max-w-xl mx-auto leading-relaxed">
          Onboarding takes about ten minutes once. Then it&apos;s five
          minutes a day, on your own schedule.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/onboarding/account">
            <Button size="lg" className="gap-2 shadow-elevated bg-white text-ink hover:bg-white/90 border-white">
              Get started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/auth/signin">
            <Button
              variant="secondary"
              size="lg"
              className="bg-transparent text-white border-white/30 hover:bg-white/10"
            >
              I already have an account
            </Button>
          </Link>
        </div>
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
