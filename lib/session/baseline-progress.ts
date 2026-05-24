// Resume-in-progress baseline. The baseline assessment is 10–15 min
// of tasks; closing the tab partway through used to lose everything.
// We persist task-by-task to localStorage so the user can pick up
// where they left off, including the already-captured TaskResults
// (scores, transcripts, interaction data) so the final session record
// is identical to a single-sitting baseline.

import type { TaskResult } from "./types";

const KEY = "glimpse:baseline:in-progress";

export interface BaselineProgress {
  // IDs of tasks already completed (or skipped) — used to fast-forward
  // the SessionRunner past them on resume.
  completedTaskIds: string[];
  // Full TaskResult payloads for already-finished tasks, so the final
  // saveSessionRecord call has the same shape as a single-sitting run.
  results: TaskResult[];
  // When the baseline was first started. Drives the "Started 12 min ago"
  // copy on the resume card.
  startedAt: string;
}

export function saveBaselineProgress(progress: BaselineProgress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    // localStorage may be unavailable (private mode, quota). Failing
    // silently is fine — worst case the user can't resume.
  }
}

export function loadBaselineProgress(): BaselineProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BaselineProgress;
    if (
      !parsed ||
      !Array.isArray(parsed.completedTaskIds) ||
      !Array.isArray(parsed.results) ||
      typeof parsed.startedAt !== "string"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearBaselineProgress(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
