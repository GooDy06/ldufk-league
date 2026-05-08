-- Optional demo data. Run after schema.sql.

insert into public.teams (name, slug, division, org, points, trend, color, summary, published)
values
  ('LDUFK Alpha', 'ldufk-alpha', 'University', 'ЛДУФК', 1840, 0, '#0ea5e9', 'Чемпіон University Spring Open 2026.', true),
  ('Polytechnica ESC', 'polytechnica-esc', 'University', 'НУ "Львівська Політехніка"', 1620, 1, '#6366f1', 'Стабільний претендент на LAN Finals.', true),
  ('LNU Foxes', 'lnu-foxes', 'University', 'ЛНУ ім. І. Франка', 1490, -1, '#ec4899', 'Команда з сильним AWP-ядром.', true),
  ('Lyceum 8 Wolves', 'lyceum-8-wolves', 'School', 'Ліцей №8 (Львів)', 1760, 0, '#a78bfa', 'Чемпіон School Spring Open 2026.', true),
  ('School 45 Rush', 'school-45-rush', 'School', 'ЗОШ №45 (Львів)', 1590, 1, '#f472b6', 'Агресивний стиль і швидкі раунди.', true),
  ('Lyceum IT Stars', 'lyceum-it-stars', 'School', 'Ліцей "Престиж" (Львів)', 1430, 2, '#fbbf24', 'Технічна команда шкільного дивізіону.', true)
on conflict (slug) do nothing;

insert into public.players (team_id, nick, role, rating, published)
select id, 's1ren', 'Entry', 1.34, true from public.teams where slug = 'ldufk-alpha'
union all select id, 'polyX', 'Entry', 1.24, true from public.teams where slug = 'polytechnica-esc'
union all select id, 'f0xxie', 'AWP', 1.21, true from public.teams where slug = 'lnu-foxes'
union all select id, 'fang_', 'AWP', 1.29, true from public.teams where slug = 'lyceum-8-wolves'
union all select id, 'rush_1', 'Entry', 1.18, true from public.teams where slug = 'school-45-rush';

insert into public.news (slug, title, tag, excerpt, body, image_url, published, published_at)
values
  ('lan-finals-may', 'LDUFK Finals 2026 пройдуть у Львові', 'lan', 'University та School Division отримають окремі LAN-фінали.', 'LAN Finals стане центральною подією сезону LDUFK League.', '/assets/winners-hero.png', true, now()),
  ('ldufk-alpha-win', 'LDUFK Alpha виграє University Spring Open', 'res', 'Команда ЛДУФК очолила рейтинг сезону.', 'LDUFK Alpha закрила фінал 2:0 і отримала перші великі очки сезону.', '/assets/winners-hero.png', true, now())
on conflict (slug) do nothing;

insert into public.tournaments (slug, name, division, type, date_label, status, teams_count, winner_team_id, points, prize, format, description, participants, banner_url, published)
select 'university-spring-open-2026', 'LDUFK University Spring Open 2026', 'University', 'online', 'Лютий 2026', 'done', 16, id, '150 LDUFK Points переможцю', 'Рейтингові очки', 'Single Elimination BO1, BO3 фінал', 'Стартовий тур університетського сезону.', array['LDUFK Alpha','Polytechnica ESC','LNU Foxes'], '/assets/winners-hero.png', true
from public.teams where slug = 'ldufk-alpha'
on conflict (slug) do nothing;

insert into public.tournaments (slug, name, division, type, date_label, status, teams_count, winner_team_id, points, prize, format, description, participants, banner_url, published)
select 'school-spring-open-2026', 'LDUFK School Spring Open 2026', 'School', 'online', 'Лютий 2026', 'done', 16, id, '150 LDUFK Points переможцю', 'Рейтингові очки', 'Single Elimination BO1, BO3 фінал', 'Стартовий тур шкільного сезону.', array['Lyceum 8 Wolves','School 45 Rush','Lyceum IT Stars'], '/assets/winners-hero.png', true
from public.teams where slug = 'lyceum-8-wolves'
on conflict (slug) do nothing;
