"use client";

import Link from "next/link";
import { ArrowLeft, Heart, Stethoscope, Users, Shield, EyeOff } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { ShareModule } from "@/components/dashboard/ShareModule";
import { useRequireAuth } from "@/lib/auth/require-auth";
import { Reveal } from "@/components/motion/Reveal";

// Dedicated family-access page. Aggregates everything related to "who
// I let see what" in one place: the share module for read-only links,
// plus a brief on what's visible vs not.

export default function FamilyPage() {
  const ready = useRequireAuth();

  if (!ready) {
    return <div className="min-h-dvh bg-surface-alt" aria-busy />;
  }

  return (
    <div className="min-h-dvh bg-surface-alt">
      <header className="px-4 sm:px-6 lg:px-8 max-w-4xl w-full mx-auto py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/home"
            className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <span className="text-ink-subtle">·</span>
          <Link href="/" aria-label="Glimpse home">
            <Logo showWordmark={false} />
          </Link>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 max-w-4xl w-full mx-auto py-6 sm:py-10 flex flex-col gap-8">
        <Reveal>
          <section>
            <p className="text-sm font-medium uppercase tracking-wider text-brand-500 mb-2">
              Family & clinician access
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-ink">
              Who you trust with this
            </h1>
            <p className="mt-3 text-lg text-ink-muted max-w-2xl leading-relaxed">
              Share a read-only summary with up to three trusted people —
              family, caregivers, or clinicians. Links expire automatically,
              can be revoked anytime, and never include raw video unless you
              explicitly choose to.
            </p>
          </section>
        </Reveal>

        <Reveal delay={0.05}>
          <ShareModule />
        </Reveal>

        <Reveal delay={0.1}>
          <section className="glimpse-card p-6">
            <p className="text-sm font-medium uppercase tracking-wider text-brand-500 mb-3">
              What recipients see
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <PrivacyBullet
                icon={<Stethoscope className="h-5 w-5" />}
                title="Reports always"
                body="Weekly and monthly trend summaries, the printable clinician-ready one-pager, and your current alert tier."
              />
              <PrivacyBullet
                icon={<Heart className="h-5 w-5" />}
                title="Video only if you opt in"
                body="Choosing 'Reports + clips' includes signed short-lived video links. Default is reports only — no video."
              />
              <PrivacyBullet
                icon={<Shield className="h-5 w-5" />}
                title="No genetic data, ever"
                body="Polygenic data is the highest-sensitivity tier. It never leaves your account, even on a clinical share."
              />
              <PrivacyBullet
                icon={<EyeOff className="h-5 w-5" />}
                title="Revocable in one click"
                body="Revoke from the share list at any time. The link stops working within seconds."
              />
            </ul>
          </section>
        </Reveal>

        <Reveal delay={0.15}>
          <section className="glimpse-card p-6 flex items-start gap-4">
            <div className="h-10 w-10 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-brand-500 mb-1">
                Caregiver tip
              </p>
              <p className="text-base text-ink leading-relaxed">
                If you&apos;re sharing with a family member who&apos;s also a
                Glimpse user, ask them to add you to their circle from the
                dashboard. Adherence-only views (showing whether you&apos;re
                completing sessions, not what you measured) work without a
                share link.
              </p>
            </div>
          </section>
        </Reveal>

        <footer className="text-sm text-ink-muted leading-relaxed pt-2">
          Glimpse is a wellness and clinical decision support tool. It does
          not diagnose disease. In an emergency, call 911.
        </footer>
      </main>
    </div>
  );
}

function PrivacyBullet({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <li className="rounded-xl border border-black/[0.06] bg-surface-alt p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="h-7 w-7 rounded-lg bg-brand-50 text-brand-500 flex items-center justify-center">
          {icon}
        </span>
        <p className="text-sm font-semibold text-ink">{title}</p>
      </div>
      <p className="text-sm text-ink-muted leading-snug">{body}</p>
    </li>
  );
}
