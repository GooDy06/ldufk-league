import Link from "next/link";
import type { HomepageChampion, Team, Tournament, NewsItem } from "@/lib/types";

function formatNewsDate(value: string | null) {
  if (!value) return "Дата буде уточнена";
  return new Intl.DateTimeFormat("uk-UA", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
}

export function HeroTitle() {
  return (
    <section className="soft-enter py-5 text-center sm:py-8">
      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-accent sm:px-4 sm:text-xs sm:tracking-[0.22em]">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        Сезон 2026 · Активний
      </div>
      <h1 className="font-rajdhani text-4xl font-bold tracking-wide sm:text-5xl md:text-6xl md:tracking-[0.08em]">
        LDUFK <span className="text-accent">CS2</span> League
      </h1>
      <p className="mx-auto mt-3 max-w-3xl text-sm tracking-wide text-slate-400 sm:text-base">
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
    <section className="soft-enter rounded-2xl border border-line bg-surface p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          {eyebrow ? <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">{eyebrow}</div> : null}
          <h2 className="font-rajdhani text-lg font-bold tracking-wide sm:text-xl">{title}</h2>
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
      className="interactive-card grid grid-cols-[28px_34px_minmax(0,1fr)_auto] items-center gap-2 rounded-xl border border-line bg-surface2 p-2.5 sm:grid-cols-[34px_38px_minmax(0,1fr)_auto_auto] sm:gap-3 sm:p-3"
    >
      <div className={`font-rajdhani text-lg font-bold sm:text-xl ${rankColor}`}>{index + 1}</div>
      <div
        className="grid h-8 w-8 place-items-center overflow-hidden rounded-lg border border-white/10 bg-cover bg-center text-[10px] font-bold sm:h-10 sm:w-10 sm:text-xs"
        style={team.logo_url ? { backgroundImage: `url(${team.logo_url})` } : { background: `${team.color}22`, color: team.color }}
      >
        {team.logo_url ? null : team.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 3)}
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-bold sm:text-base">{team.name}</div>
        <div className="truncate text-[11px] text-slate-500 sm:text-xs">{team.org}</div>
      </div>
      <div className={`hidden text-xs font-bold sm:block ${trendColor}`}>{team.trend === 0 ? "0" : trendLabel}</div>
      <div className="font-rajdhani text-base font-bold sm:text-lg">{team.points}</div>
    </Link>
  );
}

export function ChampionCard({ tournament }: { tournament: Tournament | HomepageChampion }) {
  const division = "slot" in tournament ? tournament.slot : tournament.division;
  const teamName = "team_name" in tournament ? tournament.team_name : tournament.winner?.name || "Буде визначено";
  const tournamentName = "tournament_name" in tournament ? tournament.tournament_name : tournament.name;
  const institutionName = "institution_name" in tournament ? tournament.institution_name : null;
  const supportingName = institutionName || ("slot" in tournament ? "" : tournamentName);
  const detailsUrl = "details_url" in tournament ? tournament.details_url || "#" : `/tournaments/${tournament.slug}`;
  const imageUrl = "image_url" in tournament ? tournament.image_url : tournament.banner_url;
  const divisionLabel = "division_label" in tournament ? tournament.division_label : tournament.division;

  return (
    <article className="interactive-card soft-enter overflow-hidden rounded-2xl border border-line bg-surface">
      <div
        className="relative min-h-[300px] overflow-hidden bg-cover bg-center p-3 sm:min-h-[330px] sm:p-4"
        style={{ backgroundImage: `url(${imageUrl || "/assets/winners-hero.png"})` }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,8,14,0.08),rgba(4,8,14,0.42)_48%,rgba(4,8,14,0.9)),radial-gradient(circle_at_76%_14%,rgba(0,213,255,0.16),transparent_36%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-bg/95 to-transparent" />

        <div className="relative z-10 flex items-start justify-between gap-2">
          <div className="glass-chip max-w-[56%] truncate whitespace-nowrap rounded-full px-2.5 py-1 text-[8px] font-extrabold uppercase tracking-[0.11em] text-slate-100 sm:max-w-[58%] sm:px-3 sm:text-[9px]">
            Переможець {division} Division
          </div>
          <div className="glass-chip max-w-[42%] rounded-full px-2.5 py-1 text-right text-[8px] font-extrabold uppercase tracking-[0.11em] text-accent sm:max-w-[40%] sm:px-3 sm:text-[9px]">
            <span className="block truncate">{tournamentName}</span>
          </div>
        </div>

        <div className="absolute inset-x-3 bottom-3 z-10 sm:inset-x-4 sm:bottom-4">
          <div className="ml-auto max-w-[92%] text-right sm:max-w-[72%]">
            <h3 className="font-rajdhani text-2xl font-bold leading-[0.95] tracking-wide sm:text-3xl md:text-4xl">{teamName}</h3>
            {supportingName ? <p className="mt-1 text-xs font-bold leading-tight text-slate-200 sm:text-sm md:text-base">{supportingName}</p> : null}
          </div>

          <div className="mt-3 grid gap-1.5 sm:grid-cols-[1fr_1fr_auto] sm:items-stretch">
            <div className="glass-card rounded-lg px-3 py-2">
              <span className="block text-[8px] font-extrabold uppercase tracking-[0.16em] text-slate-400">Дата</span>
              <strong className="mt-0.5 block font-rajdhani text-base font-bold leading-none text-slate-100 sm:text-lg">{tournament.date_label}</strong>
            </div>
            <div className="glass-card rounded-lg px-3 py-2">
              <span className="block text-[8px] font-extrabold uppercase tracking-[0.16em] text-slate-400">Дивізіон</span>
              <strong className="mt-0.5 block font-rajdhani text-base font-bold leading-none text-slate-100 sm:text-lg">{divisionLabel}</strong>
            </div>
            <Link href={detailsUrl} className="focus-ring grid min-h-[42px] place-items-center rounded-lg bg-accent px-4 text-center font-rajdhani text-base font-extrabold text-bg transition hover:-translate-y-0.5 hover:bg-cyan-300 hover:shadow-[0_0_26px_rgba(0,213,255,0.22)] sm:min-h-[48px] sm:text-lg">
              Детальніше
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export function NewsCard({ item }: { item: NewsItem }) {
  return (
    <Link href={`/news/${item.slug}`} className="interactive-card group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface">
      <div
        className="h-36 border-b border-line bg-cover bg-center transition duration-500 group-hover:scale-[1.03]"
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
