"use client";

import { useEffect, useState } from "react";
import {
  Share2,
  Plus,
  Copy,
  CheckCheck,
  Stethoscope,
  Users,
  ShieldOff,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  createShare,
  listShares,
  revokeShare,
  shareUrl,
  type ShareRecord,
  type ShareScope,
} from "@/lib/sharing/shares";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function ShareModule() {
  const [shares, setShares] = useState<ShareRecord[]>([]);
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");
  const [email, setEmail] = useState("");
  const [scope, setScope] = useState<ShareScope>("reports");
  const [recentCopiedId, setRecentCopiedId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    let cancelled = false;
    listShares().then((rows) => {
      if (!cancelled) {
        setShares(rows);
        setHydrated(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const submit = async () => {
    if (!label.trim()) return;
    const created = await createShare({
      recipientLabel: label.trim(),
      recipientEmail: email.trim() || undefined,
      scope,
      expiresInDays: 14,
    });
    if (created) {
      setShares((prev) => [created, ...prev]);
      setLabel("");
      setEmail("");
      setScope("reports");
      setAdding(false);
    }
  };

  const handleCopy = async (s: ShareRecord) => {
    const url = shareUrl(s.token);
    try {
      await navigator.clipboard.writeText(url);
      setRecentCopiedId(s.id);
      setTimeout(() => setRecentCopiedId(null), 1800);
    } catch {
      // Fallback for older browsers — show the URL in a prompt.
      window.prompt("Copy this share link:", url);
    }
  };

  const handleRevoke = async (s: ShareRecord) => {
    const ok = await revokeShare(s.id);
    if (ok) {
      setShares((prev) =>
        prev.map((row) =>
          row.id === s.id
            ? { ...row, revokedAt: new Date().toISOString() }
            : row,
        ),
      );
    }
  };

  return (
    <section className="glimpse-card p-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-brand-500">
            Share with someone
          </p>
          <h2 className="text-xl font-semibold text-ink mt-1">
            Doctors and family
          </h2>
        </div>
        <Share2 className="h-5 w-5 text-brand-500" />
      </div>

      <p className="text-base text-ink-muted leading-relaxed mb-5">
        Send a read-only link to a clinician or family member. Links expire
        after 14 days, can be revoked anytime, and never include raw video
        unless you explicitly choose to.
      </p>

      {!configured ? (
        <div className="rounded-xl bg-warn/10 text-ink-muted text-sm px-4 py-3 mb-4">
          Connect Supabase (set <code className="text-ink">NEXT_PUBLIC_SUPABASE_URL</code> and the anon key in Vercel) to enable sharing. Until then this panel is read-only.
        </div>
      ) : null}

      {adding ? (
        <div className="rounded-2xl border border-black/10 p-4 mb-5 flex flex-col gap-3 animate-fade-up">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink">Who's this for?</span>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Dr. Patel · Mom · Family group"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink">
              Email (optional)
            </span>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Used so they know it's from you"
            />
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setScope("reports")}
              className={cn(
                "rounded-xl border px-4 py-3 text-left transition",
                scope === "reports"
                  ? "border-brand-500 bg-brand-50"
                  : "border-black/10 bg-surface hover:border-black/25",
              )}
            >
              <p className="text-sm font-semibold text-ink">Reports only</p>
              <p className="text-xs text-ink-muted mt-0.5">
                Weekly and monthly summaries. No video.
              </p>
            </button>
            <button
              type="button"
              onClick={() => setScope("reports_and_videos")}
              className={cn(
                "rounded-xl border px-4 py-3 text-left transition",
                scope === "reports_and_videos"
                  ? "border-brand-500 bg-brand-50"
                  : "border-black/10 bg-surface hover:border-black/25",
              )}
            >
              <p className="text-sm font-semibold text-ink">Reports + clips</p>
              <p className="text-xs text-ink-muted mt-0.5">
                Adds signed video links. Use for clinical review.
              </p>
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Button onClick={submit} disabled={!label.trim() || !configured}>
              Create link
            </Button>
            <Button variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="secondary"
          onClick={() => setAdding(true)}
          disabled={!configured}
          className="gap-2 mb-5"
        >
          <Plus className="h-4 w-4" />
          New share link
        </Button>
      )}

      {hydrated && shares.length > 0 ? (
        <ul className="space-y-2">
          {shares.map((s) => {
            const revoked = !!s.revokedAt;
            const expired = !revoked && new Date(s.expiresAt) < new Date();
            const active = !revoked && !expired;
            return (
              <li
                key={s.id}
                className={cn(
                  "rounded-xl border p-4 flex items-start gap-3",
                  active
                    ? "border-black/10 bg-surface"
                    : "border-black/10 bg-surface-alt opacity-70",
                )}
              >
                <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center shrink-0">
                  {s.scope === "reports_and_videos" ? (
                    <Stethoscope className="h-5 w-5" />
                  ) : (
                    <Users className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium text-ink truncate">
                    {s.recipientLabel}
                  </p>
                  <p className="text-xs text-ink-muted mt-0.5">
                    {revoked ? (
                      "Revoked"
                    ) : expired ? (
                      "Expired"
                    ) : (
                      <>
                        Expires {new Date(s.expiresAt).toLocaleDateString()}
                        <span className="mx-1.5 text-ink-subtle">·</span>
                        <Eye className="inline h-3 w-3 mr-0.5" />
                        {s.viewCount} {s.viewCount === 1 ? "view" : "views"}
                      </>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {active ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleCopy(s)}
                        className="inline-flex items-center gap-1 text-sm font-medium px-2.5 h-8 rounded-lg text-ink hover:bg-black/[0.04]"
                      >
                        {recentCopiedId === s.id ? (
                          <>
                            <CheckCheck className="h-3.5 w-3.5 text-success" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            Copy
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRevoke(s)}
                        className="inline-flex items-center gap-1 text-sm font-medium px-2.5 h-8 rounded-lg text-ink-muted hover:text-alert hover:bg-alert/10"
                      >
                        <ShieldOff className="h-3.5 w-3.5" />
                        Revoke
                      </button>
                    </>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      ) : hydrated ? (
        <p className="text-sm text-ink-muted">
          No active shares. Create one when you're ready.
        </p>
      ) : null}
    </section>
  );
}
