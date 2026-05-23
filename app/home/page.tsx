"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Settings, Users, FileText, ChevronRight } from "lucide-react";
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
import { loadOnboarding } from "@/lib/db/mock-db";
import { buildSignalSeries } from "@/lib/dashboard/synth-data";
import {
  emptyState,
  loadGamification,
  levelFromXp,
} from "@/lib/gamification/state";
import type { GamificationState } from "@/lib/gamification/types";

export default function Home() {
  const [name, setName] = useState<string>("");
  const [daysSinceStart, setDaysSinceStart] = useState<number>(0);
  const [game, setGame] = useState<GamificationState>(() => emptyState());
  const series = useMemo(() => buildSignalSeries(), []);

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

    // Hydrate gamification, seeding a plausible starting state for the demo
    // when nothing exists yet — so the leaderboard and level badge feel alive.
    const existing = loadGamification();
    if (existing.totalSessions === 0) {
      const seeded: GamificationState = {
        ...existing,
        xp: 280,
        totalSessions: 12,
        currentStreak: 5,
        longestStreak: 7,
        weeklyChallengeProgress: 3,
        achievements: ["first-step", "three-day"],
      };
      setGame(seeded);
    } else {
      setGame(existing);
    }
  }, []);

  const level = levelFromXp(game.xp);

  return (
    <div className="min-h-dvh bg-surface-alt">
      <Header />

      <main className="px-4 sm:px-6 lg:px-8 max-w-6xl w-full mx-auto py-6 sm:py-10 flex flex-col gap-8 sm:gap-10">
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
                The last fourteen days, at a glance
              </h2>
            </div>
            <Link
              href="#"
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
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 animate-stagger-up"
          style={{ animationDelay: "380ms" }}
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
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-stagger-up"
          style={{ animationDelay: "560ms" }}
        >
          <QuickLink
            href="#"
            icon={<FileText className="h-5 w-5" />}
            title="Reports"
            body="Weekly trends and monthly summaries you can share with a clinician."
          />
          <QuickLink
            href="#"
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
      <Logo />
      <nav className="flex items-center gap-1 text-sm">
        <Link
          href="/clinician"
          className="px-3 py-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-black/[0.04]"
        >
          For clinicians
        </Link>
        <Link
          href="#"
          aria-label="Settings"
          className="px-2 py-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-black/[0.04]"
        >
          <Settings className="h-4 w-4" />
        </Link>
      </nav>
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
