-- School Division teams and players generated from parsed demo data.
begin;

insert into public.teams (name, slug, division, org, points, trend, color, summary, published)
values ('S0mples', 's0mples', 'School', 'LDUFK School Cup 2026', 1000, 0, '#18d7ff', 'S0mples roster for LDUFK School Cup 2026.', true)
on conflict (slug) do update set name = excluded.name, division = excluded.division, org = excluded.org, color = excluded.color, summary = excluded.summary, published = true;

insert into public.teams (name, slug, division, org, points, trend, color, summary, published)
values ('KOZA4KU', 'koza4ku', 'School', 'LDUFK School Cup 2026', 965, 0, '#6ff0c2', 'KOZA4KU roster for LDUFK School Cup 2026.', true)
on conflict (slug) do update set name = excluded.name, division = excluded.division, org = excluded.org, color = excluded.color, summary = excluded.summary, published = true;

insert into public.teams (name, slug, division, org, points, trend, color, summary, published)
values ('Prestige', 'prestige', 'School', 'LDUFK School Cup 2026', 930, 0, '#ff9aa2', 'Prestige roster for LDUFK School Cup 2026.', true)
on conflict (slug) do update set name = excluded.name, division = excluded.division, org = excluded.org, color = excluded.color, summary = excluded.summary, published = true;

insert into public.teams (name, slug, division, org, points, trend, color, summary, published)
values ('Nonsense_eSports', 'nonsense-esports', 'School', 'LDUFK School Cup 2026', 895, 0, '#facc15', 'Nonsense_eSports roster for LDUFK School Cup 2026.', true)
on conflict (slug) do update set name = excluded.name, division = excluded.division, org = excluded.org, color = excluded.color, summary = excluded.summary, published = true;

insert into public.teams (name, slug, division, org, points, trend, color, summary, published)
values ('VLMIA', 'vlmia', 'School', 'LDUFK School Cup 2026', 860, 0, '#a78bfa', 'VLMIA roster for LDUFK School Cup 2026.', true)
on conflict (slug) do update set name = excluded.name, division = excluded.division, org = excluded.org, color = excluded.color, summary = excluded.summary, published = true;

insert into public.teams (name, slug, division, org, points, trend, color, summary, published)
values ('Kostopil FireTeam', 'kostopil-fireteam', 'School', 'LDUFK School Cup 2026', 825, 0, '#fb923c', 'Kostopil FireTeam roster for LDUFK School Cup 2026.', true)
on conflict (slug) do update set name = excluded.name, division = excluded.division, org = excluded.org, color = excluded.color, summary = excluded.summary, published = true;

do $$
declare target_team uuid; target_player uuid;
begin
  select id into target_team from public.teams where slug = 's0mples';
  select id into target_player from public.players where lower(nick) = lower('Fintik') limit 1;
  if target_player is null then
    insert into public.players (team_id, nick, role, rating, published) values (target_team, 'Fintik', 'Rifler', 1.05, true);
  else
    update public.players set team_id = target_team, rating = 1.05, published = true where id = target_player;
  end if;
end $$;

do $$
declare target_team uuid; target_player uuid;
begin
  select id into target_team from public.teams where slug = 's0mples';
  select id into target_player from public.players where lower(nick) = lower('GODlike') limit 1;
  if target_player is null then
    insert into public.players (team_id, nick, role, rating, published) values (target_team, 'GODlike', 'Rifler', 1.32, true);
  else
    update public.players set team_id = target_team, rating = 1.32, published = true where id = target_player;
  end if;
end $$;

do $$
declare target_team uuid; target_player uuid;
begin
  select id into target_team from public.teams where slug = 's0mples';
  select id into target_player from public.players where lower(nick) = lower('forever') limit 1;
  if target_player is null then
    insert into public.players (team_id, nick, role, rating, published) values (target_team, 'forever', 'Rifler', 0.81, true);
  else
    update public.players set team_id = target_team, rating = 0.81, published = true where id = target_player;
  end if;
end $$;

do $$
declare target_team uuid; target_player uuid;
begin
  select id into target_team from public.teams where slug = 's0mples';
  select id into target_player from public.players where lower(nick) = lower('mar1k_ch') limit 1;
  if target_player is null then
    insert into public.players (team_id, nick, role, rating, published) values (target_team, 'mar1k_ch', 'Rifler', 0.53, true);
  else
    update public.players set team_id = target_team, rating = 0.53, published = true where id = target_player;
  end if;
end $$;

do $$
declare target_team uuid; target_player uuid;
begin
  select id into target_team from public.teams where slug = 's0mples';
  select id into target_player from public.players where lower(nick) = lower('windivatph') limit 1;
  if target_player is null then
    insert into public.players (team_id, nick, role, rating, published) values (target_team, 'windivatph', 'Rifler', 1.26, true);
  else
    update public.players set team_id = target_team, rating = 1.26, published = true where id = target_player;
  end if;
