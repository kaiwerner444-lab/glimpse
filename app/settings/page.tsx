"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Shield,
  Glasses,
  Bell,
  Download,
  Trash2,
  LogOut,
  Info,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Field } from "@/components/ui/Field";
import { Checkbox } from "@/components/ui/Checkbox";
import { loadOnboarding, clearOnboarding } from "@/lib/db/mock-db";
import { signOut } from "@/lib/auth/mock-auth";
import type { OnboardingState } from "@/lib/types";

export default function SettingsPage() {
  const router = useRouter();
  const [state, setState] = useState<OnboardingState | null>(null);
  const [reminders, setReminders] = useState(true);
  const [retainRaw, setRetainRaw] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  useEffect(() => {
    setState(loadOnboarding());
  }, []);

  const onSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const onExport = () => {
    if (!state) return;
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `glimpse-data-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const onDelete = async () => {
    if (deleteConfirm !== "DELETE") return;
    setDeleting(true);
    clearOnboarding();
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("glimpse.gamification");
      window.localStorage.removeItem("glimpse.feedback");
      window.localStorage.removeItem("glimpse.account");
    }
    await signOut();
    router.push("/");
  };

  return (
    <div className="min-h-dvh bg-surface-alt">
      <header className="px-4 sm:px-6 lg:px-8 max-w-3xl w-full mx-auto py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/home"
            className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <span className="text-ink-subtle">·</span>
          <Logo showWordmark={false} />
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 max-w-3xl w-full mx-auto py-6 sm:py-10 flex flex-col gap-8">
        <section className="animate-stagger-up">
          <p className="text-sm font-medium uppercase tracking-wider text-brand-500 mb-2">
            Settings
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-ink">
            Your account and data
          </h1>
        </section>

        {/* Profile */}
        <SettingsSection
          icon={<User className="h-5 w-5" />}
          title="Profile"
          subtitle="The basics you provided during onboarding."
          delay={60}
        >
          {state?.account ? (
            <div className="space-y-4">
              <Field label="Email">
                <Input value={state.account.email} readOnly disabled />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Date of birth">
                  <Input value={state.account.dateOfBirth} readOnly disabled />
                </Field>
                <Field label="Biological sex">
                  <Input value={state.account.sex} readOnly disabled />
                </Field>
              </div>
              <p className="text-xs text-ink-muted">
                Profile editing lands in v2. For now, account details can be
                updated by signing in fresh.
              </p>
            </div>
          ) : (
            <p className="text-sm text-ink-muted">
              No profile data found. Complete onboarding first.
            </p>
          )}
        </SettingsSection>

        {/* Hardware */}
        <SettingsSection
          icon={<Glasses className="h-5 w-5" />}
          title="Hardware"
          subtitle="Glasses pairing and recording devices."
          delay={100}
        >
          <div className="rounded-xl border border-black/[0.06] bg-surface-alt p-4 flex items-center gap-3">
            {state?.glasses?.mode === "ray_ban_meta" ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                <div>
                  <p className="text-base font-medium text-ink">
                    Meta Ray Ban
                  </p>
                  <p className="text-sm text-ink-muted">
                    Paired during onboarding · Bluetooth + camera + IMU
                  </p>
                </div>
              </>
            ) : state?.glasses?.mode === "phone_fallback" ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                <div>
                  <p className="text-base font-medium text-ink">Phone fallback</p>
                  <p className="text-sm text-ink-muted">
                    Using your device's front camera during sessions.
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-warn shrink-0" />
                <div>
                  <p className="text-base font-medium text-ink">
                    No hardware paired
                  </p>
                  <p className="text-sm text-ink-muted">
                    Run a daily session — we'll request camera access then.
                  </p>
                </div>
              </>
            )}
          </div>
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection
          icon={<Bell className="h-5 w-5" />}
          title="Notifications"
          subtitle="Gentle reminders, never naggy."
          delay={140}
        >
          <Checkbox
            checked={reminders}
            onChange={setReminders}
            label="Send me a gentle morning reminder"
            hint="One notification a day, around your usual session time. Never more than that."
          />
        </SettingsSection>

        {/* Privacy & data */}
        <SettingsSection
          icon={<Shield className="h-5 w-5" />}
          title="Privacy & data"
          subtitle="HIPAA-aligned retention. You're always in control."
          delay={180}
        >
          <div className="space-y-4">
            <div className="rounded-xl bg-brand-50/60 p-4">
              <p className="text-sm font-medium text-brand-700">
                Consent status
              </p>
              <ul className="mt-2 space-y-1 text-sm text-ink">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  HIPAA consent · accepted at onboarding
                </li>
                {state?.account?.gdprConsent ? (
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    GDPR consent · accepted at onboarding
                  </li>
                ) : null}
              </ul>
            </div>

            <Checkbox
              checked={retainRaw}
              onChange={setRetainRaw}
              label="Keep raw video for more than 30 days"
              hint="Off by default. With this off, derived features are kept and raw clips are deleted within 30 days."
            />

            <div className="rounded-xl border border-black/[0.06] bg-surface p-4">
              <p className="text-base font-medium text-ink">
                Export your data
              </p>
              <p className="text-sm text-ink-muted mt-1 leading-relaxed">
                Download everything Glimpse knows about you as JSON.
              </p>
              <Button
                variant="secondary"
                onClick={onExport}
                className="mt-3 gap-2"
              >
                <Download className="h-4 w-4" />
                Download my data
              </Button>
            </div>
          </div>
        </SettingsSection>

        {/* Sign out */}
        <SettingsSection
          icon={<LogOut className="h-5 w-5" />}
          title="Sign out"
          subtitle="End this session on this device."
          delay={220}
        >
          <Button variant="secondary" onClick={onSignOut} className="gap-2">
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </SettingsSection>

        {/* Danger zone */}
        <section
          className="glimpse-card p-6 border border-alert/20 animate-stagger-up"
          style={{ animationDelay: "260ms" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-2xl bg-alert/10 text-alert flex items-center justify-center">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-semibold text-ink">
                Delete my account and data
              </p>
              <p className="text-sm text-ink-muted">
                Fully removes everything within 30 days. Cannot be undone.
              </p>
            </div>
          </div>
          <p className="text-sm text-ink-muted mb-4 leading-relaxed">
            Type <span className="font-semibold text-ink">DELETE</span> below
            to confirm. This clears your local data immediately and queues the
            server-side erasure.
          </p>
          <div className="flex items-center gap-2">
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="max-w-xs"
            />
            <button
              type="button"
              onClick={onDelete}
              disabled={deleteConfirm !== "DELETE" || deleting}
              className="h-11 px-5 rounded-xl bg-alert text-white font-medium hover:bg-alert/90 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {deleting ? "Deleting…" : "Delete everything"}
            </button>
          </div>
        </section>

        {/* About */}
        <SettingsSection
          icon={<Info className="h-5 w-5" />}
          title="About"
          subtitle="What this app is and isn't."
          delay={300}
        >
          <p className="text-base text-ink-muted leading-relaxed">
            Glimpse is a wellness and clinical decision support tool. It does
            not diagnose disease. In an emergency, call 911.
          </p>
          <p className="text-sm text-ink-muted mt-3">
            Version 0.1 · Built for early signal detection.
          </p>
        </SettingsSection>
      </main>
    </div>
  );
}

function SettingsSection({
  icon,
  title,
  subtitle,
  children,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <section
      className="glimpse-card p-6 animate-stagger-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
          <p className="text-sm text-ink-muted">{subtitle}</p>
        </div>
      </div>
      <div className="mt-2">{children}</div>
    </section>
  );
}
