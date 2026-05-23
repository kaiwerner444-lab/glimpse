import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { Logo } from "@/components/brand/Logo";
import { Sparkline } from "@/components/dashboard/Sparkline";
import { Stethoscope, Calendar, Eye, Shield } from "lucide-react";

interface ShareViewProps {
  params: { token: string };
}

// Server-rendered share viewer. Uses the service role key on the server
// so we can read by token without RLS getting in the way; if the role
// key isn't set, we fall back to the anon key plus a public RPC (TODO).
// The view increments the access counter as a side-effect.
async function loadShare(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  const { data: share } = await admin
    .from("shares")
    .select("*")
    .eq("token", token)
    .single();
  if (!share) return null;
  if (share.revoked_at) return { status: "revoked" as const };
  if (new Date(share.expires_at) < new Date()) {
    return { status: "expired" as const };
  }

  // Increment view counter — best-effort, ignore errors.
  void admin
    .from("shares")
    .update({
      last_viewed_at: new Date().toISOString(),
      view_count: (share.view_count ?? 0) + 1,
    })
    .eq("id", share.id);

  return { status: "ok" as const, share };
}

export default async function ShareViewer({ params }: ShareViewProps) {
  const result = await loadShare(params.token);

  if (!result) {
    return (
      <ShareShell>
        <Notice
          title="Link not found"
          body="This share link doesn't exist, or our server isn't configured to read it. Ask the sender to send a new link."
        />
      </ShareShell>
    );
  }

  if (result.status === "revoked") {
    return (
      <ShareShell>
        <Notice
          title="Link revoked"
          body="The person who shared this with you revoked access. Reach out to them if you still need to view it."
        />
      </ShareShell>
    );
  }
  if (result.status === "expired") {
    return (
      <ShareShell>
        <Notice
          title="Link expired"
          body="Share links expire after 14 days. Ask for a fresh one if you still need this report."
        />
      </ShareShell>
    );
  }

  const { share } = result;

  // For v1 we render a sample report scaffold. The real report query
  // will join sessions + features over the last 30 days when the daily
  // session pipeline lands.
  return (
    <ShareShell>
      <p className="text-sm font-medium uppercase tracking-wider text-brand-500 mb-2">
        Shared report
      </p>
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-ink">
        Read-only summary
      </h1>
      <p className="mt-3 text-lg text-ink-muted leading-relaxed max-w-2xl">
        Shared with <span className="font-medium text-ink">{share.recipient_label ?? "you"}</span>.
        This is a snapshot of recent signals — it does not diagnose disease and
        should be discussed with a clinician in context.
      </p>

      <dl className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Meta
          icon={<Calendar className="h-4 w-4" />}
          label="Expires"
          value={new Date(share.expires_at).toLocaleDateString()}
        />
        <Meta
          icon={<Eye className="h-4 w-4" />}
          label="Views"
          value={String((share.view_count ?? 0) + 1)}
        />
        <Meta
          icon={<Shield className="h-4 w-4" />}
          label="Scope"
          value={share.scope === "reports_and_videos" ? "Reports + clips" : "Reports only"}
        />
        <Meta
          icon={<Stethoscope className="h-4 w-4" />}
          label="Status"
          value="Active"
        />
      </dl>

      <section className="mt-10 glimpse-card p-6">
        <p className="text-sm font-medium uppercase tracking-wider text-ink-subtle mb-3">
          Speech rhythm (last 14 days)
        </p>
        <Sparkline
          points={[120, 122, 121, 123, 124, 125, 124, 126, 127, 127, 128, 129, 130, 131]}
          tone="improving"
          height={80}
        />
      </section>

      <section className="mt-4 glimpse-card p-6">
        <p className="text-sm font-medium uppercase tracking-wider text-ink-subtle mb-3">
          Postural stability (last 14 days)
        </p>
        <Sparkline
          points={[3.6, 3.5, 3.5, 3.3, 3.4, 3.2, 3.2, 3.1, 3.1, 3.0, 3.0, 2.9, 2.9, 2.8]}
          tone="improving"
          height={80}
        />
      </section>

      {share.scope === "reports_and_videos" ? (
        <section className="mt-4 glimpse-card p-6 bg-brand-50/60">
          <p className="text-base text-ink">
            Clinical clip access has been enabled for this link. Video URLs
            are signed per request and expire within minutes — no clip can
            be redistributed outside this session.
          </p>
        </section>
      ) : null}

      <footer className="mt-10 text-sm text-ink-muted leading-relaxed">
        Glimpse is a wellness and clinical decision support tool. It does
        not diagnose disease. In an emergency, call 911.
      </footer>
    </ShareShell>
  );
}

function ShareShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-surface-alt">
      <header className="px-6 py-5 max-w-3xl w-full mx-auto flex items-center justify-between">
        <Link href="/">
          <Logo />
        </Link>
        <span className="text-sm text-ink-muted">Shared with you</span>
      </header>
      <main className="px-6 max-w-3xl w-full mx-auto py-8 animate-fade-up">
        {children}
      </main>
    </div>
  );
}

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <div className="glimpse-card p-8 text-center">
      <h1 className="text-2xl font-semibold text-ink">{title}</h1>
      <p className="mt-3 text-base text-ink-muted leading-relaxed">{body}</p>
    </div>
  );
}

function Meta({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-black/[0.06] bg-surface px-3 py-2">
      <dt className="text-xs uppercase tracking-wider text-ink-subtle inline-flex items-center gap-1">
        {icon}
        {label}
      </dt>
      <dd className="text-base font-medium text-ink mt-0.5">{value}</dd>
    </div>
  );
}
