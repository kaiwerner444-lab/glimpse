"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Field } from "@/components/ui/Field";
import { signIn } from "@/lib/auth/mock-auth";

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
        <Logo showWordmark={false} />
      </header>

      <main className="flex-1 px-6 py-10 max-w-md w-full mx-auto animate-fade-up">
        <p className="text-sm font-medium uppercase tracking-wider text-brand-500 mb-2">
          Sign in
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-ink">
          Welcome back
        </h1>
        <p className="mt-3 text-base text-ink-muted leading-relaxed">
          Sign in to enable sharing and pick up where you left off. If you
          haven&apos;t verified your email yet, check your inbox first.
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
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = await signIn(email.trim(), password);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error ?? "Sign in failed.");
      return;
    }
    router.push(redirect);
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
        <div className="rounded-xl bg-alert/10 text-alert text-sm px-3 py-2.5">
          {error}
        </div>
      ) : null}
      <Button type="submit" disabled={submitting} size="lg">
        {submitting ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-sm text-ink-muted text-center">
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