end $$;

do $$
declare target_team uuid; target_player uuid;
begin
  select id into target_team from public.teams where slug = 'koza4ku';
  select id into target_player from public.players where lower(nick) = lower('Cla1m') limit 1;
  if target_player is null then
    insert into public.players (team_id, nick, role, rating, published) values (target_team, 'Cla1m', 'Rifler', 1.36, true);
  else
    update public.players set team_id = target_team, rating = 1.36, published = true where id = target_player;
  end if;
end $$;

do $$
declare target_team uuid; target_player uuid;
begin
  select id into target_team from public.teams where slug = 'koza4ku';
  select id into target_player from public.players where lower(nick) = lower('Dand_s') limit 1;
  if target_player is null then
    insert into public.players (team_id, nick, role, rating, published) values (target_team, 'Dand_s', 'Rifler', 0.95, true);
  else
    update public.players set team_id = target_team, rating = 0.95, published = true where id = target_player;
  end if;
end $$;

do $$
declare target_team uuid; target_player uuid;
begin
  select id into target_team from public.teams where slug = 'koza4ku';
  select id into target_player from public.players where lower(nick) = lower('Flaik1ch') limit 1;
  if target_player is null then
    insert into public.players (team_id, nick, role, rating, published) values (target_team, 'Flaik1ch', 'Rifler', 0.95, true);
  else
    update public.players set team_id = target_team, rating = 0.95, published = true where id = target_player;
  end if;
end $$;

do $$
declare target_team uuid; target_player uuid;
begin
  select id into target_team from public.teams where slug = 'koza4ku';
  select id into target_player from public.players where lower(nick) = lower('Kyos666') limit 1;
  if target_player is null then
    insert into public.players (team_id, nick, role, rating, published) values (target_team, 'Kyos666', 'Rifler', 1.43, true);
  else
    update public.players set team_id = target_team, rating = 1.43, published = true where id = target_player;
  end if;
end $$;

do $$
declare target_team uuid; target_player uuid;
begin
  select id into target_team from public.teams where slug = 'koza4ku';
  select id into target_player from public.players where lower(nick) = lower('Quer1ann') limit 1;
  if target_player is null then
    insert into public.players (team_id, nick, role, rating, published) values (target_team, 'Quer1ann', 'Rifler', 0.92, true);
  else
    update public.players set team_id = target_team, rating = 0.92, published = true where id = target_player;
  end if;
end $$;

do $$
declare target_team uuid; target_player uuid;
begin
  select id into target_team from public.teams where slug = 'koza4ku';
  select id into target_player from public.players where lower(nick) = lower('Yarem1ch') limit 1;
  if target_player is null then
    insert into public.players (team_id, nick, role, rating, published) values (target_team, 'Yarem1ch', 'Rifler', 0.59, true);
  else
    update public.players set team_id = target_team, rating = 0.59, published = true where id = target_player;
  end if;
end $$;

do $$
declare target_team uuid; target_player uuid;
begin
  select id into target_team from public.teams where slug = 'koza4ku';
  select id into target_player from public.players where lower(nick) = lower('m1quse') limit 1;
  if target_player is null then
    insert into public.players (team_id, nick, role, rating, published) values (target_team, 'm1quse', 'Rifler', 0.75, true);
  else
    update public.players set team_id = target_team, rating = 0.75, published = true where id = target_player;
  end if;
end $$;

do $$
declare target_team uuid; target_player uuid;
begin
  select id into target_team from public.teams where slug = 'koza4ku';
  select id into target_player from public.players where lower(nick) = lower('morex666') limit 1;
  if target_player is null then
    insert into public.players (team_id, nick, role, rating, published) values (target_team, 'morex666', 'Rifler', 1.08, true);
  else
    update public.players set team_id = target_team, rating = 1.08, published = true where id = target_player;
  end if;
end $$;

do $$
declare target_team uuid; target_player uuid;
begin
  select id into target_team from public.teams where slug = 'koza4ku';
  select id into target_player from public.players where lower(nick) = lower('mrfliyyy') limit 1;
  if target_player is null then
    insert into public.players (team_id, nick, role, rating, published) values (target_team, 'mrfliyyy', 'Rifler', 0.95, true);
  else
    update public.players set team_id = target_team, rating = 0.95, published = true where id = target_player;
  end if;
end $$;

do $$
declare target_team uuid; target_player uuid;
begin
  select id into target_team from public.teams where slug = 'koza4ku';
  select id into target_player from public.players where lower(nick) = lower('zhoha') limit 1;
  if target_player is null then
    insert into public.players (team_id, nick, role, rating, published) values (target_team, 'zhoha', 'Rifler', 0.71, true);
  else
    update public.players set team_id = target_team, rating = 0.71, published = true where id = target_player;
  end if;
