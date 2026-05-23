-- Glimpse v0.2 schema additions.
--
-- Adds the tables that track sessions, computed per-task features,
-- stored video metadata, and sharing tokens. Paste this into the
-- Supabase SQL editor AFTER the v0.1 schema.sql.

-- =========================================================================
-- sessions: one row per baseline or daily session
-- =========================================================================
create table if not exists public.sessions (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null default 'baseline' check (kind in ('baseline','daily')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_seconds integer,
  created_at timestamptz not null default now()
);
create index if not exists sessions_user_started_idx
  on public.sessions(user_id, started_at desc);

-- =========================================================================
-- session_task_features: ML feature payload per task
-- =========================================================================
create table if not exists public.session_task_features (
  id bigserial primary key,
  session_id uuid not null references public.sessions(id) on delete cascade,
  task_id text not null,
  features jsonb not null,
  frames_analysed integer,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists session_task_features_session_idx
  on public.session_task_features(session_id);

-- =========================================================================
-- session_videos: pointer rows for the WebM blobs in Storage
-- =========================================================================
create table if not exists public.session_videos (
  id bigserial primary key,
  session_id uuid not null references public.sessions(id) on delete cascade,
  task_id text not null,
  storage_path text not null unique,
  size_bytes bigint not null,
  -- Retention: raw video is deleted within 30 days unless the user opts in.
  expires_at timestamptz not null default (now() + interval '30 days'),
  created_at timestamptz not null default now()
);
create index if not exists session_videos_session_idx
  on public.session_videos(session_id);
create index if not exists session_videos_expires_idx
  on public.session_videos(expires_at);

-- =========================================================================
-- shares: revocable, time-bound, read-only access links
-- =========================================================================
create table if not exists public.shares (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  -- Stable random token used in the share URL. Indexed; never logged.
  token text not null unique,
  recipient_label text,           -- "Dr. Patel" / "Mom" — for the owner's UI
  recipient_email text,
  scope text not null default 'reports' check (scope in (
    'reports',                    -- weekly + monthly summaries only
    'reports_and_videos'          -- adds signed clip URLs
  )),
  expires_at timestamptz not null default (now() + interval '14 days'),
  revoked_at timestamptz,
  last_viewed_at timestamptz,
  view_count integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists shares_owner_idx on public.shares(owner_id);
create index if not exists shares_token_idx on public.shares(token);

-- =========================================================================
-- Row Level Security
-- =========================================================================
alter table public.sessions enable row level security;
alter table public.session_task_features enable row level security;
alter table public.session_videos enable row level security;
alter table public.shares enable row level security;

drop policy if exists "sessions owner" on public.sessions;
create policy "sessions owner" on public.sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "features via session" on public.session_task_features;
create policy "features via session" on public.session_task_features
  for all
  using (
    exists (
      select 1 from public.sessions s
      where s.id = session_task_features.session_id and s.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.sessions s
      where s.id = session_task_features.session_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "videos via session" on public.session_videos;
create policy "videos via session" on public.session_videos
  for all
  using (
    exists (
      select 1 from public.sessions s
      where s.id = session_videos.session_id and s.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.sessions s
      where s.id = session_videos.session_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "shares owner" on public.shares;
create policy "shares owner" on public.shares
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- =========================================================================
-- Storage bucket for session videos.
-- Run separately if Supabase Storage CLI / dashboard prefers:
--   - bucket name: session-videos
--   - public: false (signed URLs only)
-- =========================================================================
insert into storage.buckets (id, name, public)
values ('session-videos', 'session-videos', false)
on conflict (id) do nothing;

-- Storage RLS: owner can read/write their own folder; signed URLs handle
-- the share case from the application layer (no anonymous storage reads).
drop policy if exists "videos owner read" on storage.objects;
create policy "videos owner read"
  on storage.objects for select
  using (
    bucket_id = 'session-videos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "videos owner write" on storage.objects;
create policy "videos owner write"
  on storage.objects for insert
  with check (
    bucket_id = 'session-videos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "videos owner update" on storage.objects;
create policy "videos owner update"
  on storage.objects for update
  using (
    bucket_id = 'session-videos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "videos owner delete" on storage.objects;
create policy "videos owner delete"
  on storage.objects for delete
  using (
    bucket_id = 'session-videos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
