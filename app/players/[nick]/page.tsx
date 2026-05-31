import Link from "next/link";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Player } from "@/lib/types";
import { DEFAULT_PLAYER_AVATAR } from "@/components/roster-showcase";
import { BackButton } from "@/components/back-button";
import { publicImageUrl } from "@/lib/image-url";
import { PlayerSideStats } from "@/components/player-side-stats";
import { getManualTeamForNick, getPlayerStatsByNick, type PlayerComputedStats } from "@/lib/player-stats";

export const dynamic = "force-dynamic";

function grade(value: number, good = 66, okay = 42) {
  if (value >= good) return { label: "ДОБРЕ", color: "text-emerald-300", bar: "bg-emerald-300", glow: "shadow-[0_0_18px_rgba(110,231,183,0.35)]" };
  if (value >= okay) return { label: "НОРМА", color: "text-amber-300", bar: "bg-amber-300", glow: "shadow-[0_0_18px_rgba(252,211,77,0.28)]" };
  return { label: "СЛАБКО", color: "text-red-300", bar: "bg-red-300", glow: "shadow-[0_0_18px_rgba(252,165,165,0.26)]" };
}

function heroMetric(label: string, value: string | number, rawScore: number, accent = "text-slate-100") {
  const state = grade(rawScore);
  return (
    <div className="rounded border border-white/5 bg-bg/25 p-1 sm:border-0 sm:bg-transparent sm:p-0">
      <div className={`font-rajdhani text-base font-bold leading-none sm:text-xl ${accent}`}>{value}</div>
      <div className="mt-0.5 truncate text-[7px] font-bold uppercase leading-none tracking-[0.1em] text-sky-200/70 sm:text-[8px] sm:tracking-[0.12em]">{label}</div>
      <div className="mt-1 h-[3px] overflow-hidden rounded-full bg-slate-500/35 sm:mt-0.5 sm:h-[5px]">
        <div className={`stat-bar stat-bar-enter h-full rounded-full ${state.bar} ${state.glow}`} style={{ width: `${Math.max(3, Math.min(100, rawScore))}%` }} />
      </div>
      <div className={`mt-0.5 hidden text-right text-[8px] font-extrabold uppercase tracking-[0.16em] sm:block ${state.color}`}>{state.label}</div>
    </div>
  );
}

function ratingProgress(rating: number) {
  return Math.max(0, Math.min(100, ((rating - 0.6) / 0.8) * 100));
}

function ratingColor(rating: number) {
  if (rating > 1.1) return "#21c637";
  if (rating >= 0.9) return "#facc15";
  return "#fca5a5";
}

function ratingGrade(rating: number) {
  if (rating >= 1.25) return { label: "ВІДМІННО", color: "text-emerald-300" };
  if (rating > 1.1) return { label: "ДОБРЕ", color: "text-emerald-300" };
  if (rating >= 0.9) return { label: "НОРМА", color: "text-amber-300" };
  return { label: "СЛАБКО", color: "text-red-300" };
}

function socialIcons(player: Player | null, placement: "mobile" | "desktop") {
  const links = [
    { key: "x", label: "X", href: player?.x_url, node: <span className="font-rajdhani text-[10px] font-bold leading-none">X</span>, className: "bg-black/85 text-slate-200 hover:text-white" },
    { key: "twitch", label: "Twitch", href: player?.twitch_url, node: <img src="/assets/twitch.png" alt="" className="h-2.5 w-2.5 object-contain" />, className: "bg-[#6441a5] hover:bg-[#7653bd]" },
    { key: "instagram", label: "Instagram", href: player?.instagram_url, node: <img src="/assets/instagram.png" alt="" className="h-2.5 w-2.5 object-contain" />, className: "bg-[#d62976] hover:bg-[#e13f89]" },
    { key: "faceit", label: "FACEIT", href: player?.faceit_url, node: <span className="block h-0 w-0 border-y-[4px] border-l-[7px] border-y-transparent border-l-orange-500" />, className: "bg-black/85 hover:bg-black" },
  ];
  const visible = links.filter((link) => link.href);
  if (!visible.length) return null;

  return (
    <div className={`absolute z-10 gap-1 ${placement === "mobile" ? "left-2 top-2 flex sm:hidden" : "right-2 top-2 hidden flex-row-reverse sm:flex"}`}>
      {visible.map((link) => (
        <a key={link.key} href={link.href || "#"} target="_blank" rel="noreferrer" aria-label={link.label} className={`grid h-5 w-5 place-items-center rounded border border-white/10 shadow-lg transition ${link.className}`}>
          {link.node}
        </a>
      ))}
    </div>
  );
}

