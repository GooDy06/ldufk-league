-- LDUFK League Supabase schema
-- Replace ВСТАВ_ТУТ_СВІЙ_EMAIL with your real admin email before running.

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  email text primary key,
  created_at timestamptz not null default now()
);

insert into public.admin_users (email)
values ('ВСТАВ_ТУТ_СВІЙ_EMAIL')
on conflict (email) do nothing;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where email = auth.jwt() ->> 'email'
  );
$$;

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  division text not null check (division in ('University', 'School')),
  org text not null,
  points integer not null default 0,
  trend integer not null default 0,
  color text not null default '#00d5ff',
  logo_url text,
  summary text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete set null,
  nick text not null,
  role text not null default 'Rifler',
  rating numeric(4,2) not null default 1.00,
  avatar_url text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  tag text not null default 'ann',
  excerpt text not null default '',
  body text not null default '',
  image_url text,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tournaments (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  division text not null check (division in ('University', 'School', 'Global')),
  type text not null default 'online' check (type in ('online', 'lan')),
  date_label text not null,
  status text not null default 'soon' check (status in ('done', 'live', 'soon')),
  teams_count integer not null default 0,
  winner_team_id uuid references public.teams(id) on delete set null,
  points text,
  prize text,
  format text,
  description text,
  participants text[] not null default '{}',
  banner_url text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists teams_touch_updated_at on public.teams;
create trigger teams_touch_updated_at before update on public.teams
for each row execute function public.touch_updated_at();

drop trigger if exists players_touch_updated_at on public.players;
create trigger players_touch_updated_at before update on public.players
for each row execute function public.touch_updated_at();

drop trigger if exists news_touch_updated_at on public.news;
create trigger news_touch_updated_at before update on public.news
for each row execute function public.touch_updated_at();

drop trigger if exists tournaments_touch_updated_at on public.tournaments;
create trigger tournaments_touch_updated_at before update on public.tournaments
for each row execute function public.touch_updated_at();

alter table public.admin_users enable row level security;
alter table public.teams enable row level security;
alter table public.players enable row level security;
alter table public.news enable row level security;
alter table public.tournaments enable row level security;

drop policy if exists "Admins can read admin users" on public.admin_users;
create policy "Admins can read admin users"
on public.admin_users for select
to authenticated
using (public.is_admin());

drop policy if exists "Public can read published teams" on public.teams;
create policy "Public can read published teams"
on public.teams for select
to anon, authenticated
using (published = true or public.is_admin());

drop policy if exists "Admins can write teams" on public.teams;
create policy "Admins can write teams"
on public.teams for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read published players" on public.players;
create policy "Public can read published players"
on public.players for select
to anon, authenticated
using (published = true or public.is_admin());

drop policy if exists "Admins can write players" on public.players;
create policy "Admins can write players"
on public.players for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read published news" on public.news;
create policy "Public can read published news"
on public.news for select
to anon, authenticated
using (published = true or public.is_admin());

drop policy if exists "Admins can write news" on public.news;
create policy "Admins can write news"
on public.news for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read published tournaments" on public.tournaments;
create policy "Public can read published tournaments"
on public.tournaments for select
to anon, authenticated
using (published = true or public.is_admin());

drop policy if exists "Admins can write tournaments" on public.tournaments;
create policy "Admins can write tournaments"
on public.tournaments for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create index if not exists teams_published_division_points_idx on public.teams (published, division, points desc);
create index if not exists players_published_rating_idx on public.players (published, rating desc);
create index if not exists news_published_at_idx on public.news (published, published_at desc nulls last, created_at desc);
create index if not exists tournaments_published_division_idx on public.tournaments (published, division, created_at desc);
