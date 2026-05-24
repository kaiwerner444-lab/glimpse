"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Users, FileText, ChevronRight } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Greeting } from "@/components/dashboard/Greeting";
import { SignalCard } from "@/components/dashboard/SignalCard";
import { StreakBadge } from "@/components/dashboard/StreakBadge";
import { SessionPrompt } from "@/components/dashboard/SessionPrompt";
import { LearningPath } from "@/components/dashboard/LearningPath";
import { FeedbackModule } from "@/components/dashboard/FeedbackModule";
import { ShareModule } from "@/components/dashboard/ShareModule";
import { LevelBadge } from "@/components/dashboard/LevelBadge";
import { WeeklyChallenge } from "@/components/dashboard/WeeklyChallenge";
import { AchievementsGrid } from "@/components/dashboard/AchievementsGrid";
import { FriendsPanel } from "@/components/dashboard/FriendsPanel";
import { AccountMenu } from "@/components/dashboard/AccountMenu";
import { HabitAndFreeze } from "@/components/dashboard/HabitAndFreeze";
import { AiInsights } from "@/components/dashboard/AiInsights";
import { SensorIntegrations } from "@/components/dashboard/SensorIntegrations";
import { CompleteAssessmentBanner } from "@/components/dashboard/CompleteAssessmentBanner";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
import { MobileMenu } from "@/components/dashboard/MobileMenu";
import { loadOnboarding } from "@/lib/db/mock-db";
import { useRequireAuth } from "@/lib/auth/require-auth";
import {
  buildSignalSeriesFromHistory,
  onSessionSaved,
  type RealSeriesResult,
} from "@/lib/dashboard/session-history";
import {
  emptyState,
  loadGamification,
  saveGamification,
  consumeFreezesIfNeeded,
  levelFromXp,
} from "@/lib/gamification/state";
import type { GamificationState } from "@/lib/gamification/types";

