// Mock authentication layer. Swap out for Clerk by replacing this module —
// the rest of the app only depends on the exported function signatures.

import type { Account, Sex, FitzpatrickEthnicityHint } from "@/lib/types";

const STORAGE_KEY = "glimpse.account";

export interface SignUpInput {
  email: string;
  password: string; // unused in mock; here to keep the shape stable
  dateOfBirth: string;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  ethnicityHint: FitzpatrickEthnicityHint;
  hipaaConsent: boolean;
  gdprConsent: boolean;
}

export function signUp(input: SignUpInput): Account {
  const account: Account = {
    id: crypto.randomUUID(),
    email: input.email,
    dateOfBirth: input.dateOfBirth,
    sex: input.sex,
    heightCm: input.heightCm,
    weightKg: input.weightKg,
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

export function getCurrentAccount(): Account | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as Account) : null;
}

export function signOut(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
