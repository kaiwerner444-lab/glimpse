import type { Achievement } from "./types";

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-step",
    title: "First step",
    body: "Completed your baseline session.",
    unlock: { kind: "total_sessions", count: 1 },
    order: 10,
  },
  {
    id: "three-day",
    title: "Three days in a row",
    body: "A small habit is forming.",
    unlock: { kind: "streak", days: 3 },
    order: 20,
  },
  {
    id: "one-week",
    title: "One steady week",
    body: "Seven sessions, every day. Your normal is starting to take shape.",
    unlock: { kind: "streak", days: 7 },
    order: 30,
  },
  {
    id: "thirty-day",
    title: "Thirty days",
    body: "A month of showing up — that's when patterns become real.",
    unlock: { kind: "streak", days: 30 },
    order: 40,
  },
  {
    id: "fifty-sessions",
    title: "Fifty sessions",
    body: "You've shown up fifty times. That's a lot of mornings.",
    unlock: { kind: "total_sessions", count: 50 },
    order: 50,
  },
  {
    id: "hundred-sessions",
    title: "One hundred sessions",
    body: "A real longitudinal record now exists.",
    unlock: { kind: "total_sessions", count: 100 },
    order: 60,
  },
  {
    id: "brave",
    title: "Brave",
    body: "Sent your first piece of feedback about how a task felt.",
    unlock: { kind: "first_feedback" },
    order: 70,
  },
  {
    id: "open",
    title: "Open hand",
    body: "Shared a read-only report with someone you trust.",
    unlock: { kind: "first_share" },
    order: 80,
  },
  {
    id: "genetics",
    title: "Genetics in",
    body: "Added your genetic data so signals can be weighted to you.",
    unlock: { kind: "genetics_imported" },
    order: 90,
  },
];

export function achievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
