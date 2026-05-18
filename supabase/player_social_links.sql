alter table public.players
  add column if not exists instagram_url text,
  add column if not exists twitch_url text,
  add column if not exists x_url text,
  add column if not exists faceit_url text;
