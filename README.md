# LDUFK League

Next.js + Tailwind + Supabase version of the LDUFK League portal.

## Routes

Public:

- `/`
- `/ranking`
- `/teams/[slug]`
- `/news`
- `/news/[slug]`
- `/tournaments`
- `/tournaments/[slug]`

Admin:

- `/admin`
- `/admin/teams`
- `/admin/news`
- `/admin/tournaments`
- `/admin/players`

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

3. Fill:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ADMIN_EMAIL=your@email.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. In Supabase SQL Editor:

- run `supabase/schema.sql`
- replace `ВСТАВ_ТУТ_СВІЙ_EMAIL` with the same admin email before running
- optionally run `supabase/seed.sql`

5. In Supabase Auth settings, add redirect URL:

```text
http://localhost:3000/auth/callback
```

For production, also add:

```text
https://your-domain.com/auth/callback
```

6. Run:

```bash
npm run dev
```

## Admin Access

The UI protects `/admin/*` through middleware using `ADMIN_EMAIL`.

The database protects writes through Row Level Security:

- public users can only read `published = true`
- only emails in `public.admin_users` can insert/update/delete

## Publishing

In the admin forms, use the `Published` checkbox:

- checked: visible on public site
- unchecked: draft, visible only to admin
