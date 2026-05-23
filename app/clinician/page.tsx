import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export default function ClinicianPortalStub() {
  return (
    <div className="min-h-dvh bg-surface-alt">
      <header className="px-6 py-5 max-w-3xl w-full mx-auto flex items-center justify-between">
        <Link href="/">
          <Logo />
        </Link>
        <Link href="/" className="text-sm text-ink-muted hover:text-ink">
          ← Patient app
        </Link>
      </header>
      <main className="px-6 max-w-3xl w-full mx-auto py-12 animate-fade-up">
        <p className="text-sm font-medium uppercase tracking-wider text-brand-500 mb-2">
          Clinician portal
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-ink">
          A separate workspace for participating clinics.
        </h1>
        <p className="mt-4 text-lg text-ink-muted">
          Population view, longitudinal patient dashboards, and CCM / PCM
          billing documentation (CPT 99490, 99491, 99439, 99424, 99425).
        </p>

        <div className="mt-8 glimpse-card p-6">
          <p className="text-base text-ink">
            Stub for v1. Clinic enrollment, FHIR integration with Epic and
            Cerner, and the population dashboard land in a subsequent build.
          </p>
        </div>
      </main>
    </div>
  );
}
