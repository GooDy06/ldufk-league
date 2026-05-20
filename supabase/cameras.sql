create extension if not exists pgcrypto;

create table if not exists public.camera_rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tournament_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.camera_players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.camera_rooms(id) on delete cascade,
  nickname text not null,
  team_name text,
  steamid64 text not null check (steamid64 ~ '^[0-9]{17}$'),
  avatar_url text,
  join_token text not null unique,
  is_online boolean not null default false,
  last_seen timestamptz,
  created_at timestamptz not null default now(),
  unique (room_id, steamid64)
);

create table if not exists public.camera_sessions (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.camera_players(id) on delete cascade,
  peer_id text not null,
  status text not null default 'connecting' check (status in ('connecting', 'online', 'active', 'ended', 'removed', 'error')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists camera_players_room_id_idx on public.camera_players(room_id);
create index if not exists camera_players_steamid64_idx on public.camera_players(steamid64);
create index if not exists camera_players_online_idx on public.camera_players(is_online, last_seen desc);
create index if not exists camera_sessions_player_id_idx on public.camera_sessions(player_id);
create index if not exists camera_sessions_status_idx on public.camera_sessions(status);

create or replace function public.set_camera_session_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists camera_sessions_updated_at on public.camera_sessions;
create trigger camera_sessions_updated_at
before update on public.camera_sessions
for each row
execute function public.set_camera_session_updated_at();

alter table public.camera_rooms enable row level security;
alter table public.camera_players enable row level security;
alter table public.camera_sessions enable row level security;

-- The web app and signaling server use SUPABASE_SERVICE_ROLE_KEY on the server.
-- No anon policy is intentionally added: join tokens are resolved only by trusted server code.
