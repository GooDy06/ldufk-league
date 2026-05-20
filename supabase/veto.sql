create table if not exists public.veto_sessions (
  id uuid primary key default gen_random_uuid(),
  team1 text not null default 'Team 1',
  team2 text not null default 'Team 2',
  format text not null default 'bo3' check (format in ('bo1', 'bo3', 'bo5')),
  first_team text not null default 'team1' check (first_team in ('team1', 'team2')),
  map_pool text[] not null default array['Ancient', 'Anubis', 'Dust2', 'Inferno', 'Mirage', 'Nuke', 'Overpass'],
  steps jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'live', 'complete')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.veto_sessions enable row level security;

create index if not exists veto_sessions_updated_at_idx on public.veto_sessions(updated_at desc);

create or replace function public.touch_veto_sessions_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists veto_sessions_touch_updated_at on public.veto_sessions;
create trigger veto_sessions_touch_updated_at
before update on public.veto_sessions
for each row
execute function public.touch_veto_sessions_updated_at();
