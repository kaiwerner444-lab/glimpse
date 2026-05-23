"use client";

import { useEffect, useMemo, useState } from "react";
import { Heart, MessageSquare, Sparkles, Send, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { BASELINE_TASKS } from "@/lib/session/baseline";
import { appendFeedback, loadFeedback } from "@/lib/feedback/storage";
import {
  RATING_LABELS,
  type ActivityFeedback,
  type FeedbackRating,
} from "@/lib/feedback/types";
import { cn } from "@/lib/utils";

const ALL_RATINGS: FeedbackRating[] = ["too_hard", "just_right", "too_easy"];

export function FeedbackModule() {
  const tasks = useMemo(() => BASELINE_TASKS.slice(0, 6), []);
  const [taskId, setTaskId] = useState<string>(tasks[0].id);
  const [rating, setRating] = useState<FeedbackRating | null>(null);
  const [bodyIssue, setBodyIssue] = useState(false);
  const [note, setNote] = useState("");
  const [recent, setRecent] = useState<ActivityFeedback[]>([]);
  const [justSubmitted, setJustSubmitted] = useState(false);

  useEffect(() => {
    setRecent(loadFeedback().slice(0, 3));
  }, []);

  const task = tasks.find((t) => t.id === taskId)!;

  const submit = () => {
    if (!rating) return;
    const entry: ActivityFeedback = {
      id: crypto.randomUUID(),
      taskId,
      taskTitle: task.title,
      rating,
      bodyIssueFlag: bodyIssue,
      note: note.trim() || undefined,
      submittedAt: new Date().toISOString(),
    };
    const next = appendFeedback(entry);
    setRecent(next.slice(0, 3));
    setRating(null);
    setBodyIssue(false);
    setNote("");
    setJustSubmitted(true);
    setTimeout(() => setJustSubmitted(false), 2400);
  };

  return (
    <section className="glimpse-card p-6">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-brand-500">
            How did that feel?
          </p>
          <h2 className="text-xl font-semibold text-ink mt-1">
            Rank a recent activity
          </h2>
        </div>
        <Heart className="h-5 w-5 text-sunrise-400" />
      </div>

      <p className="text-base text-ink-muted leading-relaxed mb-5">
        Your feedback teaches the system. If something is too hard on your body
        or doesn&apos;t fit your day, tell us — we&apos;ll adapt tomorrow&apos;s mix.
      </p>

      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink">Activity</span>
          <select
            value={taskId}
            onChange={(e) => setTaskId(e.target.value)}
            className="h-11 rounded-xl border border-black/10 bg-surface px-4 text-base text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-3 gap-2">
          {ALL_RATINGS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRating(r)}
              aria-pressed={rating === r}
              className={cn(
                "rounded-xl border px-3 py-3 text-sm font-medium transition text-center",
                rating === r
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-black/10 bg-surface text-ink hover:border-black/25",
              )}
            >
              {RATING_LABELS[r]}
            </button>
          ))}
        </div>

        <Checkbox
          checked={bodyIssue}
          onChange={setBodyIssue}
          label="There's a physical reason this was hard for me"
          hint="We'll tag this and avoid recommending similar movements until you tell us otherwise."
        />

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink inline-flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4 text-ink-muted" />
            Anything else? (optional)
          </span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="A quick note helps us understand context — fatigue, environment, anything."
            className="min-h-[88px] rounded-xl border border-black/10 bg-surface px-4 py-3 text-base text-ink placeholder:text-ink-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 resize-y"
          />
        </label>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm text-ink-muted inline-flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-sunrise-400" />
            We adapt within 24 hours.
          </p>
          <Button onClick={submit} disabled={!rating} className="gap-2">
            <Send className="h-4 w-4" />
            Submit feedback
          </Button>
        </div>

        {justSubmitted ? (
          <div className="rounded-xl bg-success/10 text-success px-4 py-3 flex items-center gap-2 animate-fade-up">
            <CheckCheck className="h-4 w-4" />
            <span className="text-sm font-medium">
              Got it. Tomorrow&apos;s session will reflect this.
            </span>
          </div>
        ) : null}

        {recent.length ? (
          <div className="mt-2 pt-4 border-t border-black/[0.06]">
            <p className="text-xs font-medium uppercase tracking-wider text-ink-subtle mb-2">
              Recent feedback
            </p>
            <ul className="space-y-2">
              {recent.map((f) => (
                <li
                  key={f.id}
                  className="flex items-start justify-between gap-3 text-sm"
                >
                  <span className="text-ink">{f.taskTitle}</span>
                  <span className="text-ink-muted">{RATING_LABELS[f.rating]}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
