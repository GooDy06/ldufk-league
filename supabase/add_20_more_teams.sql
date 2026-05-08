-- Add 10 University teams and 10 School teams.
-- Paste this into Supabase SQL Editor and press Run.

insert into public.teams (name, slug, division, org, points, trend, color, summary, published)
values
  -- University Division
  ('KPI Cyber Squad', 'kpi-cyber-squad', 'University', 'КПІ ім. Ігоря Сікорського', 1380, 2, '#38bdf8', 'Київська команда з сильним mid-round стилем.', true),
  ('KNU Titans', 'knu-titans', 'University', 'КНУ ім. Тараса Шевченка', 1345, 1, '#f97316', 'Стабільний склад з акцентом на командні виходи.', true),
  ('KhPI Phoenix', 'khpi-phoenix', 'University', 'НТУ "ХПІ"', 1310, -1, '#ef4444', 'Команда з Харкова, яка добре грає retake-ситуації.', true),
  ('NaUKMA Saints', 'naukma-saints', 'University', 'НаУКМА', 1275, 0, '#22c55e', 'Дисциплінований склад з сильним utility usage.', true),
  ('ONPU Storm', 'onpu-storm', 'University', 'Одеська політехніка', 1240, 1, '#06b6d4', 'Темпова команда з агресивними pistol rounds.', true),
  ('UCU Lions', 'ucu-lions', 'University', 'Український католицький університет', 1215, 0, '#eab308', 'Команда з хорошою структурою і стабільним rifling.', true),
  ('DNU Sharks', 'dnu-sharks', 'University', 'ДНУ ім. Олеся Гончара', 1180, -2, '#0ea5e9', 'Прагматичний стиль з фокусом на late-round calls.', true),
  ('VNTU Volt', 'vntu-volt', 'University', 'ВНТУ', 1155, 1, '#8b5cf6', 'Молода команда з високим темпом на T-side.', true),
  ('CHNU Owls', 'chnu-owls', 'University', 'ЧНУ ім. Юрія Федьковича', 1120, 0, '#14b8a6', 'Склад, який часто здивовує нестандартними setups.', true),
  ('TNPU Falcons', 'tnpu-falcons', 'University', 'ТНПУ ім. В. Гнатюка', 1095, 2, '#f43f5e', 'Команда, що поступово піднімається в рейтингу.', true),

  -- School Division
  ('Lyceum 23 Aces', 'lyceum-23-aces', 'School', 'Ліцей №23', 1410, 1, '#60a5fa', 'Сильна шкільна команда з хорошою першою картою.', true),
  ('Gymnasium 4 Nova', 'gymnasium-4-nova', 'School', 'Гімназія №4', 1375, 0, '#a78bfa', 'Стабільний склад з якісною комунікацією.', true),
  ('School 12 Eagles', 'school-12-eagles', 'School', 'ЗОШ №12', 1330, -1, '#fb7185', 'Команда з агресивним entry-підходом.', true),
  ('Lyceum 66 Core', 'lyceum-66-core', 'School', 'Ліцей №66', 1290, 2, '#34d399', 'Вміють швидко адаптуватись між картами.', true),
  ('School 91 Pulse', 'school-91-pulse', 'School', 'ЗОШ №91', 1255, 1, '#facc15', 'Команда з хорошим clutch-потенціалом.', true),
  ('Academic Wolves', 'academic-wolves', 'School', 'Академічний ліцей', 1220, 0, '#38bdf8', 'Стриманий стиль і сильна CT-side дисципліна.', true),
  ('IT Lyceum Nova', 'it-lyceum-nova', 'School', 'IT Ліцей', 1185, -2, '#818cf8', 'Молода команда з перспективними aim-гравцями.', true),
  ('School 7 Inferno', 'school-7-inferno', 'School', 'ЗОШ №7', 1150, 1, '#f97316', 'Добре почуваються на швидких картах.', true),
  ('Lyceum 31 Mirage', 'lyceum-31-mirage', 'School', 'Ліцей №31', 1115, 0, '#2dd4bf', 'Команда з фокусом на defaults і map control.', true),
  ('Gymnasium 2 Force', 'gymnasium-2-force', 'School', 'Гімназія №2', 1080, 2, '#ec4899', 'Новачки рейтингу, які швидко набирають форму.', true)
on conflict (slug) do update set
  name = excluded.name,
  division = excluded.division,
  org = excluded.org,
  points = excluded.points,
  trend = excluded.trend,
  color = excluded.color,
  summary = excluded.summary,
  published = excluded.published,
  updated_at = now();
