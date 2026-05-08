-- Run this if saving admins fails with:
-- "Could not find the 'role' column of 'admin_users' in the schema cache"
--
-- After this you can edit roles directly in Supabase:
-- Table Editor -> admin_users -> role
--
-- Allowed roles:
-- main_admin, admin, moderator, reporter

alter table public.admin_users
  add column if not exists role text not null default 'admin';

alter table public.admin_users
  drop constraint if exists admin_users_role_check;

alter table public.admin_users
  add constraint admin_users_role_check
  check (role in ('main_admin', 'admin', 'moderator', 'reporter'));

insert into public.admin_users (email, role)
values ('djpundiak@gmail.com', 'main_admin')
on conflict (email) do update set role = 'main_admin';

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

grant select, insert, update, delete on public.admin_users to authenticated;

alter table public.admin_users enable row level security;

drop policy if exists "Admins can read admin users" on public.admin_users;
drop policy if exists "Main admins can manage admin users" on public.admin_users;

create policy "Admins can read admin users"
on public.admin_users
for select
to authenticated
using (
  lower(email) = lower(auth.jwt() ->> 'email')
  or public.has_admin_role(array['main_admin'])
);

create policy "Main admins can manage admin users"
on public.admin_users
for all
to authenticated
using (public.has_admin_role(array['main_admin']))
with check (public.has_admin_role(array['main_admin']));

notify pgrst, 'reload schema';
