"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MailCheck, KeyRound } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Field } from "@/components/ui/Field";
import {
  signIn,
  resendConfirmation,
  requestPasswordReset,
} from "@/lib/auth/mock-auth";

export default function SignInPage() {
  return (
    <div className="min-h-dvh bg-surface-alt flex flex-col">
      <header className="px-6 py-5 max-w-md w-full mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Home
        </Link>
        <Link href="/" aria-label="Glimpse home">
          <Logo showWordmark={false} />
        </Link>
      </header>

      <main className="flex-1 px-6 py-10 max-w-md w-full mx-auto animate-fade-up">
        <p className="text-sm font-medium uppercase tracking-wider text-brand-500 mb-2">
          Sign in
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-ink">
          Welcome back
        </h1>
        <p className="mt-3 text-base text-ink-muted leading-relaxed">
          Sign in to enable sharing and pick up where you left off.
        </p>

        <Suspense fallback={<SignInSkeleton />}>
          <SignInForm />
        </Suspense>
      </main>
    </div>
  );
}

function SignInForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const redirect = sp.get("redirect") ?? "/home";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [errorKind, setErrorKind] = useState<
    "unconfirmed_email" | "bad_credentials" | "other" | null
  >(null);
  const [submitting, setSubmitting] = useState(false);
  const [resentTo, setResentTo] = useState<string | null>(null);
  const [resetSentTo, setResetSentTo] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrorKind(null);
    setSubmitting(true);
    const res = await signIn(email.trim(), password);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error ?? "Sign in failed.");
      setErrorKind(res.kind ?? "other");
      return;
    }
    router.push(redirect);
  };

  const handleResend = async () => {
    const r = await resendConfirmation(email.trim());
    if (r.ok) setResentTo(email.trim());
    else setError(r.error ?? "Couldn't resend.");
  };

  const handleReset = async () => {
    if (!email.trim()) {
      setError("Enter your email above first, then click 'Send reset link'.");
      return;
    }
    const r = await requestPasswordReset(email.trim());
    if (r.ok) setResetSentTo(email.trim());
    else setError(r.error ?? "Couldn't send reset link.");
  };

  return (
    <form
      onSubmit={onSubmit}
      className="mt-8 glimpse-card p-6 flex flex-col gap-4"
    >
      <Field label="Email" htmlFor="signin-email" required>
        <Input
          id="signin-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
      </Field>
      <Field label="Password" htmlFor="signin-password" required>
        <Input
          id="signin-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </Field>

      {error ? (
        <div className="rounded-xl bg-alert/10 text-alert text-sm px-3 py-2.5 leading-relaxed">
          {errorKind === "unconfirmed_email" ? (
            <>
              Your email isn&apos;t confirmed yet. Check your inbox for the
              verification email — or click below to resend it.
            </>
          ) : errorKind === "bad_credentials" ? (
            <>
              That email and password don&apos;t match a verified account.
              Two common reasons:
              <ul className="mt-1.5 ml-4 list-disc space-y-0.5">
                <li>Your email isn&apos;t confirmed yet (check inbox)</li>
                <li>The password is different from what you typed at signup</li>
              </ul>
            </>
          ) : (
            error
          )}
        </div>
      ) : null}

      {resentTo ? (
        <div className="rounded-xl bg-success/10 text-success text-sm px-3 py-2.5 inline-flex items-center gap-2">
          <MailCheck className="h-4 w-4" />
          Confirmation email sent to {resentTo}
        </div>
      ) : null}

      {resetSentTo ? (
        <div className="rounded-xl bg-success/10 text-success text-sm px-3 py-2.5 inline-flex items-center gap-2">
          <KeyRound className="h-4 w-4" />
          Password reset link sent to {resetSentTo}
        </div>
      ) : null}

      <Button type="submit" disabled={submitting} size="lg">
        {submitting ? "Signing in…" : "Sign in"}
      </Button>

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={handleReset}
          className="text-brand-500 hover:text-brand-600 font-medium"
        >
          Forgot password?
        </button>
        <button
          type="button"
          onClick={handleResend}
          disabled={!email.trim()}
          className="text-brand-500 hover:text-brand-600 font-medium disabled:opacity-40"
        >
          Resend confirmation
        </button>
      </div>

      <p className="text-sm text-ink-muted text-center pt-2 border-t border-black/[0.06]">
        New here?{" "}
        <Link
          href="/onboarding/account"
          className="text-brand-500 font-medium"
        >
          Start onboarding
        </Link>
      </p>
    </form>
  );
}

function SignInSkeleton() {
  return (
    <div className="mt-8 glimpse-card p-6">
      <div className="h-3 w-16 bg-black/5 rounded mb-3" />
      <div className="h-11 w-full bg-black/5 rounded mb-5" />
      <div className="h-3 w-20 bg-black/5 rounded mb-3" />
      <div className="h-11 w-full bg-black/5 rounded mb-5" />
      <div className="h-12 w-full bg-black/5 rounded" />
    </div>
  );
}