end $$;

do $$
declare target_team uuid; target_player uuid;
begin
  select id into target_team from public.teams where slug = 'prestige';
  select id into target_player from public.players where lower(nick) = lower('Dand_s') limit 1;
  if target_player is null then
    insert into public.players (team_id, nick, role, rating, published) values (target_team, 'Dand_s', 'Rifler', 0.95, true);
  else
    update public.players set team_id = target_team, rating = 0.95, published = true where id = target_player;
  end if;
end $$;

do $$
declare target_team uuid; target_player uuid;
begin
  select id into target_team from public.teams where slug = 'prestige';
  select id into target_player from public.players where lower(nick) = lower('Flaik1ch') limit 1;
  if target_player is null then
    insert into public.players (team_id, nick, role, rating, published) values (target_team, 'Flaik1ch', 'Rifler', 0.95, true);
  else
    update public.players set team_id = target_team, rating = 0.95, published = true where id = target_player;
  end if;
end $$;

do $$
declare target_team uuid; target_player uuid;
begin
  select id into target_team from public.teams where slug = 'prestige';
  select id into target_player from public.players where lower(nick) = lower('Quer1ann') limit 1;
  if target_player is null then
    insert into public.players (team_id, nick, role, rating, published) values (target_team, 'Quer1ann', 'Rifler', 0.92, true);
  else
    update public.players set team_id = target_team, rating = 0.92, published = true where id = target_player;
  end if;
end $$;

do $$
declare target_team uuid; target_player uuid;
begin
  select id into target_team from public.teams where slug = 'prestige';
  select id into target_player from public.players where lower(nick) = lower('mrfliyyy') limit 1;
  if target_player is null then
    insert into public.players (team_id, nick, role, rating, published) values (target_team, 'mrfliyyy', 'Rifler', 0.95, true);
  else
    update public.players set team_id = target_team, rating = 0.95, published = true where id = target_player;
  end if;
end $$;

do $$
declare target_team uuid; target_player uuid;
begin
  select id into target_team from public.teams where slug = 'prestige';
  select id into target_player from public.players where lower(nick) = lower('zhoha') limit 1;
  if target_player is null then
    insert into public.players (team_id, nick, role, rating, published) values (target_team, 'zhoha', 'Rifler', 0.71, true);
  else
    update public.players set team_id = target_team, rating = 0.71, published = true where id = target_player;
  end if;
end $$;

do $$
declare target_team uuid; target_player uuid;
begin
  select id into target_team from public.teams where slug = 'nonsense-esports';
  select id into target_player from public.players where lower(nick) = lower('FUGA228') limit 1;
  if target_player is null then
    insert into public.players (team_id, nick, role, rating, published) values (target_team, 'FUGA228', 'Rifler', 0.69, true);
  else
    update public.players set team_id = target_team, rating = 0.69, published = true where id = target_player;
  end if;
end $$;

do $$
declare target_team uuid; target_player uuid;
begin
  select id into target_team from public.teams where slug = 'nonsense-esports';
  select id into target_player from public.players where lower(nick) = lower('Goldmay') limit 1;
  if target_player is null then
    insert into public.players (team_id, nick, role, rating, published) values (target_team, 'Goldmay', 'Rifler', 1.32, true);
  else
    update public.players set team_id = target_team, rating = 1.32, published = true where id = target_player;
  end if;
end $$;

do $$
declare target_team uuid; target_player uuid;
begin
  select id into target_team from public.teams where slug = 'nonsense-esports';
  select id into target_player from public.players where lower(nick) = lower('awuxm') limit 1;
  if target_player is null then
    insert into public.players (team_id, nick, role, rating, published) values (target_team, 'awuxm', 'Rifler', 0.90, true);
  else
    update public.players set team_id = target_team, rating = 0.90, published = true where id = target_player;
  end if;
end $$;

do $$
declare target_team uuid; target_player uuid;
begin
  select id into target_team from public.teams where slug = 'nonsense-esports';
  select id into target_player from public.players where lower(nick) = lower('sh4d3') limit 1;
  if target_player is null then
    insert into public.players (team_id, nick, role, rating, published) values (target_team, 'sh4d3', 'Rifler', 1.24, true);
  else
    update public.players set team_id = target_team, rating = 1.24, published = true where id = target_player;
  end if;
end $$;

do $$
declare target_team uuid; target_player uuid;
begin
  select id into target_team from public.teams where slug = 'nonsense-esports';
  select id into target_player from public.players where lower(nick) = lower('sp5ider') limit 1;
  if target_player is null then
    insert into public.players (team_id, nick, role, rating, published) values (target_team, 'sp5ider', 'Rifler', 0.92, true);
  else
    update public.players set team_id = target_team, rating = 0.92, published = true where id = target_player;
  end if;
end $$;