type ResolvedTeam = Pick<NonNullable<Player["team"]>, "name" | "slug" | "division" | "color" | "logo_url"> | null;

function analyticHero(stats: PlayerComputedStats | null, rating: number, player: Player | null, resolvedTeam: ResolvedTeam, manualTeam: ReturnType<typeof getManualTeamForNick> | null, displayNick: string, teamName: string) {
  const positiveSwing = (stats?.roundSwing || 0) >= 0;
  const teamColor = resolvedTeam?.color || manualTeam?.color || "#18d7ff";
  const teamLogo = resolvedTeam?.logo_url || manualTeam?.logo_url;
  const teamSlug = resolvedTeam?.slug || manualTeam?.slug;
  const arcProgress = ratingProgress(rating);
  const arcColor = ratingColor(rating);
  const ratingState = ratingGrade(rating);
  const teamWatermark = teamLogo ? (
    <span className="absolute left-1/2 top-6 z-[1] hidden h-44 w-44 -translate-x-1/2 place-items-center opacity-40 sm:grid sm:h-52 sm:w-52">
      <img src={publicImageUrl(teamLogo)} alt={teamName} className="h-full w-full object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.8)]" />
    </span>
  ) : null;
  return (
    <div className="overflow-hidden rounded-md border border-line bg-[#26313d] sm:rounded-sm">
      <div className="grid lg:min-h-[164px] lg:grid-cols-[270px_1fr]">
        <div className="relative min-h-[112px] overflow-hidden border-b border-line bg-gradient-to-br from-slate-700/50 to-bg sm:min-h-[196px] lg:min-h-[164px] lg:border-b-0 lg:border-r">
          <div className="absolute inset-y-0 left-0 w-12 border-r border-white/10 bg-white/5 sm:w-16" />
          <div className="absolute inset-0 opacity-20" style={{ background: `linear-gradient(135deg, transparent 36%, ${teamColor} 37%, transparent 66%)` }} />
          {socialIcons(player, "mobile")}
          {teamSlug && teamWatermark ? <Link href={`/teams/${teamSlug}`} aria-label={teamName}>{teamWatermark}</Link> : teamWatermark}
          <img src={publicImageUrl(player?.avatar_url || DEFAULT_PLAYER_AVATAR)} alt={displayNick} className="absolute bottom-0 right-0 z-[2] h-[112px] w-[52%] object-contain object-bottom sm:inset-x-1 sm:mx-auto sm:h-[98%] sm:w-[96%]" />
          <div className="absolute inset-x-0 bottom-0 z-[3] bg-gradient-to-t from-[#111a24] via-[#111a24]/25 to-transparent px-3 pb-2 pt-10 sm:px-4 sm:pb-1.5 sm:pt-16">
            <h1 className="max-w-[58%] break-words font-rajdhani text-[1.9rem] font-bold leading-[0.9] text-white sm:max-w-none sm:text-[2.1rem]">{displayNick}</h1>
            <div className="mt-0.5 max-w-[58%] truncate text-[11px] font-semibold text-slate-400 sm:max-w-none">{teamName}</div>
          </div>
        </div>

        <div
          className="relative overflow-hidden p-2 sm:p-2.5"
        >
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(245,158,11,0.06),transparent_42%,rgba(56,189,248,0.07))]" />
          <img src="https://www.hltv.org/img/static/stats/t-bg.png" alt="" className="pointer-events-none absolute -left-2 top-3 hidden h-[74%] w-auto max-w-none object-contain opacity-[0.16] sm:block" />
          <img src="https://www.hltv.org/img/static/stats/ct-bg.png" alt="" className="pointer-events-none absolute -right-2 top-3 hidden h-[74%] w-auto max-w-none object-contain opacity-[0.16] sm:block" />
          <div className="absolute inset-0 bg-[#17212b]/62" />
          {socialIcons(player, "desktop")}
          <div className="relative">
            <div className="grid grid-cols-3 items-center gap-1 bg-slate-800/18 py-1 lg:grid-cols-[1fr_124px_1fr]">
              <div className="text-center">
                <div className="font-rajdhani text-lg font-bold leading-none text-amber-400 sm:text-xl">{stats?.tRating.toFixed(2) || "0.00"}</div>
                <div className="mt-0.5 text-[8px] font-bold uppercase leading-none tracking-[0.12em] text-amber-300/80 sm:text-[10px] sm:tracking-[0.14em]">Рейтинг T</div>
              </div>

              <div className="relative mx-auto h-[72px] w-24 sm:h-24 sm:w-36">
                <svg viewBox="0 0 144 94" className="absolute inset-x-0 top-0 h-16 w-24 overflow-visible sm:h-24 sm:w-36" aria-hidden="true">
                  <path d="M 20 74 A 52 52 0 0 1 124 74" fill="none" stroke="rgba(100,116,139,0.78)" strokeWidth="8" strokeLinecap="butt" pathLength={100} />
                  <path
                    d="M 20 74 A 52 52 0 0 1 124 74"
                    className="rating-arc-enter"
                    fill="none"
                    stroke={arcColor}
                    strokeWidth="8"
                    strokeLinecap="butt"
                    pathLength={100}
                    style={{ "--rating-progress": arcProgress } as CSSProperties}
                  />
                </svg>
                <div className="absolute inset-x-0 top-[21px] text-center sm:top-7">
                  <div className="font-rajdhani text-xl font-bold leading-none text-white sm:text-3xl">{rating.toFixed(2)}</div>
                  <div className="text-[8px] font-bold uppercase leading-none tracking-[0.1em] text-sky-200/70 sm:text-[11px] sm:tracking-[0.12em]">Рейтинг 3.0</div>
                </div>
                <div className={`absolute inset-x-0 top-0 text-center text-[8px] font-extrabold uppercase leading-none tracking-[0.12em] sm:text-[10px] sm:tracking-[0.14em] ${ratingState.color}`}>{ratingState.label}</div>
              </div>

              <div className="text-center">
                <div className="font-rajdhani text-lg font-bold leading-none text-sky-400 sm:text-xl">{stats?.ctRating.toFixed(2) || "0.00"}</div>
                <div className="mt-0.5 text-[8px] font-bold uppercase leading-none tracking-[0.12em] text-sky-300/80 sm:text-[10px] sm:tracking-[0.14em]">Рейтинг CT</div>
              </div>
            </div>

            <div className="mt-1.5 grid grid-cols-3 gap-1 sm:mt-2 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-1.5 xl:grid-cols-3">
              {heroMetric("Вплив на раунд", `${positiveSwing ? "+" : ""}${(stats?.roundSwing || 0).toFixed(2)}%`, Math.min(100, Math.abs(stats?.roundSwing || 0) * 18), positiveSwing ? "text-white" : "text-red-300")}
              {heroMetric("DPR", stats?.dpr.toFixed(2) || "0.00", scoreInvert(stats?.dpr || 0.9, 0.45, 0.9), (stats?.dpr || 1) <= 0.65 ? "text-white" : "text-red-300")}
              {heroMetric("KAST", `${stats?.kast.toFixed(1) || "0.0"}%`, Math.min(100, ((stats?.kast || 0) / 80) * 100), "text-white")}
              {heroMetric("Мультикіл", `${multiKillPercent(stats).toFixed(1)}%`, stats?.multiKill || 0, "text-white")}
              {heroMetric("ADR", stats?.adr.toFixed(1) || "0.0", Math.min(100, ((stats?.adr || 0) / 100) * 100), (stats?.adr || 0) >= 75 ? "text-white" : "text-red-300")}
              {heroMetric("KPR", stats?.kpr.toFixed(2) || "0.00", Math.min(100, ((stats?.kpr || 0) / 0.9) * 100), "text-white")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function scoreInvert(value: number, good: number, bad: number) {
  if (bad <= good) return 0;
  return Math.max(0, Math.min(100, ((bad - value) / (bad - good)) * 100));
}

function multiKillPercent(stats: PlayerComputedStats | null) {
  if (!stats?.rounds) return 0;
  return (stats.multiKillRounds / stats.rounds) * 100;
}

export default async function PlayerPage({ params, searchParams }: { params: { nick: string }, searchParams?: { side?: string } }) {
  const nick = decodeURIComponent(params.nick);
  const supabase = createClient();
  const { data } = await supabase
    .from("players")
    .select("*, team:teams(name, slug, division, color, logo_url)")
    .ilike("nick", nick)
    .eq("published", true)
    .maybeSingle();

  const player = data as Player | null;
  const stats = getPlayerStatsByNick(player?.nick || nick);
  const manualTeam = getManualTeamForNick(player?.nick || nick);
  const statsTeamName = stats?.teamNames[0] || null;

  let resolvedTeam = player?.team || null;
  if (!resolvedTeam?.logo_url && manualTeam?.slug) {
    const { data: teamBySlug } = await supabase
      .from("teams")
      .select("name, slug, division, color, logo_url")
      .eq("slug", manualTeam.slug)
      .maybeSingle();
    resolvedTeam = (teamBySlug as ResolvedTeam) || resolvedTeam;
  }
  if (!resolvedTeam?.logo_url && (manualTeam?.name || statsTeamName)) {
    const { data: teamByName } = await supabase
      .from("teams")
      .select("name, slug, division, color, logo_url")
      .eq("name", manualTeam?.name || statsTeamName)
      .maybeSingle();
    resolvedTeam = (teamByName as ResolvedTeam) || resolvedTeam;
  }

  const teamName = resolvedTeam?.name || manualTeam?.name || statsTeamName || "Без команди";

  if (!player && !stats) notFound();

  const displayNick = player?.nick || stats?.nick || nick;
  const rating = stats?.rating ?? player?.rating ?? 0;
  const selectedSide = searchParams?.side === "ct" ? "ct" : searchParams?.side === "t" ? "t" : "both";

  return (
    <div className="py-2 sm:py-8">
      <div className="mb-2 sm:mb-4">
        <BackButton fallbackHref="/ranking" label="Назад" />
      </div>
      <section>
        {analyticHero(stats, rating, player, resolvedTeam, manualTeam, displayNick, teamName)}
      </section>

      <section className="mt-2 grid gap-2 sm:mt-4 sm:gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-md border border-line bg-surface p-2 sm:p-4">
          <div className="mb-2 flex flex-wrap items-end justify-between gap-2 sm:mb-3">
            <h2 className="font-rajdhani text-xl font-bold leading-none sm:text-2xl">Статистика {displayNick}</h2>
            <div className="text-[10px] font-bold text-slate-500 sm:text-sm">Усі оброблені демо · {stats?.maps || 0} карт</div>
          </div>
          <PlayerSideStats stats={stats} initialSide={selectedSide} />
        </div>

        <div className="rounded-md border border-line bg-surface p-2 sm:p-4">
          <h2 className="font-rajdhani text-xl font-bold leading-none sm:text-2xl">Повна статистика</h2>
          <div className="mt-2 grid grid-cols-2 overflow-hidden rounded-md border border-line bg-surface2 sm:mt-3 md:grid-cols-2">
            {[
              ["Вбивства", stats?.kills || 0],
              ["Смерті", stats?.deaths || 0],
              ["Асисти", stats?.assists || 0],
              ["Раунди", stats?.rounds || 0],
              ["KPR", stats?.kpr.toFixed(2) || "0.00"],
              ["DPR", stats?.dpr.toFixed(2) || "0.00"],
              ["KAST", `${stats?.kast.toFixed(1) || "0.0"}%`],
              ["Вплив на раунд", `${(stats?.roundSwing || 0) >= 0 ? "+" : ""}${stats?.roundSwing.toFixed(2) || "0.00"}%`],
              ["ADR", stats?.adr.toFixed(1) || "0.0"],
              ["Хедшоти", `${stats?.headshots || 0} (${stats?.hsPercent.toFixed(1) || "0.0"}%)`],
              ["Перші K-D", `${stats?.firstKills || 0}-${stats?.firstDeaths || 0}`],
              ["Вбивства в розмін", stats?.tradeKills || 0],
              ["Розміняні смерті", stats?.tradedDeaths || 0],
              ["Снайперські вбивства", stats?.sniperKills || 0],
              ["Раунди з мультикілом", stats?.multiKillRounds || 0],
              ["Флеш-асисти", stats?.flashAssists || 0],
              ["Шкода", stats?.damage || 0]
            ].map(([label, value]) => (
              <div key={label} className="grid grid-cols-[1fr_auto] items-center gap-2 border-b border-line px-2 py-1 odd:border-r sm:px-3 sm:py-1.5 md:[&:nth-last-child(-n+2)]:border-b-0 md:odd:border-r">
                <div className="truncate text-[8px] font-extrabold uppercase tracking-[0.14em] text-slate-500 sm:text-[10px] sm:tracking-[0.2em]">{label}</div>
                <div className="font-rajdhani text-sm font-bold text-slate-100 sm:text-lg">{value}</div>
              </div>
            ))}
          </div>

          <h3 className="mt-3 font-rajdhani text-lg font-bold text-slate-300 sm:mt-4 sm:text-xl">Оброблені матчі</h3>
          <div className="mt-2 grid gap-2">
            {(stats?.matchIds || []).map((matchId) => (
              <Link key={matchId} href={`/matches/${matchId}`} className="rounded-xl border border-line bg-surface2 px-3 py-2 font-bold text-slate-300 transition hover:border-accent hover:text-accent">
                Матч #{matchId}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
