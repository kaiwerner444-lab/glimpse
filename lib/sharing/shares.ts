// Shares: read-only, time-bound links that let a clinician or family
// member view a summary report. RLS scopes inserts/reads to the owning
// user. Recipients land on /share/[token] which queries by token only —
// the token IS the auth credential, so it must be cryptographically
// random and large (32 bytes base64url).

"use client";

import { supabase } from "@/lib/supabase/client";

export type ShareScope = "reports" | "reports_and_videos";

export interface ShareRecord {
  id: string;
  token: string;
  recipientLabel: string;
  recipientEmail: string | null;
  scope: ShareScope;
  expiresAt: string;
  revokedAt: string | null;
  lastViewedAt: string | null;
  viewCount: number;
  createdAt: string;
}

interface CreateShareInput {
  recipientLabel: string;
  recipientEmail?: string;
  scope: ShareScope;
  expiresInDays: number;
}

function generateToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function createShare(
  input: CreateShareInput,
): Promise<ShareRecord | null> {
  const sb = supabase();
  if (!sb) return null;
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;

  const token = generateToken();
  const expiresAt = new Date(
    Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data, error } = await sb
    .from("shares")
    .insert({
      owner_id: user.id,
      token,
      recipient_label: input.recipientLabel,
      recipient_email: input.recipientEmail ?? null,
      scope: input.scope,
      expires_at: expiresAt,
    })
    .select()
    .single();
  if (error || !data) return null;
  return rowToRecord(data);
}

export async function listShares(): Promise<ShareRecord[]> {
  const sb = supabase();
  if (!sb) return [];
  const { data } = await sb
    .from("shares")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []).map(rowToRecord);
}

export async function revokeShare(id: string): Promise<boolean> {
  const sb = supabase();
  if (!sb) return false;
  const { error } = await sb
    .from("shares")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", id);
  return !error;
}

export function shareUrl(token: string, origin?: string): string {
  const base =
    origin ??
    (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/share/${token}`;
}

interface RawShareRow {
  id: string;
  token: string;
  recipient_label: string | null;
  recipient_email: string | null;
  scope: ShareScope;
  expires_at: string;
  revoked_at: string | null;
  last_viewed_at: string | null;
  view_count: number;
  created_at: string;
}

function rowToRecord(row: RawShareRow): ShareRecord {
  return {
    id: row.id,
    token: row.token,
    recipientLabel: row.recipient_label ?? "Recipient",
    recipientEmail: row.recipient_email,
    scope: row.scope,
    expiresAt: row.expires_at,
    revokedAt: row.revoked_at,
    lastViewedAt: row.last_viewed_at,
    viewCount: row.view_count,
    createdAt: row.created_at,
  };
}