export default function Home() {
  const ready = useRequireAuth();
  const [name, setName] = useState<string>("");
  const [daysSinceStart, setDaysSinceStart] = useState<number>(0);
  const [game, setGame] = useState<GamificationState>(() => emptyState());
  const [seriesResult, setSeriesResult] = useState<RealSeriesResult | null>(null);
  useEffect(() => {
    const sync = () => setSeriesResult(buildSignalSeriesFromHistory());
    sync();
    return onSessionSaved(sync);
  }, []);
  const series = seriesResult?.series ?? [];

  useEffect(() => {
    const state = loadOnboarding();
    if (state.account?.email) {
      const local = state.account.email.split("@")[0];
      setName(capitalize(local.replace(/[._-]/g, " ").split(" ")[0]));
    }
    if (state.completedAt) {
      const days = Math.max(
        0,
        Math.floor(
          (Date.now() - new Date(state.completedAt).getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      );
      setDaysSinceStart(days);
    }

    // Hydrate gamification. First consume any pending streak freezes
    // for missed days — keeps the streak alive automatically while
    // freezes last, then breaks it cleanly when they run out.
    let existing = loadGamification();
    const { next: afterFreezes, consumed } = consumeFreezesIfNeeded(existing);
    if (consumed > 0) {
      existing = afterFreezes;
      saveGamification(afterFreezes);
    }
    // No more demo-seeding of bogus counts. A fresh user honestly
    // starts at 0 XP / 0 sessions / 0 streak. The UI's empty-state
    // copy carries the rest of the weight.
    setGame(existing);
  }, []);

  const level = levelFromXp(game.xp);

  if (!ready) {
    return <div className="min-h-dvh bg-surface-alt" aria-busy />;
  }

  return (
    <div className="min-h-dvh bg-surface-alt">
      <Header />

      <main className="px-4 sm:px-6 lg:px-8 max-w-6xl w-full mx-auto py-6 sm:py-10 flex flex-col gap-8 sm:gap-10">
        <CompleteAssessmentBanner />
        <AlertBanner />
        <Greeting name={name} />

        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 animate-stagger-up"
          style={{ animationDelay: "60ms" }}
        >
          <div className="lg:col-span-2">
            <SessionPrompt
              available
              scheduledLabel="Now · five-minute window open"
              taskCount={7}
              href="/session/daily"
            />
          </div>
          <StreakBadge
            days={game.currentStreak}
            totalSessions={game.totalSessions}
          />
        </div>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 animate-stagger-up"
          style={{ animationDelay: "100ms" }}
        >
          <LevelBadge xp={game.xp} />
          <WeeklyChallenge progress={game.weeklyChallengeProgress} />
        </div>

        <section
          className="animate-stagger-up"
          style={{ animationDelay: "180ms" }}
        >
          <div className="flex items-end justify-between gap-3 mb-4 flex-wrap">
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-brand-500">
                Your signals
              </p>
              <h2 className="text-2xl font-semibold text-ink leading-tight">
                {seriesResult?.source === "real"
                  ? `From your last ${seriesResult.sessionCount} ${seriesResult.sessionCount === 1 ? "session" : "sessions"}`
                  : "The last fourteen days, at a glance"}
              </h2>
              {seriesResult?.source === "demo" ? (
                <p className="text-xs text-ink-muted mt-1">
                  Demo data · complete a daily session to see your real signals.
                </p>
              ) : null}
            </div>
            <Link
              href="/reports"
              className="text-sm font-medium text-brand-500 hover:text-brand-600 inline-flex items-center gap-1"
            >
              View full report
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {series.map((s, i) => (
              <div
                key={s.id}
                className="animate-stagger-up"
                style={{ animationDelay: `${220 + i * 60}ms` }}
              >
                <SignalCard series={s} />
              </div>
            ))}
          </div>
        </section>

        <div
          className="animate-stagger-up"
          style={{ animationDelay: "340ms" }}
        >
          <AiInsights daysSinceStart={Math.max(daysSinceStart, 4)} />
        </div>

        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 animate-stagger-up"
          style={{ animationDelay: "400ms" }}
        >
          <LearningPath daysSinceStart={Math.max(daysSinceStart, 4)} />
          <FriendsPanel
            yourName={name || "You"}
            yourStreak={game.currentStreak}
            yourSessionsThisWeek={game.weeklyChallengeProgress}
            yourLevel={level.level}
          />
        </div>

        <div
          className="animate-stagger-up"
          style={{ animationDelay: "440ms" }}
        >
          <HabitAndFreeze />
        </div>

        <div
          className="animate-stagger-up"
          style={{ animationDelay: "480ms" }}
        >
          <AchievementsGrid unlockedIds={game.achievements} />
        </div>

        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 animate-stagger-up"
          style={{ animationDelay: "500ms" }}
        >
          <FeedbackModule />
          <ShareModule />
        </div>

        <div
          className="animate-stagger-up"
          style={{ animationDelay: "540ms" }}
        >
          <SensorIntegrations />
        </div>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-stagger-up"
          style={{ animationDelay: "560ms" }}
        >
          <QuickLink
            href="/reports"
            icon={<FileText className="h-5 w-5" />}
            title="Reports"
            body="Weekly trends and monthly summaries you can share with a clinician."
          />
          <QuickLink
            href="/sessions"
            icon={<FileText className="h-5 w-5" />}
            title="Session history"
            body="Read through your past answers, per-task scores, and what was captured."
          />
          <QuickLink
            href="/family"
            icon={<Users className="h-5 w-5" />}
            title="Family access"
            body="Share a read-only view with up to three trusted people."
          />
        </div>

        <footer className="text-sm text-ink-muted leading-relaxed pt-2">
          Glimpse is a wellness and clinical decision support tool. It does
          not diagnose disease. In an emergency, call 911.
        </footer>
      </main>
    </div>
  );
}

function Header() {
  return (
    <header className="px-4 sm:px-6 lg:px-8 max-w-6xl w-full mx-auto py-5 flex items-center justify-between">
      <Link
        href="/"
        aria-label="Glimpse home"
        className="rounded-lg -ml-1 px-1 py-1 hover:bg-black/[0.04] transition"
      >
        <Logo />
      </Link>
      {/* Desktop nav stays inline. Mobile collapses everything into a
          hamburger sheet so the header stops feeling crowded on phones. */}
      <nav className="hidden md:flex items-center gap-3 text-sm">
        <Link
          href="/clinician"
          className="px-3 py-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-black/[0.04]"
        >
          For clinicians
        </Link>
        <AccountMenu />
      </nav>
      <MobileMenu variant="dashboard" />
    </header>
  );
}

function QuickLink({
  href,
  icon,
  title,
  body,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="glimpse-card p-5 group transition hover:shadow-card flex items-center gap-4"
    >
      <div className="h-12 w-12 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-base font-semibold text-ink">{title}</p>
        <p className="text-sm text-ink-muted mt-0.5 leading-snug">{body}</p>
      </div>
      <ChevronRight className="h-5 w-5 text-ink-subtle group-hover:text-brand-500 group-hover:translate-x-0.5 transition" />
    </Link>
  );
}

function capitalize(s: string) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}
