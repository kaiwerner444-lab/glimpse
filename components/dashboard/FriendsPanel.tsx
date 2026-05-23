"use client";

import { useMemo, useState } from "react";
import { Users, UserPlus, Heart, Send, Sparkles, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { buildLeaderboard } from "@/lib/gamification/friends";
import { cn } from "@/lib/utils";
import type { FriendStanding } from "@/lib/gamification/types";

interface FriendsPanelProps {
  yourName: string;
  yourStreak: number;
  yourSessionsThisWeek: number;
  yourLevel: number;
}

const AVATAR_HUES = [
  "bg-sunrise-200 text-sunrise-500",
  "bg-brand-100 text-brand-600",
  "bg-success/15 text-success",
  "bg-warn/15 text-warn",
  "bg-brand-500 text-white",
];

export function FriendsPanel({
  yourName,
  yourStreak,
  yourSessionsThisWeek,
  yourLevel,
}: FriendsPanelProps) {
  const standings = useMemo(
    () =>
      buildLeaderboard({
        yourName,
        yourStreak,
        yourSessionsThisWeek,
        yourLevel,
      }),
    [yourName, yourStreak, yourSessionsThisWeek, yourLevel],
  );
  const [inviting, setInviting] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [encouraged, setEncouraged] = useState<string | null>(null);

  const onInvite = () => {
    if (!email.trim()) return;
    // v2: POST /api/invitations with { email } that creates a friendship
    // row in 'pending' state and emails a join link.
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setInviting(false);
      setEmail("");
    }, 1800);
  };

  const sendEncouragement = (id: string) => {
    setEncouraged(id);
    setTimeout(() => setEncouraged(null), 1800);
  };

  return (
    <section className="glimpse-card p-6">
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-brand-500">
            Your circle
          </p>
          <h2 className="text-xl font-semibold text-ink mt-1">
            Show up together
          </h2>
        </div>
        <div className="inline-flex items-center gap-1 text-xs text-ink-muted bg-brand-50 rounded-full px-2.5 py-1">
          <Users className="h-3.5 w-3.5" />
          Adherence only · never biomarkers
        </div>
      </div>

      <p className="text-base text-ink-muted leading-relaxed mb-5">
        You can see whether the people you trust are showing up. You can&apos;t
        see their actual signals — those are private, always. Use this to
        encourage each other, not compare bodies.
      </p>

      <ol className="space-y-2.5 mb-5">
        {standings.map((s, i) => (
          <FriendRow
            key={s.id}
            row={s}
            rank={i + 1}
            onEncourage={() => sendEncouragement(s.id)}
            justEncouraged={encouraged === s.id}
          />
        ))}
      </ol>

      {inviting ? (
        <div className="rounded-2xl border border-black/10 p-4 flex flex-col gap-3 animate-fade-up">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink inline-flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-ink-muted" />
              Invite by email
            </span>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="friend@example.com"
              disabled={sent}
            />
          </label>
          <div className="flex items-center gap-2">
            <Button onClick={onInvite} disabled={!email.trim() || sent} className="gap-2">
              {sent ? (
                <>
                  <Sparkles className="h-4 w-4" />
                  Invite sent
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send invite
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setInviting(false);
                setEmail("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="secondary"
          onClick={() => setInviting(true)}
          className="gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Invite someone
        </Button>
      )}
    </section>
  );
}

function FriendRow({
  row,
  rank,
  onEncourage,
  justEncouraged,
}: {
  row: FriendStanding;
  rank: number;
  onEncourage: () => void;
  justEncouraged: boolean;
}) {
  return (
    <li
      className={cn(
        "rounded-xl px-3 py-3 flex items-center gap-3",
        row.isYou
          ? "bg-brand-50 ring-1 ring-brand-500/30"
          : "bg-surface-alt",
      )}
    >
      <span className="text-sm font-semibold text-ink-muted tabular-nums w-5 text-center shrink-0">
        {rank}
      </span>
      <span
        className={cn(
          "h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0",
          AVATAR_HUES[row.avatarHue] ?? AVATAR_HUES[0],
        )}
      >
        {row.initials}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-base font-medium text-ink truncate">
            {row.name}
            {row.isYou ? (
              <span className="text-sm text-ink-muted font-normal"> · you</span>
            ) : null}
          </p>
          {row.microBadge ? (
            <span className="text-xs text-sunrise-500 font-medium">
              {row.microBadge}
            </span>
          ) : null}
        </div>
        <p className="text-xs text-ink-muted tabular-nums mt-0.5">
          <span className="font-semibold text-ink">{row.currentStreak}</span> day streak
          <span className="mx-1.5 text-ink-subtle">·</span>
          {row.sessionsThisWeek} this week
          <span className="mx-1.5 text-ink-subtle">·</span>
          Level {row.level}
        </p>
      </div>
      {!row.isYou ? (
        <button
          type="button"
          onClick={onEncourage}
          className={cn(
            "shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 h-8 text-xs font-medium transition",
            justEncouraged
              ? "bg-sunrise-100 text-sunrise-500"
              : "text-ink-muted hover:bg-black/[0.04] hover:text-ink",
          )}
          aria-label={`Send encouragement to ${row.name}`}
        >
          <Heart className={cn("h-3.5 w-3.5", justEncouraged && "fill-current")} />
          {justEncouraged ? "Sent" : "Cheer"}
        </button>
      ) : null}
    </li>
  );
}
