// Gamification model. Strictly adherence-based — we never gamify
// biomarkers, only showing up.

export interface GamificationState {
  xp: number;
  totalSessions: number;
  currentStreak: number;
  longestStreak: number;
  lastSessionAt: string | null;
  achievements: string[]; // ids of unlocked achievements
  weeklyChallengeProgress: number; // sessions completed this week
  // Streak freeze — Duolingo-style retention mechanic. Research (Duolingo
  // 2021 disclosures, broadly: self-determination + loss-aversion-buffer)
  // shows allowing a small number of forgiven days substantially raises
  // long-term retention without raising anxiety. We grant 2 per calendar
  // month, refilled on the 1st.
  streakFreezesAvailable: number;
  streakFreezesUsedThisMonth: number;
  streakFreezeMonth: string | null; // "YYYY-MM" the count is scoped to
  // Habit pairing (Fogg / Wendy Wood) — anchor the daily ritual to an
  // existing habit. Stored verbatim so reminders read naturally:
  // "After your {habitAnchor}, take five minutes for Glimpse."
  habitAnchor: string | null;
}

export interface Achievement {
  id: string;
  title: string;
  body: string;
  // What triggers it. The state.ts unlock checker reads these.
  unlock:
    | { kind: "streak"; days: number }
    | { kind: "total_sessions"; count: number }
    | { kind: "first_share" }
    | { kind: "first_feedback" }
    | { kind: "genetics_imported" };
  // Sort order in the achievements grid.
  order: number;
}

export interface LevelInfo {
  level: number;
  // Min XP to reach this level.
  minXp: number;
  // Min XP to reach the next level (for progress bar).
  nextXp: number;
  // Display name. Keep them gentle — never "Champion" or "Elite".
  title: string;
}

export interface FriendStanding {
  id: string;
  name: string;
  initials: string;
  // Display palette index for the avatar circle, 0..4.
  avatarHue: number;
  currentStreak: number;
  sessionsThisWeek: number;
  level: number;
  // True when this row is the current user — so the dashboard can highlight it.
  isYou?: boolean;
  // Optional badge: "3-day streak just now!" / "Hit Level 4"
  microBadge?: string;
}
