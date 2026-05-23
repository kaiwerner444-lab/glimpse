// Local activity feedback store. Mirrors to Supabase in v2 (table:
// `activity_feedback`, RLS scoped to auth.uid()) — same pattern as
// onboarding. v1 keeps everything in localStorage so the UX of submitting
// and seeing the entry update is real, even without a backend.

import type { ActivityFeedback } from "./types";

const STORAGE_KEY = "glimpse.feedback";

export function loadFeedback(): ActivityFeedback[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ActivityFeedback[]) : [];
  } catch {
    return [];
  }
}

export function saveFeedback(items: ActivityFeedback[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function appendFeedback(entry: ActivityFeedback): ActivityFeedback[] {
  const next = [entry, ...loadFeedback()].slice(0, 50);
  saveFeedback(next);
  return next;
}
