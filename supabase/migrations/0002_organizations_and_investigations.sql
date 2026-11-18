-- Förberedd webbmodell för företagskonton och miljöutredningar.
-- Kräver aktiv Supabase-testmiljö innan verifiering. Skapa inga betalda tjänster här.

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table if not exists public.investigations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  title text not null,
  status text not null default 'in_progress',
  company_json jsonb not null default '{}'::jsonb,
  sections_json jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.investigation_company (
  investigation_id uuid primary key references public.investigations (id) on delete cascade,
  company_name text not null,
  organization_number text,
  address text,
  contact_name text,
  contact_email text
);

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.investigations enable row level security;
alter table public.investigation_company enable row level security;

-- Medlemmar ser bara sin egen organisations data.
create policy "members_select_org"
  on public.organizations for select
  using (
    exists (
      select 1 from public.organization_members m
      where m.organization_id = organizations.id and m.user_id = auth.uid()
    )
  );

create policy "members_select_membership"
  on public.organization_members for select
  using (user_id = auth.uid());

create policy "members_select_investigations"
  on public.investigations for select
  using (
    exists (
      select 1 from public.organization_members m
      where m.organization_id = investigations.organization_id and m.user_id = auth.uid()
    )
  );

create policy "members_insert_investigations"
  on public.investigations for insert
  with check (
    exists (
      select 1 from public.organization_members m
      where m.organization_id = investigations.organization_id and m.user_id = auth.uid()
    )
  );

create policy "members_update_investigations"
  on public.investigations for update
  using (
    exists (
      select 1 from public.organization_members m
      where m.organization_id = investigations.organization_id and m.user_id = auth.uid()
    )
  );

create policy "members_select_company"
  on public.investigation_company for select
  using (
    exists (
      select 1
      from public.investigations i
      join public.organization_members m on m.organization_id = i.organization_id
      where i.id = investigation_company.investigation_id and m.user_id = auth.uid()
    )
  );

create policy "members_upsert_company"
  on public.investigation_company for all
  using (
    exists (
      select 1
      from public.investigations i
      join public.organization_members m on m.organization_id = i.organization_id
      where i.id = investigation_company.investigation_id and m.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.investigations i
      join public.organization_members m on m.organization_id = i.organization_id
      where i.id = investigation_company.investigation_id and m.user_id = auth.uid()
    )
  );
