// Friends and leaderboard data. For v1 the leaderboard is rendered from
// a synthetic but plausible set of "circle" members so users can feel
// what social adherence looks like. Real friend backend (invites,
// acceptance, mutual visibility opt-in) lands in v2 — schema sketch:
//
//   create table friendships (
//     id uuid primary key default gen_random_uuid(),
//     requester_id uuid references auth.users(id) on delete cascade,
//     recipient_id uuid references auth.users(id) on delete cascade,
//     status text check (status in ('pending','accepted','declined','blocked')),
//     accepted_at timestamptz,
//     created_at timestamptz default now(),
//     unique (requester_id, recipient_id)
//   );
//
// Adherence is the only social-visible signal. Biomarker scores never
// appear here, by policy.

import type { FriendStanding } from "./types";

const SYNTHETIC_FRIENDS: Omit<FriendStanding, "isYou">[] = [
  {
    id: "f1",
    name: "Mom",
    initials: "M",
    avatarHue: 0,
    currentStreak: 12,
    sessionsThisWeek: 6,
    level: 3,
    microBadge: "Hit Steady ✦",
  },
  {
    id: "f2",
    name: "Dr. Patel",
    initials: "DP",
    avatarHue: 1,
    currentStreak: 21,
    sessionsThisWeek: 5,
    level: 4,
  },
  {
    id: "f3",
    name: "Alex",
    initials: "A",
    avatarHue: 2,
    currentStreak: 4,
    sessionsThisWeek: 4,
    level: 1,
    microBadge: "3-day streak just now",
  },
  {
    id: "f4",
    name: "Jordan",
    initials: "J",
    avatarHue: 3,
    currentStreak: 8,
    sessionsThisWeek: 5,
    level: 2,
  },
];

interface BuildLeaderboardInput {
  yourName: string;
  yourStreak: number;
  yourSessionsThisWeek: number;
  yourLevel: number;
}

export function buildLeaderboard({
  yourName,
  yourStreak,
  yourSessionsThisWeek,
  yourLevel,
}: BuildLeaderboardInput): FriendStanding[] {
  const initials = yourName
    .split(" ")
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2) || "Y";

  const you: FriendStanding = {
    id: "you",
    name: yourName || "You",
    initials,
    avatarHue: 4,
    currentStreak: yourStreak,
    sessionsThisWeek: yourSessionsThisWeek,
    level: yourLevel,
    isYou: true,
  };
  return [...SYNTHETIC_FRIENDS, you].sort(
    (a, b) =>
      b.currentStreak - a.currentStreak ||
      b.sessionsThisWeek - a.sessionsThisWeek,
  );
}
