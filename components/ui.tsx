import Link from "next/link";
import type { HomepageChampion, Team, Tournament, NewsItem } from "@/lib/types";

function formatNewsDate(value: string | null) {
  if (!value) return "Дата буде уточнена";
  return new Intl.DateTimeFormat("uk-UA", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
}

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
  const rankColor = index === 0 ? "text-gold" : index === 1 ? "text-slate-300" : index === 2 ? "text-amber-700" : "text-slate-500";
  const trendLabel = team.trend > 0 ? `+${team.trend}` : String(team.trend);
  const trendColor = team.trend > 0 ? "text-emerald-300" : team.trend < 0 ? "text-red-300" : "text-slate-500";

  return (
    <Link
      href={`/teams/${team.slug}`}
      className="grid grid-cols-[34px_38px_1fr_auto_auto] items-center gap-3 rounded-xl border border-line bg-surface2 p-3 transition hover:border-accent/40"
    >
      <div className={`font-rajdhani text-xl font-bold ${rankColor}`}>{index + 1}</div>
      <div
        className="grid h-10 w-10 place-items-center overflow-hidden rounded-lg border border-white/10 bg-cover bg-center text-xs font-bold"
        style={team.logo_url ? { backgroundImage: `url(${team.logo_url})` } : { background: `${team.color}22`, color: team.color }}
      >
        {team.logo_url ? null : team.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 3)}
      </div>
      <div>
        <div className="font-bold">{team.name}</div>
        <div className="text-xs text-slate-500">{team.org}</div>
      </div>
      <div className={`hidden text-xs font-bold sm:block ${trendColor}`}>{team.trend === 0 ? "0" : trendLabel}</div>
      <div className="font-rajdhani text-lg font-bold">{team.points}</div>
    </Link>
  );
}

export function ChampionCard({ tournament }: { tournament: Tournament | HomepageChampion }) {
  const division = "slot" in tournament ? tournament.slot : tournament.division;
  const teamName = "team_name" in tournament ? tournament.team_name : tournament.winner?.name || "Буде визначено";
  const tournamentName = "tournament_name" in tournament ? tournament.tournament_name : tournament.name;
  const detailsUrl = "details_url" in tournament ? tournament.details_url || "#" : `/tournaments/${tournament.slug}`;
  const imageUrl = "image_url" in tournament ? tournament.image_url : tournament.banner_url;
  const divisionLabel = "division_label" in tournament ? tournament.division_label : tournament.division;

  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div
        className="relative aspect-[16/7.3] bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(180deg,rgba(4,8,14,0.08),rgba(4,8,14,0.66)),url(${imageUrl || "/assets/winners-hero.png"})` }}
      >
        <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-bg/25 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-200 shadow-[0_8px_26px_rgba(0,0,0,0.18)] backdrop-blur-md">
          Переможець {division} Division
        </div>
        <div className="absolute bottom-4 right-4 text-right">
          <h3 className="font-rajdhani text-3xl font-bold leading-none">{teamName}</h3>
          <p className="mt-1 text-sm font-semibold text-slate-300">{tournamentName}</p>
        </div>
      </div>
      <div className="grid gap-2 p-2 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
        <div className="rounded-lg border border-line bg-surface2 px-3 py-1">
          <span className="block text-[9px] uppercase tracking-widest text-slate-500">Дата</span>
          <strong className="text-sm">{tournament.date_label}</strong>
        </div>
        <div className="rounded-lg border border-line bg-surface2 px-3 py-1">
          <span className="block text-[9px] uppercase tracking-widest text-slate-500">Дивізіон</span>
          <strong className="text-sm">{divisionLabel}</strong>
        </div>
        <Link href={detailsUrl} className="rounded-lg bg-accent px-4 py-2 text-center text-sm font-bold text-bg">
          Детальніше
        </Link>
      </div>
    </article>
  );
}

export function NewsCard({ item }: { item: NewsItem }) {
  return (
    <Link href={`/news/${item.slug}`} className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition hover:border-accent/40">
      <div
        className="h-36 border-b border-line bg-cover bg-center"
        style={{ backgroundImage: `url(${item.image_url || "/assets/winners-hero.png"})` }}
      />
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center justify-between gap-3 text-[10px] font-extrabold uppercase tracking-widest">
          <span className="text-accent">{item.tag}</span>
          <time className="text-slate-600">{formatNewsDate(item.published_at || item.created_at)}</time>
        </div>
        <h3 className="font-bold leading-snug">{item.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-6 text-slate-400">{item.excerpt}</p>
      </div>
    </Link>
  );
}
