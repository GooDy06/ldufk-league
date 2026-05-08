-- Adds admin roles and top-player YouTube highlight fields.
-- Paste this into Supabase SQL Editor and press Run once.

alter table public.admin_users
  add column if not exists role text not null default 'admin'
  check (role in ('main_admin', 'admin', 'moderator', 'reporter'));

insert into public.admin_users (email, role)
values ('djpundiak@gmail.com', 'main_admin')
on conflict (email) do update set role = 'main_admin';

alter table public.players
  add column if not exists highlight_youtube_url text,
  add column if not exists highlight_title text,
  add column if not exists highlight_tournament text,
  add column if not exists highlight_map text,
  add column if not exists highlight_date text,
  add column if not exists highlight_description text;

alter table public.news
  add column if not exists created_by uuid references auth.users(id) on delete set null;

create or replace function public.admin_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.admin_users
  where lower(email) = lower(auth.jwt() ->> 'email')
  limit 1;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.admin_role() is not null;
$$;

create or replace function public.has_admin_role(roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.admin_role() = any(roles), false);
$$;

alter table public.admin_users enable row level security;
alter table public.teams enable row level security;
alter table public.players enable row level security;
alter table public.news enable row level security;
alter table public.tournaments enable row level security;
alter table public.homepage_champions enable row level security;

drop policy if exists "Admins can read admin users" on public.admin_users;
drop policy if exists "Main admins can manage admin users" on public.admin_users;
drop policy if exists "Admins can manage teams" on public.teams;
drop policy if exists "Main admins, admins, and moderators can insert teams" on public.teams;
drop policy if exists "Main admins, admins, and moderators can update teams" on public.teams;
drop policy if exists "Main admins and admins can delete teams" on public.teams;
drop policy if exists "Admins can manage players" on public.players;
drop policy if exists "Main admins, admins, and moderators can insert players" on public.players;
drop policy if exists "Main admins, admins, and moderators can update players" on public.players;
drop policy if exists "Main admins and admins can delete players" on public.players;
drop policy if exists "Admins can manage news" on public.news;
drop policy if exists "Main admins, admins, and reporters can insert news" on public.news;
drop policy if exists "Main admins, admins, and own reporters can update news" on public.news;
drop policy if exists "Main admins, admins, and own reporters can delete news" on public.news;
drop policy if exists "Admins can manage tournaments" on public.tournaments;
drop policy if exists "Main admins and admins can manage tournaments" on public.tournaments;
drop policy if exists "Admins can manage homepage champions" on public.homepage_champions;
drop policy if exists "Main admins and admins can manage homepage champions" on public.homepage_champions;

create policy "Admins can read admin users"
on public.admin_users
for select
to authenticated
using (lower(email) = lower(auth.jwt() ->> 'email') or public.has_admin_role(array['main_admin']));

create policy "Main admins can manage admin users"
on public.admin_users
for all
to authenticated
using (public.has_admin_role(array['main_admin']))
with check (public.has_admin_role(array['main_admin']));

drop policy if exists "Public can read published teams" on public.teams;
create policy "Public can read published teams"
on public.teams
for select
to anon, authenticated
using (published = true or public.is_admin());

create policy "Main admins, admins, and moderators can insert teams"
on public.teams
for insert
to authenticated
with check (public.has_admin_role(array['main_admin', 'admin']));

create policy "Main admins, admins, and moderators can update teams"
on public.teams
for update
to authenticated
using (public.has_admin_role(array['main_admin', 'admin', 'moderator']))
with check (public.has_admin_role(array['main_admin', 'admin', 'moderator']));

create policy "Main admins and admins can delete teams"
on public.teams
for delete
to authenticated
using (public.has_admin_role(array['main_admin', 'admin']));

drop policy if exists "Public can read published players" on public.players;
create policy "Public can read published players"
on public.players
for select
to anon, authenticated
using (published = true or public.is_admin());

create policy "Main admins, admins, and moderators can insert players"
on public.players
for insert
to authenticated
with check (public.has_admin_role(array['main_admin', 'admin']));

create policy "Main admins, admins, and moderators can update players"
on public.players
for update
to authenticated
using (public.has_admin_role(array['main_admin', 'admin', 'moderator']))
with check (public.has_admin_role(array['main_admin', 'admin', 'moderator']));

create policy "Main admins and admins can delete players"
on public.players
for delete
to authenticated
using (public.has_admin_role(array['main_admin', 'admin']));

drop policy if exists "Public can read published news" on public.news;
create policy "Public can read published news"
on public.news
for select
to anon, authenticated
using (published = true or public.is_admin());

create policy "Main admins, admins, and reporters can insert news"
on public.news
for insert
to authenticated
with check (
  public.has_admin_role(array['main_admin', 'admin'])
  or (public.has_admin_role(array['reporter']) and created_by = auth.uid())
);

create policy "Main admins, admins, and own reporters can update news"
on public.news
for update
to authenticated
using (
  public.has_admin_role(array['main_admin', 'admin'])
  or (public.has_admin_role(array['reporter']) and created_by = auth.uid())
)
with check (
  public.has_admin_role(array['main_admin', 'admin'])
  or (public.has_admin_role(array['reporter']) and created_by = auth.uid())
);

create policy "Main admins, admins, and own reporters can delete news"
on public.news
for delete
to authenticated
using (
  public.has_admin_role(array['main_admin', 'admin'])
  or (public.has_admin_role(array['reporter']) and created_by = auth.uid())
);

drop policy if exists "Public can read published tournaments" on public.tournaments;
create policy "Public can read published tournaments"
on public.tournaments
for select
to anon, authenticated
using (published = true or public.is_admin());

create policy "Main admins and admins can manage tournaments"
on public.tournaments
for all
to authenticated
using (public.has_admin_role(array['main_admin', 'admin']))
with check (public.has_admin_role(array['main_admin', 'admin']));

drop policy if exists "Public can read published homepage champions" on public.homepage_champions;
create policy "Public can read published homepage champions"
on public.homepage_champions
for select
to anon, authenticated
using (published = true or public.is_admin());

create policy "Main admins and admins can manage homepage champions"
on public.homepage_champions
for all
to authenticated
using (public.has_admin_role(array['main_admin', 'admin']))
with check (public.has_admin_role(array['main_admin', 'admin']));

grant select on public.admin_users to authenticated;
grant insert, update, delete on public.admin_users to authenticated;
grant insert, update, delete on public.teams to authenticated;
grant insert, update, delete on public.players to authenticated;
grant insert, update, delete on public.news to authenticated;
grant insert, update, delete on public.tournaments to authenticated;
grant insert, update, delete on public.homepage_champions to authenticated;

notify pgrst, 'reload schema';
