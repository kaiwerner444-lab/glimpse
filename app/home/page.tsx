"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sunrise, BarChart3, Users, Settings } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { loadOnboarding } from "@/lib/db/mock-db";

export default function Home() {
  const [name, setName] = useState<string>("");

  useEffect(() => {
    const state = loadOnboarding();
    if (state.account?.email) {
      const local = state.account.email.split("@")[0];
      setName(local.replace(/[._-]/g, " "));
    }
  }, []);

  return (
    <div className="min-h-dvh bg-surface-alt">
      <header className="px-6 py-5 max-w-3xl w-full mx-auto flex items-center justify-between">
        <Logo />
        <Link
          href="/onboarding/account"
          className="text-sm text-ink-muted hover:text-ink"
        >
          <Settings className="inline h-4 w-4 mr-1" />
          Profile
        </Link>
      </header>

      <main className="px-6 max-w-3xl w-full mx-auto py-10 animate-fade-up">
        <p className="text-sm font-medium uppercase tracking-wider text-brand-500 mb-2">
          Welcome to Glimpse
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-ink">
          {name ? `You're all set, ${capitalize(name)}.` : "You're all set."}
        </h1>
        <p className="mt-3 text-lg text-ink-muted">
          Your first session begins tomorrow morning. We&apos;ll send a gentle
          reminder.
        </p>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StubTile
            icon={<Sunrise className="h-5 w-5" />}
            title="Daily session"
            body="Five minute mirror ritual"
            note="Coming next build"
          />
          <StubTile
            icon={<BarChart3 className="h-5 w-5" />}
            title="Reports"
            body="Weekly trends & monthly summary"
            note="Stubbed"
          />
          <StubTile
            icon={<Users className="h-5 w-5" />}
            title="Family access"
            body="Share with caregivers"
            note="Stubbed"
          />
        </div>

        <div className="mt-10 text-sm text-ink-muted">
          Glimpse is a wellness and clinical decision support tool. It does
          not diagnose disease. In an emergency, call 911.
        </div>
      </main>
    </div>
  );
}

function StubTile({
  icon,
  title,
  body,
  note,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  note: string;
}) {
  return (
    <div className="glimpse-card p-5">
      <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="text-sm text-ink-muted mt-1">{body}</p>
      <p className="text-xs uppercase tracking-wider text-ink-subtle mt-3">
        {note}
      </p>
    </div>
  );
}

function capitalize(s: string) {
  return s
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
