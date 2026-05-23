-- Glimpse v0.1 schema.
--
-- Paste this entire file into the Supabase SQL editor (or run via the
-- Supabase CLI) once your project exists. It creates the onboarding tables
-- and Row Level Security policies that scope every row to its owning user.
--
-- This schema mirrors the OnboardingState shape in `lib/types.ts`.
-- Raw audio/video are intentionally NOT modeled here — those flow through
-- signed S3-equivalent storage with ≤30-day retention, and only derived
-- features land in the time-series store.

-- =========================================================================
-- accounts
-- =========================================================================
create table if not exists public.accounts (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  date_of_birth date not null,
  sex text not null check (sex in ('female','male','intersex','prefer_not_to_say')),
  height_cm numeric(5,1) not null,
  weight_kg numeric(5,1) not null,
  ethnicity_hint text not null check (ethnicity_hint in (
    'type_1','type_2','type_3','type_4','type_5','type_6','unspecified'
  )),
  hipaa_consent boolean not null default false,
  gdpr_consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================================
-- onboarding (1 row per user, holds the multi-step state)
-- =========================================================================
create table if not exists public.onboarding (
  user_id uuid primary key references auth.users(id) on delete cascade,
  step text not null default 'account',
  glasses jsonb,
  genomics jsonb,
  family_history jsonb,
  risk_profile jsonb,
  baseline jsonb,
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

-- =========================================================================
-- audit_log (every read/write of PHI lands a row here)
-- =========================================================================
create table if not exists public.audit_log (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete set null,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  resource text not null,
  resource_id text,
  metadata jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_log_user_idx on public.audit_log(user_id);
create index if not exists audit_log_created_idx on public.audit_log(created_at desc);

-- =========================================================================
-- updated_at triggers
-- =========================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists accounts_set_updated_at on public.accounts;
create trigger accounts_set_updated_at
  before update on public.accounts
  for each row execute function public.set_updated_at();

drop trigger if exists onboarding_set_updated_at on public.onboarding;
create trigger onboarding_set_updated_at
  before update on public.onboarding
  for each row execute function public.set_updated_at();

-- =========================================================================
-- Row Level Security
-- =========================================================================
alter table public.accounts enable row level security;
alter table public.onboarding enable row level security;
alter table public.audit_log enable row level security;

-- A user can read/write only their own account row.
drop policy if exists "accounts self read" on public.accounts;
create policy "accounts self read"
  on public.accounts for select
  using (auth.uid() = id);

drop policy if exists "accounts self insert" on public.accounts;
create policy "accounts self insert"
  on public.accounts for insert
  with check (auth.uid() = id);

drop policy if exists "accounts self update" on public.accounts;
create policy "accounts self update"
  on public.accounts for update
  using (auth.uid() = id);

-- Same for onboarding state.
drop policy if exists "onboarding self read" on public.onboarding;
create policy "onboarding self read"
  on public.onboarding for select
  using (auth.uid() = user_id);

drop policy if exists "onboarding self upsert" on public.onboarding;
create policy "onboarding self upsert"
  on public.onboarding for insert
  with check (auth.uid() = user_id);

drop policy if exists "onboarding self update" on public.onboarding;
create policy "onboarding self update"
  on public.onboarding for update
  using (auth.uid() = user_id);

-- Audit log: users can read their own entries; only the service role can write.
drop policy if exists "audit self read" on public.audit_log;
create policy "audit self read"
  on public.audit_log for select
  using (auth.uid() = user_id);
