-- Run once in Supabase SQL Editor if admin CRUD is blocked by RLS.
-- This keeps public reads protected and allows only this admin email to write.

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  email text primary key,
  created_at timestamptz not null default now()
);

insert into public.admin_users (email)
values ('djpundiak@gmail.com')
on conflict (email) do nothing;

create table if not exists public.homepage_champions (
  id uuid primary key default gen_random_uuid(),
  division text not null unique check (division in ('University', 'School')),
  team_name text not null,
  tournament_name text not null,
  date_label text not null,
  division_label text not null,
  image_url text,
  details_href text,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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
    where lower(email) = lower(auth.jwt() ->> 'email')
  );
$$;

alter table public.admin_users enable row level security;
alter table public.teams enable row level security;
alter table public.players enable row level security;
alter table public.news enable row level security;
alter table public.tournaments enable row level security;
alter table public.homepage_champions enable row level security;

drop policy if exists "Admins can read admin users" on public.admin_users;
create policy "Admins can read admin users"
on public.admin_users
for select
to authenticated
using (public.is_admin());

drop policy if exists "Public can read published teams" on public.teams;
create policy "Public can read published teams"
on public.teams
for select
to anon, authenticated
using (published = true);

drop policy if exists "Admins can manage teams" on public.teams;
create policy "Admins can manage teams"
on public.teams
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read published players" on public.players;
create policy "Public can read published players"
on public.players
for select
to anon, authenticated
using (published = true);

drop policy if exists "Admins can manage players" on public.players;
create policy "Admins can manage players"
on public.players
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read published news" on public.news;
create policy "Public can read published news"
on public.news
for select
to anon, authenticated
using (published = true);

drop policy if exists "Admins can manage news" on public.news;
create policy "Admins can manage news"
on public.news
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read published tournaments" on public.tournaments;
create policy "Public can read published tournaments"
on public.tournaments
for select
to anon, authenticated
using (published = true);

drop policy if exists "Admins can manage tournaments" on public.tournaments;
create policy "Admins can manage tournaments"
on public.tournaments
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read published homepage champions" on public.homepage_champions;
create policy "Public can read published homepage champions"
on public.homepage_champions
for select
to anon, authenticated
using (published = true);

drop policy if exists "Admins can manage homepage champions" on public.homepage_champions;
create policy "Admins can manage homepage champions"
on public.homepage_champions
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

grant usage on schema public to anon, authenticated;
grant select on public.teams to anon, authenticated;
grant select on public.players to anon, authenticated;
grant select on public.news to anon, authenticated;
grant select on public.tournaments to anon, authenticated;
grant select on public.homepage_champions to anon, authenticated;

grant insert, update, delete on public.teams to authenticated;
grant insert, update, delete on public.players to authenticated;
grant insert, update, delete on public.news to authenticated;
grant insert, update, delete on public.tournaments to authenticated;
grant insert, update, delete on public.homepage_champions to authenticated;
