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
- `@supabase/supabase-js` is in `dependencies` and ready to wire — Eazo's template handles the integration
- Local mock auth + mock data layer backed by `localStorage` so the project builds and runs without any keys (`lib/auth/mock-auth.ts`, `lib/db/mock-db.ts`). Swap modules to point at Supabase when keys are present.

This is a standard Next.js 14 project layout — no custom manifest, no monorepo, no platform-specific quirks. Eazo imports it directly from GitHub.

---

## Deploying to Eazo

1. **Push this repo to a public GitHub repo** (see "Push to GitHub" below).
2. In the Eazo chat, paste your GitHub URL.
3. Eazo will pull the code into its sandbox, adjust env vars / routing for its template, run a build, and ship it to your creator profile.
4. **Supabase**: create a project at <https://supabase.com>, then in Supabase's SQL editor paste the contents of [`supabase/schema.sql`](supabase/schema.sql). It creates the `accounts`, `onboarding`, and `audit_log` tables with Row Level Security policies scoped to `auth.uid()`. Then set these env vars in Eazo:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-side only)

If Eazo's template prefers a different folder layout (e.g. `pages/` instead of `app/`, or a specific Supabase client location), let their import process restructure — the page logic doesn't care about location.

### Push to GitHub

If you don't have this on GitHub yet:

```bash
# 1. Create a NEW public repo at https://github.com/new
#    (name it whatever; do NOT initialize with README/gitignore)
# 2. From this directory:
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```

Or with `gh` (if you've authenticated `gh auth login`):

```bash
gh repo create glimpse --public --source=. --remote=origin --push
```

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
| Authentication         | `lib/auth/mock-auth.ts`              | Supabase Auth (`@supabase/supabase-js`)           |
| Persistence            | `lib/db/mock-db.ts`                  | Supabase Postgres (`@supabase/supabase-js`) with the RLS policies in `supabase/schema.sql` |
| Risk stratification    | `lib/risk/stratify.ts`               | Server-side PRS pipeline (Nucleus API + PLINK)   |
| Hardware pairing       | `app/onboarding/glasses/page.tsx`    | Meta companion SDK + `navigator.mediaDevices`     |
| Genomic file ingest    | `app/onboarding/genomics/page.tsx`   | Signed Supabase Storage upload → background VCF/raw parser |

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
