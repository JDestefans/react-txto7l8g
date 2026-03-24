-- Program data table: stores the full program state JSON per user.
-- RLS ensures each user can only read/write their own row.

create table if not exists public.program_data (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.program_data enable row level security;

create policy "Users can read own data"
  on public.program_data for select
  using (auth.uid() = user_id);

create policy "Users can insert own data"
  on public.program_data for insert
  with check (auth.uid() = user_id);

create policy "Users can update own data"
  on public.program_data for update
  using (auth.uid() = user_id);

-- Auto-update updated_at on change
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger program_data_updated_at
  before update on public.program_data
  for each row execute function public.handle_updated_at();

-- Subscriptions table for Stripe billing integration
create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text not null default 'solo',
  status text not null default 'trialing',
  trial_end timestamptz default (now() + interval '14 days'),
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "Users can read own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.handle_updated_at();
