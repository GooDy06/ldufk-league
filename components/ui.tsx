import Link from "next/link";
import type { HomepageChampion, Team, Tournament, NewsItem } from "@/lib/types";
import { publicImageUrl } from "@/lib/image-url";

function formatNewsDate(value: string | null) {
  if (!value) return "Дата буде уточнена";
  return new Intl.DateTimeFormat("uk-UA", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
}

export function HeroTitle() {
  return (
    <section className="soft-enter py-3 text-center sm:py-8">
      <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/10 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.16em] text-accent sm:mb-3 sm:px-4 sm:text-xs sm:tracking-[0.22em]">
        <span className="h-1.5 w-1.5 rounded-full bg-accent sm:h-1.5 sm:w-1.5" />
        Сезон 2026 · Активний
      </div>
      <h1 className="font-rajdhani text-3xl font-bold leading-none tracking-wide sm:text-5xl md:text-6xl md:tracking-[0.08em]">
        LDUFK <span className="text-accent">CS2</span> League
      </h1>
      <p className="mx-auto mt-2 max-w-3xl text-xs leading-5 tracking-wide text-slate-400 sm:mt-3 sm:text-base">
        Офіційний портал університетської та шкільної кіберспортивної ліги України
      </p>
      <div className="mt-3 flex flex-wrap justify-center gap-2 sm:mt-4">
        <Link href="/tournaments#registration" className="focus-ring rounded-md border border-school/50 bg-school px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-bg transition hover:bg-emerald-200 sm:rounded-lg sm:px-4 sm:text-xs">
          Зареєструватися
        </Link>
        <Link href="/tournaments#road-to-finals" className="focus-ring rounded-md border border-line bg-surface2 px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-300 transition hover:border-accent/45 hover:text-accent sm:rounded-lg sm:px-4 sm:text-xs">
          Як працює сезон
        </Link>
      </div>
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
    <section className="soft-enter rounded-xl border border-line bg-surface p-2 sm:rounded-2xl sm:p-4">
      <div className="mb-2 flex items-center justify-between gap-2 sm:mb-3 sm:gap-3">
        <div className="min-w-0">
          {eyebrow ? <div className="truncate text-[8px] font-extrabold uppercase tracking-[0.16em] text-slate-500 sm:text-[10px] sm:tracking-[0.2em]">{eyebrow}</div> : null}
          <h2 className="truncate font-rajdhani text-base font-bold tracking-wide sm:text-xl">{title}</h2>
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
      className="interactive-card soft-enter grid grid-cols-[20px_26px_minmax(0,1fr)_auto] items-center gap-1.5 rounded-lg border border-line bg-surface2 p-1.5 sm:grid-cols-[24px_32px_minmax(0,1fr)_auto_auto] sm:gap-2 sm:rounded-xl sm:p-2"
    >
      <div className={`font-rajdhani text-base font-bold leading-none sm:text-xl ${rankColor}`}>{index + 1}</div>
      <div
        className="grid h-6 w-6 place-items-center overflow-hidden rounded-md border border-white/10 bg-cover bg-center text-[8px] font-bold sm:h-8 sm:w-8 sm:rounded-lg sm:text-xs"
        style={team.logo_url ? { backgroundImage: `url(${publicImageUrl(team.logo_url)})` } : { background: `${team.color}22`, color: team.color }}
      >
        {team.logo_url ? null : team.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 3)}
      </div>
      <div className="min-w-0">
        <div className="truncate text-xs font-bold leading-none sm:text-base">{team.name}</div>
        <div className="mt-0.5 truncate text-[8px] leading-none text-slate-500 sm:text-xs">{team.org}</div>
      </div>
      <div className={`hidden text-xs font-bold sm:block ${trendColor}`}>{team.trend === 0 ? "0" : trendLabel}</div>
      <div className="font-rajdhani text-sm font-bold leading-none sm:text-lg">{team.points}</div>
    </Link>
  );
}

export function ChampionCard({ tournament }: { tournament: Tournament | HomepageChampion }) {
  const teamName = "team_name" in tournament ? tournament.team_name : tournament.winner?.name || "Буде визначено";
  const tournamentName = "tournament_name" in tournament ? tournament.tournament_name : tournament.name;
  const institutionName = "institution_name" in tournament ? tournament.institution_name : null;
  const detailsUrl = "details_url" in tournament ? tournament.details_url || "#" : `/tournaments/${tournament.slug}`;
  const imageUrl = "image_url" in tournament ? tournament.image_url : tournament.banner_url;
  const division = "slot" in tournament ? tournament.slot : tournament.division;
  const divisionTone = division === "School" ? "text-school" : "text-accent";

  return (
    <Link href={detailsUrl} className="interactive-card group soft-enter block overflow-hidden rounded-xl border border-line bg-surface sm:rounded-2xl">
      <div
        className="relative min-h-[160px] overflow-hidden bg-cover bg-center p-2 sm:min-h-[280px] sm:p-4"
        style={{ backgroundImage: `url(${publicImageUrl(imageUrl || "/assets/winners-hero.png")})` }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,8,14,0.08),rgba(4,8,14,0.42)_48%,rgba(4,8,14,0.9)),radial-gradient(circle_at_76%_14%,rgba(0,213,255,0.16),transparent_36%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-bg/95 to-transparent" />

        <div className="relative z-10 flex items-start justify-end gap-2">
          <span className="glass-chip rounded-full px-2.5 py-1.5 text-[7px] font-extrabold uppercase tracking-[0.08em] text-accent transition group-hover:border-accent/40 group-hover:bg-accent/15 group-hover:text-white sm:px-4 sm:py-2 sm:text-[10px] sm:tracking-[0.11em]">
            Детальніше
          </span>
        </div>

        <div className="absolute inset-x-2 bottom-2 z-10 sm:inset-x-4 sm:bottom-4">
          <div className="ml-auto max-w-[96%] text-right sm:max-w-[78%]">
            <div className={`mb-1 truncate text-[7px] font-extrabold uppercase tracking-[0.13em] sm:text-[9px] ${divisionTone}`}>Переможець · {tournamentName}</div>
            <h3 className="font-rajdhani text-lg font-bold leading-[0.9] tracking-wide sm:text-3xl md:text-4xl">{teamName}</h3>
            {institutionName ? <p className="mt-1 line-clamp-1 text-[9px] font-bold leading-tight text-slate-100 sm:text-sm md:text-base">{institutionName}</p> : null}
          </div>
        </div>
      </div>
    </Link>
  );
}

export function NewsCard({ item }: { item: NewsItem }) {
  return (
    <Link href={`/news/${item.slug}`} className="interactive-card soft-enter group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface sm:rounded-2xl">
      <div
        className="h-20 border-b border-line bg-cover bg-center transition duration-500 group-hover:scale-[1.03] sm:h-36"
        style={{ backgroundImage: `url(${publicImageUrl(item.image_url || "/assets/winners-hero.png")})` }}
      />
      <div className="flex flex-1 flex-col p-2 sm:p-4">
        <div className="mb-1 flex items-center justify-between gap-2 text-[7px] font-extrabold uppercase tracking-[0.12em] sm:mb-2 sm:gap-3 sm:text-[10px] sm:tracking-widest">
          <span className="text-accent">{item.tag}</span>
          <time className="truncate text-slate-600">{formatNewsDate(item.published_at || item.created_at)}</time>
        </div>
        <h3 className="line-clamp-2 text-xs font-bold leading-snug sm:text-base">{item.title}</h3>
        <p className="mt-2 hidden flex-1 text-sm leading-6 text-slate-400 sm:block">{item.excerpt}</p>
      </div>
    </Link>
  );
}
