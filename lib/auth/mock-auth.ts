// Auth layer. Hybrid: writes localStorage as the source of truth in the
// browser, and mirrors to Supabase Auth + the `accounts` table when env
// vars are present. Falls back gracefully when they aren't so the app
// builds and runs in local-only mode for previews.

import type {
  Account,
  Sex,
  FitzpatrickEthnicityHint,
  UnitSystem,
  HandDominance,
} from "@/lib/types";
import { supabase } from "@/lib/supabase/client";

const STORAGE_KEY = "glimpse.account";

export interface SignUpInput {
  email: string;
  password: string;
  dateOfBirth: string;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  unitSystem: UnitSystem;
  handDominance?: HandDominance;
  primaryLanguage?: string;
  ethnicityHint: FitzpatrickEthnicityHint;
  hipaaConsent: boolean;
  gdprConsent: boolean;
}

export async function signUp(input: SignUpInput): Promise<Account> {
  let id = crypto.randomUUID();

  const sb = supabase();
  if (sb) {
    // Best-effort Supabase signup. If email confirmation is on in the
    // Supabase project, the session will be null until the user confirms.
    // We still proceed locally so the onboarding flow isn't blocked.
    const { data, error } = await sb.auth.signUp({
      email: input.email,
      password: input.password,
    });
    if (!error && data.user) {
      id = data.user.id;
      // Mirror demographic data to the accounts table. RLS allows this
      // because auth.uid() now equals data.user.id.
      await sb.from("accounts").upsert({
        id,
        email: input.email,
        date_of_birth: input.dateOfBirth,
        sex: input.sex,
        height_cm: input.heightCm,
        weight_kg: input.weightKg,
        ethnicity_hint: input.ethnicityHint,
        hipaa_consent: input.hipaaConsent,
        gdpr_consent: input.gdprConsent,
      });
    }
  }

  const account: Account = {
    id,
    email: input.email,
    dateOfBirth: input.dateOfBirth,
    sex: input.sex,
    heightCm: input.heightCm,
    weightKg: input.weightKg,
    unitSystem: input.unitSystem,
    handDominance: input.handDominance,
    primaryLanguage: input.primaryLanguage,
    ethnicityHint: input.ethnicityHint,
    hipaaConsent: input.hipaaConsent,
    gdprConsent: input.gdprConsent,
    createdAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
  }
  return account;
}

export interface SignInResult {
  ok: boolean;
  error?: string;
  // Surface specific cases so the UI can offer a recovery action.
  kind?: "unconfirmed_email" | "bad_credentials" | "other";
}

export async function signIn(
  email: string,
  password: string,
): Promise<SignInResult> {
  const sb = supabase();
  if (!sb) {
    return { ok: false, error: "Supabase is not configured.", kind: "other" };
  }
  const { data, error } = await sb.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.session) {
    const msg = error?.message ?? "Sign in failed.";
    const lower = msg.toLowerCase();
    let kind: SignInResult["kind"] = "other";
    if (lower.includes("confirm")) kind = "unconfirmed_email";
    else if (lower.includes("invalid login") || lower.includes("invalid credentials"))
      kind = "bad_credentials";
    return { ok: false, error: msg, kind };
  }
  return { ok: true };
}

export async function resendConfirmation(email: string): Promise<{ ok: boolean; error?: string }> {
  const sb = supabase();
  if (!sb) return { ok: false, error: "Supabase is not configured." };
  const { error } = await sb.auth.resend({ type: "signup", email });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function requestPasswordReset(
  email: string,
): Promise<{ ok: boolean; error?: string }> {
  const sb = supabase();
  if (!sb) return { ok: false, error: "Supabase is not configured." };
  const redirectTo =
    typeof window !== "undefined" ? `${window.location.origin}/auth/signin` : undefined;
  const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export function getCurrentAccount(): Account | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as Account) : null;
}

export async function signOut(): Promise<void> {
  const sb = supabase();
  if (sb) {
    await sb.auth.signOut();
  }
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}
