-- Launch hardening: secure sharing + integration delivery audit trails
-- Requires pgcrypto for secure token generation/hashing.

create extension if not exists pgcrypto;

create table if not exists public.shared_reports (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  token_hash text,
  report_data jsonb not null,
  requires_passcode boolean not null default false,
  passcode_hash text,
  passcode_salt text,
  report_org text default '',
  compliance_pct numeric not null default 0,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  access_count integer not null default 0,
  last_accessed_at timestamptz
);

alter table public.shared_reports add column if not exists token_hash text;
alter table public.shared_reports add column if not exists passcode_salt text;
alter table public.shared_reports add column if not exists revoked_at timestamptz;
alter table public.shared_reports add column if not exists report_org text default '';
alter table public.shared_reports add column if not exists compliance_pct numeric not null default 0;
alter table public.shared_reports add column if not exists access_count integer not null default 0;
alter table public.shared_reports add column if not exists last_accessed_at timestamptz;
alter table public.shared_reports add column if not exists requires_passcode boolean not null default false;
alter table public.shared_reports add column if not exists passcode_hash text;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'shared_reports'
      and column_name = 'token'
  ) then
    update public.shared_reports
    set token_hash = encode(digest('share-token-v2:' || token, 'sha256'), 'hex')
    where token_hash is null
      and token is not null;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'shared_reports'
      and column_name = 'revoked'
  ) then
    update public.shared_reports
    set revoked_at = coalesce(revoked_at, now())
    where revoked = true;
  end if;
end $$;

create unique index if not exists shared_reports_token_hash_idx
  on public.shared_reports(token_hash);

create index if not exists shared_reports_owner_idx
  on public.shared_reports(owner_user_id, created_at desc);

create index if not exists shared_reports_expiry_idx
  on public.shared_reports(expires_at);

alter table public.shared_reports enable row level security;

drop policy if exists "Users can read own shared reports" on public.shared_reports;
create policy "Users can read own shared reports"
  on public.shared_reports for select
  using (auth.uid() = owner_user_id);

drop policy if exists "Users can insert own shared reports" on public.shared_reports;
create policy "Users can insert own shared reports"
  on public.shared_reports for insert
  with check (auth.uid() = owner_user_id);

drop policy if exists "Users can update own shared reports" on public.shared_reports;
create policy "Users can update own shared reports"
  on public.shared_reports for update
  using (auth.uid() = owner_user_id);

create table if not exists public.shared_report_access_logs (
  id uuid primary key default gen_random_uuid(),
  shared_report_id uuid not null references public.shared_reports(id) on delete cascade,
  accessed_at timestamptz not null default now(),
  access_status text not null,
  ip_address text,
  user_agent text
);

create index if not exists shared_report_access_logs_report_idx
  on public.shared_report_access_logs(shared_report_id, accessed_at desc);

alter table public.shared_report_access_logs enable row level security;

drop policy if exists "Users can read own share access logs" on public.shared_report_access_logs;
create policy "Users can read own share access logs"
  on public.shared_report_access_logs for select
  using (
    exists (
      select 1
      from public.shared_reports sr
      where sr.id = shared_report_access_logs.shared_report_id
        and sr.owner_user_id = auth.uid()
    )
  );

create table if not exists public.integration_event_logs (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  channel text not null,
  status text not null,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists integration_event_logs_owner_idx
  on public.integration_event_logs(owner_user_id, created_at desc);

alter table public.integration_event_logs enable row level security;

drop policy if exists "Users can read own integration event logs" on public.integration_event_logs;
create policy "Users can read own integration event logs"
  on public.integration_event_logs for select
  using (auth.uid() = owner_user_id);

drop policy if exists "Users can insert own integration event logs" on public.integration_event_logs;
create policy "Users can insert own integration event logs"
  on public.integration_event_logs for insert
  with check (auth.uid() = owner_user_id);
