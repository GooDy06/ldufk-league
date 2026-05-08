import Link from "next/link";
import type { Team, Tournament, NewsItem } from "@/lib/types";

export function HeroTitle() {
  return (
    <section className="py-8 text-center">
      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.22em] text-accent">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        Сезон 2026 · Активний
      </div>
      <h1 className="font-rajdhani text-5xl font-bold tracking-[0.08em] md:text-6xl">
        LDUFK <span className="text-accent">CS2</span> League
      </h1>
      <p className="mx-auto mt-3 max-w-3xl text-base tracking-wide text-slate-400">
        Офіційний портал університетської та шкільної кіберспортивної ліги України
      </p>
    </section>
  );
}

export function Panel({
  eyebrow,
  title,
  children,
  action
}: {
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          {eyebrow ? <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">{eyebrow}</div> : null}
          <h2 className="font-rajdhani text-xl font-bold tracking-wide">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function TeamRow({ team, index }: { team: Team; index: number }) {
  return (
    <Link
      href={`/teams/${team.slug}`}
      className="grid grid-cols-[34px_34px_1fr_auto] items-center gap-3 rounded-xl border border-line bg-surface2 p-3 transition hover:border-accent/40"
    >
      <div className="font-rajdhani text-xl font-bold text-gold">{index + 1}</div>
      <div className="grid h-9 w-9 place-items-center rounded-lg text-xs font-bold" style={{ background: `${team.color}22`, color: team.color }}>
        {team.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 3)}
      </div>
      <div>
        <div className="font-bold">{team.name}</div>
        <div className="text-xs text-slate-500">{team.org}</div>
      </div>
      <div className="font-rajdhani text-lg font-bold">{team.points}</div>
    </Link>
  );
}

export function ChampionCard({ tournament }: { tournament: Tournament }) {
  return (
    <article className="grid gap-4 rounded-2xl border border-line bg-surface p-4 md:grid-cols-[190px_1fr]">
      <div
        className="min-h-32 rounded-xl border border-white/10 bg-cover bg-center"
        style={{ backgroundImage: `url(${tournament.banner_url || "/assets/winners-hero.png"})` }}
      />
      <div className="flex flex-col gap-3">
        <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">Переможець {tournament.division} Division</div>
        <div>
          <h3 className="font-rajdhani text-2xl font-bold">{tournament.winner?.name || "Буде визначено"}</h3>
          <p className="text-sm text-slate-500">{tournament.name}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-lg border border-line bg-surface2 p-3">
            <span className="block text-[10px] uppercase tracking-widest text-slate-500">Дата</span>
            <strong>{tournament.date_label}</strong>
          </div>
          <div className="rounded-lg border border-line bg-surface2 p-3">
            <span className="block text-[10px] uppercase tracking-widest text-slate-500">Дивізіон</span>
            <strong>{tournament.division}</strong>
          </div>
        </div>
        <Link href={`/tournaments/${tournament.slug}`} className="rounded-lg bg-accent px-4 py-2 text-center font-bold text-bg">
          Детальніше
        </Link>
      </div>
    </article>
  );
}

export function NewsCard({ item }: { item: NewsItem }) {
  return (
    <Link href={`/news/${item.slug}`} className="overflow-hidden rounded-2xl border border-line bg-surface transition hover:border-accent/40">
      <div
        className="h-32 border-b border-line bg-cover bg-center"
        style={{ backgroundImage: `url(${item.image_url || "/assets/winners-hero.png"})` }}
      />
      <div className="p-4">
        <div className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-accent">{item.tag}</div>
        <h3 className="font-bold leading-snug">{item.title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">{item.excerpt}</p>
      </div>
    </Link>
  );
}
