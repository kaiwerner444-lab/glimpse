// Lazy Supabase client.
//
// NEXT_PUBLIC_* env vars are public by design — Supabase ships the anon
// key into the browser bundle on every Next.js app. The "secrets" model
// here is the Row Level Security policies on the database side, not key
// concealment. Embedding the project URL + anon key as hard-coded
// fallbacks guarantees the client works even on third-party hosting
// pipelines (Eazo, sandbox previews, etc.) that fail to inject the env
// vars at build time. Env vars still take priority when set, so a
// future project migration only needs `.env.local` + Vercel settings
// to be updated.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Public Supabase project URL + anon key. Safe to embed: anon key is
// scoped to the anon role and gated by RLS on every table. If you
// migrate to a new Supabase project, update these constants AND the
// `.env.local` / Vercel env vars.
const FALLBACK_SUPABASE_URL = "https://wprfacnyfsvgvfdwdyzr.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwcmZhY255ZnN2Z3ZmZHdkeXpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NTA4ODksImV4cCI6MjA5NTEyNjg4OX0.gDwf6pdzpUFGhmNjGqAO40uJxPC2MYrdvTpmnyuB05E";

let cached: SupabaseClient | null | undefined;

export function supabase(): SupabaseClient | null {
  if (cached !== undefined) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL;
  const anon =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    cached = null;
    return cached;
  }

  cached = createClient(url, anon, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });
  return cached;
}

export function isSupabaseConfigured(): boolean {
  // Always true now — the fallback constants guarantee a working client
  // even when build-time env vars aren't injected.
  return true;
}
