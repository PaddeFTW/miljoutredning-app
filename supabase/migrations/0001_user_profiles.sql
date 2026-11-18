-- Förberedd migration (från account-system-integration).
-- BLOCKERAD att köra mot produktion tills separat testmiljö finns.

create table if not exists public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  company_name text,
  job_title text,
  language text not null default 'sv',
  timezone text not null default 'Europe/Stockholm',
  terms_accepted_at timestamptz,
  privacy_accepted_at timestamptz,
  marketing_consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

create policy "Users can view own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = id);
