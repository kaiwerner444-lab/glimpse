import type { GamificationState, LevelInfo } from "./types";
import { ACHIEVEMENTS } from "./achievements";

const STORAGE_KEY = "glimpse.gamification";

// Six gentle levels. Names skew supportive, never "champion" — this is a
// health app, not a fitness leaderboard.
export const LEVELS: LevelInfo[] = [
  { level: 1, minXp: 0, nextXp: 100, title: "Showing up" },
  { level: 2, minXp: 100, nextXp: 300, title: "Finding a rhythm" },
  { level: 3, minXp: 300, nextXp: 700, title: "Steady" },
  { level: 4, minXp: 700, nextXp: 1500, title: "Anchored" },
  { level: 5, minXp: 1500, nextXp: 3000, title: "Long view" },
  { level: 6, minXp: 3000, nextXp: Number.POSITIVE_INFINITY, title: "Lifelong" },
];

export function levelFromXp(xp: number): LevelInfo {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (xp >= lvl.minXp) current = lvl;
  }
  return current;
}

export function progressToNext(xp: number): { ratio: number; xpInLevel: number; xpToNext: number } {
  const current = levelFromXp(xp);
  const xpInLevel = xp - current.minXp;
  const span = current.nextXp - current.minXp;
  if (!Number.isFinite(span)) {
    return { ratio: 1, xpInLevel, xpToNext: 0 };
  }
  return {
    ratio: Math.max(0, Math.min(1, xpInLevel / span)),
    xpInLevel,
    xpToNext: current.nextXp - xp,
  };
}

const SESSION_BASE_XP = 25;
const STREAK_BONUS_PER_DAY = 5;
const STREAK_BONUS_CAP_DAYS = 14;

export function xpForSession(streakAfter: number): number {
  const bonus = Math.min(streakAfter, STREAK_BONUS_CAP_DAYS) * STREAK_BONUS_PER_DAY;
  return SESSION_BASE_XP + bonus;
}

export function emptyState(): GamificationState {
  return {
    xp: 0,
    totalSessions: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastSessionAt: null,
    achievements: [],
    weeklyChallengeProgress: 0,
  };
}

export function loadGamification(): GamificationState {
  if (typeof window === "undefined") return emptyState();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return emptyState();
  try {
    return { ...emptyState(), ...(JSON.parse(raw) as GamificationState) };
  } catch {
    return emptyState();
  }
}

export function saveGamification(state: GamificationState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Record a completed session and return the new state plus a list of
// newly-unlocked achievement ids so the UI can celebrate.
export function recordSession(
  prev: GamificationState,
  now: Date = new Date(),
): { next: GamificationState; newAchievements: string[] } {
  const last = prev.lastSessionAt ? new Date(prev.lastSessionAt) : null;
  const dayMs = 24 * 60 * 60 * 1000;
  let streak = prev.currentStreak;
  if (!last) {
    streak = 1;
  } else {
    const sameDay = sameLocalDay(last, now);
    const consecutive = !sameDay && now.getTime() - last.getTime() <= dayMs * 1.5;
    if (sameDay) {
      // Multiple sessions on the same day don't extend the streak; XP still accrues.
    } else if (consecutive) {
      streak += 1;
    } else {
      streak = 1;
    }
  }
  const xpEarned = xpForSession(streak);
  const totalSessions = prev.totalSessions + 1;
  const longestStreak = Math.max(prev.longestStreak, streak);

  // Reset weekly progress on a new ISO week, otherwise increment.
  const weekProgress = isSameIsoWeek(last, now)
    ? prev.weeklyChallengeProgress + 1
    : 1;

  const next: GamificationState = {
    xp: prev.xp + xpEarned,
    totalSessions,
    currentStreak: streak,
    longestStreak,
    lastSessionAt: now.toISOString(),
    achievements: [...prev.achievements],
    weeklyChallengeProgress: Math.min(weekProgress, 7),
  };

  // Achievement unlocks.
  const newOnes: string[] = [];
  for (const a of ACHIEVEMENTS) {
    if (next.achievements.includes(a.id)) continue;
    const u = a.unlock;
    let earned = false;
    if (u.kind === "streak") earned = streak >= u.days;
    else if (u.kind === "total_sessions") earned = totalSessions >= u.count;
    if (earned) {
      next.achievements.push(a.id);
      newOnes.push(a.id);
    }
  }
  return { next, newAchievements: newOnes };
}

// Award an event-based achievement (first share, first feedback, etc.).
export function awardEvent(
  prev: GamificationState,
  kind: "first_share" | "first_feedback" | "genetics_imported",
): { next: GamificationState; newAchievements: string[] } {
  const next = { ...prev, achievements: [...prev.achievements] };
  const newOnes: string[] = [];
  for (const a of ACHIEVEMENTS) {
    if (next.achievements.includes(a.id)) continue;
    if (a.unlock.kind === kind) {
      next.achievements.push(a.id);
      newOnes.push(a.id);
    }
  }
  return { next, newAchievements: newOnes };
}

export const WEEKLY_CHALLENGE_TARGET = 5;

function sameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameIsoWeek(a: Date | null, b: Date): boolean {
  if (!a) return false;
  const monday = (d: Date) => {
    const x = new Date(d);
    const day = (x.getDay() + 6) % 7;
    x.setHours(0, 0, 0, 0);
    x.setDate(x.getDate() - day);
    return x.getTime();
  };
  return monday(a) === monday(b);
}