do $$
declare target_team uuid; target_player uuid;
begin
  select id into target_team from public.teams where slug = 'vlmia';
  select id into target_player from public.players where lower(nick) = lower('Klin') limit 1;
  if target_player is null then
    insert into public.players (team_id, nick, role, rating, published) values (target_team, 'Klin', 'Rifler', 1.04, true);
  else
    update public.players set team_id = target_team, rating = 1.04, published = true where id = target_player;
  end if;
end $$;

do $$
declare target_team uuid; target_player uuid;
begin
  select id into target_team from public.teams where slug = 'vlmia';
  select id into target_player from public.players where lower(nick) = lower('TheEvilBoys') limit 1;
  if target_player is null then
    insert into public.players (team_id, nick, role, rating, published) values (target_team, 'TheEvilBoys', 'Rifler', 0.96, true);
  else
    update public.players set team_id = target_team, rating = 0.96, published = true where id = target_player;
  end if;
end $$;

do $$
declare target_team uuid; target_player uuid;
begin
  select id into target_team from public.teams where slug = 'vlmia';
  select id into target_player from public.players where lower(nick) = lower('_ome1ya17_') limit 1;
  if target_player is null then
    insert into public.players (team_id, nick, role, rating, published) values (target_team, '_ome1ya17_', 'Rifler', 0.72, true);
  else
    update public.players set team_id = target_team, rating = 0.72, published = true where id = target_player;
  end if;
end $$;

do $$
declare target_team uuid; target_player uuid;
begin
  select id into target_team from public.teams where slug = 'vlmia';
  select id into target_player from public.players where lower(nick) = lower('manrase2') limit 1;
  if target_player is null then
    insert into public.players (team_id, nick, role, rating, published) values (target_team, 'manrase2', 'Rifler', 0.91, true);
  else
    update public.players set team_id = target_team, rating = 0.91, published = true where id = target_player;
  end if;
end $$;

do $$
declare target_team uuid; target_player uuid;
begin
  select id into target_team from public.teams where slug = 'vlmia';
  select id into target_player from public.players where lower(nick) = lower('s0lanaflip3r') limit 1;
  if target_player is null then
    insert into public.players (team_id, nick, role, rating, published) values (target_team, 's0lanaflip3r', 'Rifler', 1.09, true);
  else
    update public.players set team_id = target_team, rating = 1.09, published = true where id = target_player;
  end if;
end $$;

do $$
declare target_team uuid; target_player uuid;
begin
  select id into target_team from public.teams where slug = 'kostopil-fireteam';
  select id into target_player from public.players where lower(nick) = lower('-1rix') limit 1;
  if target_player is null then
    insert into public.players (team_id, nick, role, rating, published) values (target_team, '-1rix', 'Rifler', 1.07, true);
  else
    update public.players set team_id = target_team, rating = 1.07, published = true where id = target_player;
  end if;
end $$;

do $$
declare target_team uuid; target_player uuid;
begin
  select id into target_team from public.teams where slug = 'kostopil-fireteam';
  select id into target_player from public.players where lower(nick) = lower('Arsen_Bakin') limit 1;
  if target_player is null then
    insert into public.players (team_id, nick, role, rating, published) values (target_team, 'Arsen_Bakin', 'Rifler', 0.56, true);
  else
    update public.players set team_id = target_team, rating = 0.56, published = true where id = target_player;
  end if;
end $$;

do $$
declare target_team uuid; target_player uuid;
begin
  select id into target_team from public.teams where slug = 'kostopil-fireteam';
  select id into target_player from public.players where lower(nick) = lower('BambooFury') limit 1;
  if target_player is null then
    insert into public.players (team_id, nick, role, rating, published) values (target_team, 'BambooFury', 'Rifler', 0.79, true);
  else
    update public.players set team_id = target_team, rating = 0.79, published = true where id = target_player;
  end if;
end $$;

do $$
declare target_team uuid; target_player uuid;
begin
  select id into target_team from public.teams where slug = 'kostopil-fireteam';
  select id into target_player from public.players where lower(nick) = lower('Snapcake') limit 1;
  if target_player is null then
    insert into public.players (team_id, nick, role, rating, published) values (target_team, 'Snapcake', 'Rifler', 0.54, true);
  else
    update public.players set team_id = target_team, rating = 0.54, published = true where id = target_player;
  end if;
end $$;

do $$
declare target_team uuid; target_player uuid;
begin
  select id into target_team from public.teams where slug = 'kostopil-fireteam';
  select id into target_player from public.players where lower(nick) = lower('monte666') limit 1;
  if target_player is null then
    insert into public.players (team_id, nick, role, rating, published) values (target_team, 'monte666', 'Rifler', 0.78, true);
  else
    update public.players set team_id = target_team, rating = 0.78, published = true where id = target_player;
  end if;
end $$;

commit;
