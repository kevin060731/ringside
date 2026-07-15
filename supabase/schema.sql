create extension if not exists pgcrypto;

create table if not exists public.fighters (
  id text primary key,
  name text not null,
  last_name text,
  country text,
  stance text,
  primary_division text,
  image_url text,
  active boolean not null default false,
  model_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fighter_versions (
  id uuid primary key default gen_random_uuid(),
  fighter_id text not null references public.fighters(id) on delete cascade,
  label text not null,
  year int,
  division text,
  weight_lbs numeric,
  ratings jsonb not null default '{}'::jsonb,
  best_performance jsonb,
  source_notes jsonb not null default '{}'::jsonb,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.verified_fights (
  id text primary key,
  fight_date date,
  red_fighter_id text references public.fighters(id),
  blue_fighter_id text references public.fighters(id),
  winner_fighter_id text references public.fighters(id),
  method text,
  scheduled_rounds int,
  ended_round int,
  scorecards jsonb,
  events jsonb,
  stats jsonb,
  fan_consensus jsonb,
  sources jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.saved_fights (
  id uuid primary key default gen_random_uuid(),
  share_slug text not null unique default lower(substr(replace(gen_random_uuid()::text,'-',''),1,10)),
  red_fighter_id text,
  blue_fighter_id text,
  red_version_label text,
  blue_version_label text,
  settings jsonb not null default '{}'::jsonb,
  winner_fighter_id text,
  decision text,
  method text,
  rounds_completed int,
  totals jsonb,
  scorecards jsonb,
  is_historical boolean not null default false,
  fight_data jsonb not null,
  research_desk jsonb,
  is_public boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.fighters enable row level security;
alter table public.fighter_versions enable row level security;
alter table public.verified_fights enable row level security;
alter table public.saved_fights enable row level security;

drop policy if exists "Public fighters are readable" on public.fighters;
create policy "Public fighters are readable"
on public.fighters for select
using (true);

drop policy if exists "Public fighter versions are readable" on public.fighter_versions;
create policy "Public fighter versions are readable"
on public.fighter_versions for select
using (true);

drop policy if exists "Public verified fights are readable" on public.verified_fights;
create policy "Public verified fights are readable"
on public.verified_fights for select
using (true);

drop policy if exists "Public saved fights are readable" on public.saved_fights;
create policy "Public saved fights are readable"
on public.saved_fights for select
using (is_public = true);

drop policy if exists "Anyone can create public saved fights" on public.saved_fights;
create policy "Anyone can create public saved fights"
on public.saved_fights for insert
with check (is_public = true);
