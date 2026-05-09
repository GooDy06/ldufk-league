-- Run this if saving news fails with:
-- "Could not find the 'created_by' column of 'news' in the schema cache"
--
-- This column is needed so reporter admins can edit/delete only their own posts.

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

alter table public.news enable row level security;

drop policy if exists "Public can read published news" on public.news;
drop policy if exists "Admins can manage news" on public.news;
drop policy if exists "Main admins, admins, and reporters can insert news" on public.news;
drop policy if exists "Main admins, admins, and own reporters can update news" on public.news;
drop policy if exists "Main admins, admins, and own reporters can delete news" on public.news;

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

grant select on public.news to anon, authenticated;
grant insert, update, delete on public.news to authenticated;

notify pgrst, 'reload schema';
