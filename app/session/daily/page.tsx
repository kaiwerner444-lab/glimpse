"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { SessionRunner } from "@/components/session/SessionRunner";
import { buildDailyTasks, buildUserContext } from "@/lib/session/daily";
import { loadOnboarding } from "@/lib/db/mock-db";
import { recordSession, loadGamification, saveGamification, levelFromXp } from "@/lib/gamification/state";
import { useRequireAuth } from "@/lib/auth/require-auth";
import { saveSessionRecord } from "@/lib/dashboard/session-history";
import type { TaskResult } from "@/lib/session/types";
import type { TaskFeatures } from "@/lib/ml/extractor";

type Stage = "running" | "done";

export default function DailySession() {
  const ready = useRequireAuth();
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("running");
  const [results, setResults] = useState<TaskResult[]>([]);
  const [features, setFeatures] = useState<TaskFeatures[]>([]);
  // Compute on render so the rotation reflects the user's local day
  // AND their personal risk profile (existing diagnoses + family
  // history + confirmed risks).
  const tasks = buildDailyTasks(buildUserContext(loadOnboarding()));
  const [xpEarned, setXpEarned] = useState<number>(0);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  const [newLevel, setNewLevel] = useState<number | null>(null);

  const onComplete = (r: TaskResult[], f: TaskFeatures[]) => {
    setResults(r);
    setFeatures(f);
    // Persist the real ML features + interaction results to the
    // session-history store. The dashboard reads from here next render
    // so the new data point lands on every chart.
    saveSessionRecord({
      id: crypto.randomUUID(),
      completedAt: new Date().toISOString(),
      kind: "daily",
      features: f,
      results: r,
    });
    // Award XP + check level-up + unlock achievements.
    const prev = loadGamification();
    const prevLevel = levelFromXp(prev.xp).level;
    const { next, newAchievements: achs } = recordSession(prev);
    saveGamification(next);
    const after = levelFromXp(next.xp).level;
    setXpEarned(next.xp - prev.xp);
    setNewAchievements(achs);
    if (after > prevLevel) setNewLevel(after);
    setStage("done");
  };

  if (!ready) {
    return <div className="min-h-dvh bg-surface-alt" aria-busy />;
  }

  return (
    <div className="min-h-dvh bg-surface-alt">
      <header className="px-4 sm:px-6 lg:px-8 max-w-3xl w-full mx-auto py-5 flex items-center justify-between">
        <Link href="/home" aria-label="Back to home">
          <Logo />
        </Link>
        <span className="text-sm text-ink-muted">Daily session</span>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 max-w-3xl w-full mx-auto py-6 sm:py-10">
        {stage === "running" ? (
          <SessionRunner
            tasks={tasks}
            onComplete={onComplete}
            onSkipAll={() => router.push("/home")}
          />
        ) : (
          <CompletionScreen
            xpEarned={xpEarned}
            newAchievements={newAchievements}
            newLevel={newLevel}
            results={results}
            features={features}
          />
        )}
      </main>
    </div>
  );
}

function CompletionScreen({
  xpEarned,
  newAchievements,
  newLevel,
  results,
  features,
}: {
  xpEarned: number;
  newAchievements: string[];
  newLevel: number | null;
  results: TaskResult[];
  features: TaskFeatures[];
}) {
  const router = useRouter();
  const completed = results.filter((r) => !r.skipped).length;
  const totalFrames = features.reduce(
    (acc, f) => acc + (f.framesAnalysed || 0),
    0,
  );

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      <div className="glimpse-card p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50/60 via-transparent to-sunrise-50/60 pointer-events-none" />
        <div className="relative">
          <CheckCircle2 className="h-12 w-12 text-success mx-auto" />
          <h1 className="text-3xl font-semibold text-ink mt-4">
            Session complete
          </h1>
          <p className="text-base text-ink-muted mt-2 max-w-md mx-auto">
            {completed} of {results.length} tasks captured.
            {totalFrames > 0 ? ` ${totalFrames.toLocaleString()} frames analysed.` : ""}
          </p>
          {xpEarned > 0 ? (
            <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-sunrise-100 text-sunrise-500 px-4 py-1.5 text-sm font-semibold">
              +{xpEarned} XP
            </p>
          ) : null}
          {newLevel ? (
            <p className="mt-3 text-base font-medium text-brand-600">
              You reached Level {newLevel}.
            </p>
          ) : null}
        </div>
      </div>

      {newAchievements.length > 0 ? (
        <div className="glimpse-card p-6">
          <p className="text-sm font-medium uppercase tracking-wider text-brand-500 mb-2">
            New achievements
          </p>
          <p className="text-base text-ink">
            {newAchievements.length === 1
              ? "You unlocked an achievement."
              : `You unlocked ${newAchievements.length} achievements.`}{" "}
            Take a look on your dashboard.
          </p>
        </div>
      ) : null}

      <div className="flex justify-center">
        <Button onClick={() => router.push("/home")}>Back to home</Button>
      </div>
    </div>
  );
}
