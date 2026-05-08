-- LDUFK League content update.
-- Run this in Supabase SQL Editor to add/update demo news and the 2026 tournament calendar.

alter table public.tournaments
add column if not exists featured_home boolean not null default false;

create table if not exists public.homepage_champions (
  id uuid primary key default gen_random_uuid(),
  slot text not null unique check (slot in ('University', 'School')),
  team_name text not null,
  tournament_name text not null,
  date_label text not null,
  division_label text not null,
  image_url text,
  details_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.homepage_champions enable row level security;

grant select on public.homepage_champions to anon, authenticated;

drop policy if exists "Public can read homepage champions" on public.homepage_champions;
create policy "Public can read homepage champions"
on public.homepage_champions for select
to anon, authenticated
using (true);

drop policy if exists "Admins can write homepage champions" on public.homepage_champions;
create policy "Admins can write homepage champions"
on public.homepage_champions for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into public.homepage_champions
  (slot, team_name, tournament_name, date_label, division_label, image_url, details_url)
values
  ('University', 'LDUFK Alpha', 'LDUFK University Spring Open 2026', 'Весна 2026', 'University', '/assets/winners-hero.png', '/tournaments/university-spring-open-2026'),
  ('School', 'Lyceum 8 Wolves', 'LDUFK School Spring Open 2026', 'Весна 2026', 'School', '/assets/winners-hero.png', '/tournaments/school-spring-open-2026')
on conflict (slot) do update set
  team_name = excluded.team_name,
  tournament_name = excluded.tournament_name,
  date_label = excluded.date_label,
  division_label = excluded.division_label,
  image_url = excluded.image_url,
  details_url = excluded.details_url;

insert into public.tournaments
  (slug, name, division, type, date_label, status, teams_count, points, prize, format, description, participants, featured_home, published, created_at)
values
  ('school-spring-open-2026', 'LDUFK School Spring Open 2026', 'School', 'online', 'Весна 2026', 'done', 16, 'LDUFK Points', 'Points + seed', 'Faceit Online', 'Відкритий весняний турнір School League.', '{}', true, true, '2026-02-01 10:00:00+00'),
  ('school-spring-rivals-2026', 'LDUFK School Spring Rivals 2026', 'School', 'online', 'Весна 2026', 'live', 16, 'LDUFK Points', 'Points + seed', 'Faceit Online', 'Rivals-турнір для команд School League.', '{}', false, true, '2026-02-02 10:00:00+00'),
  ('school-winter-open-2026', 'LDUFK School Winter Open 2026', 'School', 'online', 'Зима 2026', 'soon', 16, 'LDUFK Points', 'Points + seed', 'Faceit Online', 'Зимовий відкритий турнір School League.', '{}', false, true, '2026-02-03 10:00:00+00'),
  ('school-winter-rivals-2026', 'LDUFK School Winter Rivals 2026', 'School', 'online', 'Зима 2026', 'soon', 16, 'LDUFK Points', 'Points + seed', 'Faceit Online', 'Зимовий Rivals-турнір School League.', '{}', false, true, '2026-02-04 10:00:00+00'),
  ('school-bounty-2026', 'LDUFK School Bounty 2026', 'School', 'online', '2026', 'live', 16, 'LDUFK Points', 'Bounty points', 'Faceit Online', 'Bounty-формат для команд School League.', '{}', false, true, '2026-02-05 10:00:00+00'),
  ('school-finals-2026', 'LDUFK School Finals 2026', 'School', 'lan', 'Травень 2026', 'soon', 8, 'LDUFK Points', 'LAN Finals seed', 'LAN Finals', 'Фінальний LAN-турнір School League.', '{}', false, true, '2026-02-06 10:00:00+00'),
  ('university-spring-open-2026', 'LDUFK University Spring Open 2026', 'University', 'online', 'Весна 2026', 'done', 24, 'LDUFK Points', 'Points + seed', 'Faceit Online', 'Відкритий весняний турнір University League.', '{}', true, true, '2026-02-07 10:00:00+00'),
  ('university-spring-rivals-2026', 'LDUFK University Spring Rivals 2026', 'University', 'online', 'Весна 2026', 'live', 24, 'LDUFK Points', 'Points + seed', 'Faceit Online', 'Rivals-турнір для команд University League.', '{}', false, true, '2026-02-08 10:00:00+00'),
  ('university-winter-open-2026', 'LDUFK University Winter Open 2026', 'University', 'online', 'Зима 2026', 'soon', 24, 'LDUFK Points', 'Points + seed', 'Faceit Online', 'Зимовий відкритий турнір University League.', '{}', false, true, '2026-02-09 10:00:00+00'),
  ('university-winter-rivals-2026', 'LDUFK University Winter Rivals 2026', 'University', 'online', 'Зима 2026', 'soon', 24, 'LDUFK Points', 'Points + seed', 'Faceit Online', 'Зимовий Rivals-турнір University League.', '{}', false, true, '2026-02-10 10:00:00+00'),
  ('university-bounty-2026', 'LDUFK University Bounty 2026', 'University', 'online', '2026', 'live', 24, 'LDUFK Points', 'Bounty points', 'Faceit Online', 'Bounty-формат для команд University League.', '{}', false, true, '2026-02-11 10:00:00+00'),
  ('university-finals-2026', 'LDUFK University Finals 2026', 'University', 'lan', 'Травень 2026', 'soon', 8, 'LDUFK Points', 'LAN Finals seed', 'LAN Finals', 'Фінальний LAN-турнір University League.', '{}', false, true, '2026-02-12 10:00:00+00')
on conflict (slug) do update set
  name = excluded.name,
  division = excluded.division,
  type = excluded.type,
  date_label = excluded.date_label,
  status = excluded.status,
  teams_count = excluded.teams_count,
  points = excluded.points,
  prize = excluded.prize,
  format = excluded.format,
  description = excluded.description,
  participants = excluded.participants,
  featured_home = excluded.featured_home,
  published = excluded.published;

update public.tournaments
set winner_team_id = (select id from public.teams where slug = 'ldufk-alpha')
where slug = 'university-spring-open-2026';

update public.tournaments
set winner_team_id = (select id from public.teams where slug = 'lyceum-8-wolves')
where slug = 'school-spring-open-2026';

insert into public.news
  (slug, title, tag, excerpt, body, image_url, published, published_at)
values
  ('school-finals-registration-2026', 'Відкрито реєстрацію на School Finals 2026', 'registration', 'Команди School League можуть подати заявку на фінальний LAN-етап.', 'LDUFK League відкриває реєстрацію на School Finals 2026. Участь отримають найсильніші команди сезону за рейтингом LDUFK Points.', null, true, '2026-05-01 10:00:00+00'),
  ('university-finals-registration-2026', 'Відкрито реєстрацію на University Finals 2026', 'registration', 'Університетські команди стартують шлях до фінального LAN-етапу.', 'University Finals 2026 стане головною подією сезону для команд університетського дивізіону.', null, true, '2026-04-30 10:00:00+00'),
  ('school-bounty-announced-2026', 'Анонсовано LDUFK School Bounty 2026', 'announcement', 'Bounty-формат додасть більше очок і прямих дуелей у School League.', 'School Bounty 2026 створений для команд, які хочуть швидко піднятися в рейтингу перед фінальним етапом.', null, true, '2026-04-29 10:00:00+00'),
  ('university-bounty-announced-2026', 'Анонсовано LDUFK University Bounty 2026', 'announcement', 'Новий bounty-турнір для University League з очками LDUFK Points.', 'University Bounty 2026 допоможе командам закріпити позиції перед LAN Finals.', null, true, '2026-04-28 10:00:00+00'),
  ('spring-open-recap-2026', 'Spring Open 2026: підсумки першого етапу', 'recap', 'Перші турніри сезону сформували стартову сітку рейтингу.', 'Spring Open 2026 задав темп сезону: команди отримали перші LDUFK Points і почали боротьбу за топ-4.', null, true, '2026-04-27 10:00:00+00'),
  ('spring-rivals-preview-2026', 'Spring Rivals 2026: головні матчі попереду', 'preview', 'Rivals-формат сфокусований на матчах команд близького рівня.', 'Spring Rivals 2026 стане перевіркою форми для команд, які претендують на LAN Invite.', null, true, '2026-04-26 10:00:00+00'),
  ('winter-open-announced-2026', 'Winter Open 2026 додано в календар', 'calendar', 'Зимовий етап зʼявився у календарі School та University League.', 'Winter Open 2026 стане важливою точкою сезону для команд, які хочуть повернутись у топ рейтингу.', null, true, '2026-04-25 10:00:00+00'),
  ('winter-rivals-announced-2026', 'Winter Rivals 2026 отримав слот у сезоні', 'calendar', 'Rivals-етап повернеться у зимовій частині сезону.', 'Winter Rivals 2026 збере команди з близькими позиціями в рейтингу LDUFK Points.', null, true, '2026-04-24 10:00:00+00'),
  ('lan-invite-race-2026', 'Боротьба за LAN Invite посилюється', 'ranking', 'Топ-4 кожного дивізіону залишаються головною ціллю сезону.', 'Команди University і School Division продовжують набирати очки для прямого запрошення на LAN Finals.', null, true, '2026-04-23 10:00:00+00'),
  ('player-watch-april-2026', 'Player Watch: найстабільніші гравці квітня', 'players', 'Рейтинг 3.0 допомагає краще бачити форму гравців.', 'LDUFK League оновлює Player Watch за підсумками останніх матчів і турнірів.', null, true, '2026-04-22 10:00:00+00'),
  ('school-ranking-update-april-2026', 'School Ranking: оновлення таблиці', 'ranking', 'School Division отримав нові зміни після останнього ігрового тижня.', 'Оновлення рейтингу враховує результати останніх матчів і активність команд.', null, true, '2026-04-21 10:00:00+00'),
  ('university-ranking-update-april-2026', 'University Ranking: оновлення таблиці', 'ranking', 'University Division продовжує боротьбу за топ-4.', 'Команди університетського дивізіону наближаються до вирішального відрізку сезону.', null, true, '2026-04-20 10:00:00+00'),
  ('format-guide-ldufk-points-2026', 'Як працюють LDUFK Points', 'rules', 'Очки формують рейтинг і впливають на шлях до LAN Finals.', 'LDUFK Points нараховуються за результати турнірів, стабільність виступів і позицію команди в сезоні.', null, true, '2026-04-19 10:00:00+00'),
  ('faceit-online-format-2026', 'Faceit Online стане базовим форматом сезону', 'format', 'Online-етапи проходитимуть через Faceit.', 'Faceit Online дозволяє швидко проводити матчі між навчальними закладами з різних міст.', null, true, '2026-04-18 10:00:00+00'),
  ('finals-roadmap-2026', 'Шлях до Finals 2026', 'calendar', 'Календар сезону вже містить Open, Rivals, Bounty і Finals.', 'Команди можуть планувати сезон заздалегідь: кожен етап має свою роль у рейтингу.', null, true, '2026-04-17 10:00:00+00'),
  ('teams-profile-update-2026', 'Профілі команд оновлено', 'teams', 'Команди можуть мати логотип, опис, roster і рейтинг.', 'Профіль команди тепер краще показує склад, очки і актуальну форму.', null, true, '2026-04-16 10:00:00+00'),
  ('news-section-expanded-2026', 'Новинний розділ розширено', 'site', 'У розділі новин буде доступно до 20 останніх постів.', 'LDUFK League розширює новинний блок для анонсів, підсумків і оновлень рейтингу.', null, true, '2026-04-15 10:00:00+00'),
  ('admin-content-workflow-2026', 'Контент можна оновлювати через адмінку', 'admin', 'Команди, гравці, новини і турніри редагуються без коду.', 'Закрита адмінка дозволяє швидко оновлювати сайт без роботи з GitHub для кожної зміни.', null, true, '2026-04-14 10:00:00+00')
on conflict (slug) do update set
  title = excluded.title,
  tag = excluded.tag,
  excerpt = excluded.excerpt,
  body = excluded.body,
  image_url = excluded.image_url,
  published = excluded.published,
  published_at = excluded.published_at;
