-- Run this if saving player highlights fails with:
-- "Could not find the 'highlight_date' column of 'players' in the schema cache"

alter table public.players
  add column if not exists highlight_youtube_url text,
  add column if not exists highlight_title text,
  add column if not exists highlight_tournament text,
  add column if not exists highlight_map text,
  add column if not exists highlight_date text,
  add column if not exists highlight_description text;

notify pgrst, 'reload schema';
