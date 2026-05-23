"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Shield, Activity, Eye } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
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
      <header className="px-6 py-5 max-w-5xl w-full mx-auto flex items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/clinician"
            className="px-3 py-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-black/[0.04]"
          >
            For clinicians
          </Link>
        </nav>
      </header>

      <main className="flex-1 px-6 max-w-5xl w-full mx-auto">
        <section className="pt-12 sm:pt-20 pb-16">
          <p className="text-sm font-medium uppercase tracking-wider text-brand-500 mb-4">
            Proactive screening, on your terms
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-ink leading-[1.05] max-w-3xl">
            See the earliest signals,{" "}
            <span className="text-brand-500">years</span> before a clinic
            would.
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-ink-muted max-w-2xl leading-relaxed">
            Glimpse is a five minute daily mirror ritual. Paired with Meta Ray
            Ban glasses and your genome, it picks up the small drifts in
            speech, movement and expression that precede neurological and
            chronic disease.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link href={hydrated ? resumeHref : "/onboarding/account"}>
              <Button size="lg" className="gap-2">
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
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-20">
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
    <div className="glimpse-card p-6">
      <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-base text-ink-muted leading-relaxed">{body}</p>
    </div>
  );
}
