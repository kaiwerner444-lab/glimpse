# Glimpse

Proactive neurological and chronic disease screening platform. A five‑minute daily mirror ritual paired with Meta Ray Ban smart glasses and consumer genomic testing.

This repository contains the **v0.1 onboarding preview** — the first artifact in a larger build. It implements the six onboarding steps from the product spec:

1. Account creation (with HIPAA/GDPR consent)
2. Meta Ray Ban glasses pairing (with phone fallback)
3. Genomic data integration (order Nucleus kit / import raw / skip)
4. Family history capture
5. Risk stratification and confirmation
6. Baseline calibration session

After onboarding completes, the user is routed to a placeholder home screen. The daily session, weekly/monthly reports, alert system, and clinician portal are out of scope for this build and exist only as stubs.

---

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** with a custom brand theme (primary `#00707E`)
- Inline shadcn-style UI primitives (no shadcn CLI dependency)
- `lucide-react` for icons
- **Mock auth** (`lib/auth/mock-auth.ts`) and **mock data layer** (`lib/db/mock-db.ts`) backed by `localStorage` — swap points are clean for Clerk + Supabase

This is a standard Next.js project layout. It should import directly into any creator/no-code platform that accepts Next.js projects (Vercel, Bolt, Lovable, V0, Replit Agent, and likely Eazo). If Eazo expects a different shape (custom manifest, alternate folder layout, single bundled file), let me know and I'll restructure.

---

## Getting started

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

Routes:

- `/` — marketing landing
- `/onboarding/account` → glasses → genomics → family-history → risk-profile → baseline
- `/home` — post-onboarding placeholder
- `/clinician` — clinician portal stub

---

## Design system

Anchored on a deep teal primary (`#00707E`) per the spec. Calm and clinical without being sterile, referencing Oura / Whoop / Apple Health. Hard rules applied:

- 16px floor on body text
- Red is reserved exclusively for Tier 3 specialist referral alerts (not used in onboarding)
- Generous whitespace, high contrast
- Focus rings on every interactive element

---

## Swap-out points (for v2)

| Concern                | Mock module                          | Replace with                                      |
| ---------------------- | ------------------------------------ | ------------------------------------------------- |
| Authentication         | `lib/auth/mock-auth.ts`              | Clerk (`@clerk/nextjs`)                           |
| Persistence            | `lib/db/mock-db.ts`                  | Supabase (`@supabase/supabase-js`) with RLS      |
| Risk stratification    | `lib/risk/stratify.ts`               | Server-side PRS pipeline (Nucleus API + PLINK)   |
| Hardware pairing       | `app/onboarding/glasses/page.tsx`    | Meta companion SDK + `navigator.mediaDevices`     |
| Genomic file ingest    | `app/onboarding/genomics/page.tsx`   | Signed S3 upload → background VCF/raw parser     |

All function signatures and state shapes are stable — swapping these modules should not require touching the page code.

---

## Compliance posture

- Position: wellness and clinical decision support tool — **not** a diagnostic device. No diagnostic language anywhere in copy.
- Raw audio/video should be processed and discarded (≤30 day retention unless opted in). Only derived features are persisted.
- Genomic data treated as highest sensitivity tier; never shared without explicit consent.
- Full data deletion path required within 30 days of user request.
- BAAs required with all infrastructure providers (Vercel/Supabase/Clerk) before any real PHI lands here.

In any acute red-flag scenario suggesting stroke or other emergency, the production app must display U.S. emergency guidance and prompt to call 911 immediately — no menus, no surveys.

---

## What's intentionally **not** here yet

- ML/feature extraction (Whisper, MediaPipe, etc.)
- Real polygenic risk scoring
- Daily session runtime (timers exist, recording does not)
- Weekly/monthly reports
- Alert system (Tier 1/2/3)
- Clinician portal beyond the landing stub
- Apple HealthKit / Google Health Connect
- Telehealth referral integration
- FHIR / Epic / Cerner integration
- Stripe, Twilio, analytics
- Localization (English only for v1)
- Pediatric flows

These come in subsequent builds.
