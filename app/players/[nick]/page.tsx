import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Player } from "@/lib/types";
import { DEFAULT_PLAYER_AVATAR } from "@/components/roster-showcase";
import { getManualTeamForNick, getPlayerStatsByNick, type PlayerComputedStats } from "@/lib/player-stats";

export const dynamic = "force-dynamic";

function grade(value: number, good = 66, okay = 42) {
  if (value >= good) return { label: "GOOD", color: "text-emerald-300", bar: "bg-emerald-300", glow: "shadow-[0_0_18px_rgba(110,231,183,0.35)]" };
  if (value >= okay) return { label: "OKAY", color: "text-amber-300", bar: "bg-amber-300", glow: "shadow-[0_0_18px_rgba(252,211,77,0.28)]" };
  return { label: "POOR", color: "text-red-300", bar: "bg-red-300", glow: "shadow-[0_0_18px_rgba(252,165,165,0.26)]" };
}

function bar(label: string, value: number, hint?: string) {
  const state = grade(value);
  return (
    <div className="rounded bg-slate-700/45 px-2 py-1 sm:px-3 sm:py-2">
      <div className="mb-1 flex items-center justify-between gap-2 sm:mb-1.5 sm:gap-3">
        <div>
          <div className="font-rajdhani text-sm font-bold leading-none text-slate-300 sm:text-xl">{label}</div>
          {hint ? <div className="hidden text-[10px] font-semibold text-slate-600 sm:block">{hint}</div> : null}
        </div>
        <div className="text-right font-rajdhani text-sm font-bold leading-none text-slate-300 sm:text-lg">{value}<span className="text-[9px] text-slate-500 sm:text-xs">/100</span></div>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-slate-700/40 sm:h-1.5">
        <div className={`h-full rounded-full ${state.bar} ${state.glow}`} style={{ width: `${Math.max(2, Math.min(100, value))}%` }} />
      </div>
      <div className={`mt-0.5 hidden text-right text-[9px] font-extrabold uppercase tracking-[0.16em] sm:block ${state.color}`}>{state.label}</div>
    </div>
  );
}

function heroMetric(label: string, value: string | number, rawScore: number, accent = "text-slate-100") {
  const state = grade(rawScore);
  return (
    <div className="rounded border border-white/5 bg-bg/25 p-1 sm:border-0 sm:bg-transparent sm:p-0">
      <div className={`font-rajdhani text-base font-bold leading-none sm:text-2xl ${accent}`}>{value}</div>
      <div className="mt-0.5 truncate text-[7px] font-bold uppercase leading-none tracking-[0.1em] text-sky-200/70 sm:text-[8px] sm:tracking-[0.12em]">{label}</div>
      <div className="mt-1 h-[3px] overflow-hidden rounded-full bg-slate-500/35 sm:mt-0.5 sm:h-[5px]">
        <div className={`h-full rounded-full ${state.bar} ${state.glow}`} style={{ width: `${Math.max(3, Math.min(100, rawScore))}%` }} />
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
  if (rating >= 1.25) return { label: "GREAT", color: "text-emerald-300" };
  if (rating > 1.1) return { label: "GOOD", color: "text-emerald-300" };
  if (rating >= 0.9) return { label: "OKAY", color: "text-amber-300" };
  return { label: "POOR", color: "text-red-300" };
}

function socialIcons(player: Player | null) {
  const links = [
    { key: "x", label: "X", href: player?.x_url, node: <span className="font-rajdhani text-[10px] font-bold leading-none">X</span>, className: "bg-black/85 text-slate-200 hover:text-white" },
    { key: "twitch", label: "Twitch", href: player?.twitch_url, node: <img src="/assets/twitch.png" alt="" className="h-2.5 w-2.5 object-contain" />, className: "bg-[#6441a5] hover:bg-[#7653bd]" },
    { key: "instagram", label: "Instagram", href: player?.instagram_url, node: <img src="/assets/instagram.png" alt="" className="h-2.5 w-2.5 object-contain" />, className: "bg-[#d62976] hover:bg-[#e13f89]" },
    { key: "faceit", label: "FACEIT", href: player?.faceit_url, node: <span className="block h-0 w-0 border-y-[4px] border-l-[7px] border-y-transparent border-l-orange-500" />, className: "bg-black/85 hover:bg-black" },
  ];
  const visible = links.filter((link) => link.href);
  if (!visible.length) return null;

  return (
    <div className="absolute right-2 top-2 z-10 flex flex-row-reverse gap-1">
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
      <img src={teamLogo} alt={teamName} className="h-full w-full object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.8)]" />
    </span>
  ) : null;
  return (
    <div className="overflow-hidden rounded-md border border-line bg-[#26313d] sm:rounded-sm">
      <div className="grid lg:min-h-[164px] lg:grid-cols-[270px_1fr]">
        <div className="relative min-h-[112px] overflow-hidden border-b border-line bg-gradient-to-br from-slate-700/50 to-bg sm:min-h-[196px] lg:min-h-[164px] lg:border-b-0 lg:border-r">
          <div className="absolute inset-y-0 left-0 w-12 border-r border-white/10 bg-white/5 sm:w-16" />
          <div className="absolute inset-0 opacity-20" style={{ background: `linear-gradient(135deg, transparent 36%, ${teamColor} 37%, transparent 66%)` }} />
          {teamSlug && teamWatermark ? <Link href={`/teams/${teamSlug}`} aria-label={teamName}>{teamWatermark}</Link> : teamWatermark}
          <img src={player?.avatar_url || DEFAULT_PLAYER_AVATAR} alt={displayNick} className="absolute bottom-0 right-0 z-[2] h-[112px] w-[52%] object-contain object-bottom sm:inset-x-1 sm:mx-auto sm:h-[98%] sm:w-[96%]" />
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
          {socialIcons(player)}
          <div className="relative">
            <div className="grid grid-cols-3 items-center gap-1 bg-slate-800/18 py-1 lg:grid-cols-[1fr_124px_1fr]">
              <div className="text-center">
                <div className="font-rajdhani text-lg font-bold leading-none text-amber-400 sm:text-2xl">{stats?.tRating.toFixed(2) || "0.00"}</div>
                <div className="mt-0.5 text-[8px] font-bold uppercase leading-none tracking-[0.12em] text-amber-300/80 sm:text-[10px] sm:tracking-[0.14em]">T rating</div>
              </div>

              <div className="relative mx-auto h-16 w-24 sm:h-24 sm:w-36">
                <svg viewBox="0 0 144 94" className="absolute inset-x-0 top-0 h-16 w-24 overflow-visible sm:h-24 sm:w-36" aria-hidden="true">
                  <path d="M 20 74 A 52 52 0 0 1 124 74" fill="none" stroke="rgba(100,116,139,0.78)" strokeWidth="8" strokeLinecap="butt" pathLength={100} />
                  <path d="M 20 74 A 52 52 0 0 1 124 74" fill="none" stroke={arcColor} strokeWidth="8" strokeLinecap="butt" pathLength={100} strokeDasharray={`${arcProgress} 100`} />
                </svg>
                <div className="absolute inset-x-0 top-[18px] text-center sm:top-7">
                  <div className={`text-[8px] font-extrabold uppercase leading-none tracking-[0.12em] sm:text-[10px] sm:tracking-[0.14em] ${ratingState.color}`}>{ratingState.label}</div>
                  <div className="font-rajdhani text-2xl font-bold leading-none text-white sm:text-4xl">{rating.toFixed(2)}</div>
                  <div className="text-[8px] font-bold uppercase leading-none tracking-[0.1em] text-sky-200/70 sm:text-[11px] sm:tracking-[0.12em]">Rating 3.0</div>
                </div>
              </div>

              <div className="text-center">
                <div className="font-rajdhani text-lg font-bold leading-none text-sky-400 sm:text-2xl">{stats?.ctRating.toFixed(2) || "0.00"}</div>
                <div className="mt-0.5 text-[8px] font-bold uppercase leading-none tracking-[0.12em] text-sky-300/80 sm:text-[10px] sm:tracking-[0.14em]">CT rating</div>
              </div>
            </div>

            <div className="mt-1.5 grid grid-cols-3 gap-1 sm:mt-2 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-1.5 xl:grid-cols-3">
              {heroMetric("Round swing", `${positiveSwing ? "+" : ""}${(stats?.roundSwing || 0).toFixed(2)}%`, Math.min(100, Math.abs(stats?.roundSwing || 0) * 18), positiveSwing ? "text-white" : "text-red-300")}
              {heroMetric("DPR", stats?.dpr.toFixed(2) || "0.00", scoreInvert(stats?.dpr || 0.9, 0.45, 0.9), (stats?.dpr || 1) <= 0.65 ? "text-white" : "text-red-300")}
              {heroMetric("KAST", `${stats?.kast.toFixed(1) || "0.0"}%`, Math.min(100, ((stats?.kast || 0) / 80) * 100), "text-white")}
              {heroMetric("Multi-kill", `${multiKillPercent(stats).toFixed(1)}%`, stats?.multiKill || 0, "text-white")}
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

function score(value: number, target: number) {
  if (!Number.isFinite(value) || target <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((value / target) * 100)));
}

function sideBarStats(stats: PlayerComputedStats | null, selectedSide: "both" | "ct" | "t") {
  if (!stats || selectedSide === "both") {
    return [
      ["Firepower", stats?.firepower || 0, "KPR + ADR impact"],
      ["Entrying", stats?.entrying || 0, "Opening duel win rate"],
      ["Trading", stats?.trading || 0, "Trade kills, assists, traded deaths"],
      ["Opening", stats?.opening || 0, "First kills per round"],
      ["Clutching", stats?.clutching || 0, "K/D pressure score"],
      ["Multi-kill", stats?.multiKill || 0, "2+ kill rounds per map"],
      ["Sniping", stats?.sniping || 0, "AWP / Scout / autosniper kills"],
      ["Utility", stats?.utility || 0, "Flash assists from demos"],
    ] as const;
  }

  const side = selectedSide === "ct" ? stats.sides.CT : stats.sides.T;
  const rounds = Math.max(1, side.rounds);
  const kd = side.deaths > 0 ? side.kills / side.deaths : side.kills;
  const entryRate = side.firstKills / Math.max(1, side.firstKills + side.firstDeaths);
  return [
    ["Firepower", score(side.kpr, 0.9), "Side KPR impact"],
    ["Entrying", score(entryRate, 0.65), "Side opening win rate"],
    ["Opening", score(side.firstKills / rounds, 0.16), "Side first kills per round"],
    ["Clutching", score(kd, 1.5), "Side K/D pressure score"],
    ["ADR", score(side.adr, 100), "Side damage per round"],
    ["Survival", score(Math.max(0, (rounds - side.deaths) / rounds), 0.75), "Side rounds without death"],
  ] as const;
}

function sideValue(stats: PlayerComputedStats | null, selectedSide: "both" | "ct" | "t") {
  if (!stats || selectedSide === "both") {
    return { rating: stats?.rating || 0, rounds: stats?.rounds || 0, kills: stats?.kills || 0, deaths: stats?.deaths || 0, adr: stats?.adr || 0 };
  }
  const side = selectedSide === "ct" ? stats.sides.CT : stats.sides.T;
  return { rating: side.rating, rounds: side.rounds, kills: side.kills, deaths: side.deaths, adr: side.adr };
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

  const teamName = resolvedTeam?.name || manualTeam?.name || statsTeamName || "No team";

  if (!player && !stats) notFound();

  const displayNick = player?.nick || stats?.nick || nick;
  const rating = stats?.rating ?? player?.rating ?? 0;
  const selectedSide = searchParams?.side === "ct" ? "ct" : searchParams?.side === "t" ? "t" : "both";
  const selectedSideValue = sideValue(stats, selectedSide);
  const sideTabs = [
    ["both", "Both Sides"],
    ["ct", "CT Side"],
    ["t", "T Side"],
  ] as const;
  const basePlayerHref = `/players/${encodeURIComponent(displayNick)}`;

  return (
    <div className="py-2 sm:py-8">
      <section>
        {analyticHero(stats, rating, player, resolvedTeam, manualTeam, displayNick, teamName)}
      </section>

      <section className="mt-2 grid gap-2 sm:mt-4 sm:gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-md border border-line bg-surface p-2 sm:p-4">
          <div className="mb-2 flex flex-wrap items-end justify-between gap-2 sm:mb-3">
            <h2 className="font-rajdhani text-xl font-bold leading-none sm:text-3xl">{displayNick} statistics</h2>
            <div className="text-[10px] font-bold text-slate-500 sm:text-sm">All parsed demos · {stats?.maps || 0} maps</div>
          </div>
          <div className="rounded-md border border-line bg-surface2 p-2 sm:p-3">
            <div className="mb-2 grid grid-cols-[1fr_auto] items-center gap-2 border-b border-line pb-2 sm:mb-3 lg:grid-cols-[230px_330px_72px] lg:gap-3">
              <div className="min-w-0">
                <strong className="font-rajdhani text-base leading-none text-slate-300 sm:text-xl">Rating 3.0</strong>
                <div className="text-[10px] font-bold leading-none text-slate-600 sm:text-xs">
                  {selectedSide === "both" ? "All sides" : selectedSide === "ct" ? "Counter-Terrorist side" : "Terrorist side"} · {selectedSideValue.rounds} rounds
                </div>
              </div>
              <div className="order-3 col-span-2 grid h-8 w-full grid-cols-3 overflow-hidden rounded-md border border-slate-500/40 bg-bg/60 p-0.5 sm:h-10 lg:order-none lg:col-span-1 lg:w-[330px]">
                {sideTabs.map(([key, label]) => (
                  <Link
                    key={key}
                    href={key === "both" ? basePlayerHref : `${basePlayerHref}?side=${key}`}
                    scroll={false}
                    className={`flex h-7 min-w-0 items-center justify-center rounded px-1 text-center text-[10px] font-bold leading-none transition sm:h-9 sm:px-2 sm:text-sm ${selectedSide === key ? "bg-slate-500/70 text-white" : "text-slate-400 hover:text-accent"}`}
                  >
                    {label}
                  </Link>
                ))}
              </div>
              <span className="text-right font-rajdhani text-xl font-bold leading-none text-slate-200 sm:text-2xl">{selectedSideValue.rating.toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-2 gap-1 sm:gap-2">
              {sideBarStats(stats, selectedSide).map(([label, value, hint]) => bar(label, value, hint))}
            </div>
          </div>
        </div>

        <div className="rounded-md border border-line bg-surface p-2 sm:p-4">
          <h2 className="font-rajdhani text-xl font-bold leading-none sm:text-2xl">Complete statistics</h2>
          <div className="mt-2 grid grid-cols-2 overflow-hidden rounded-md border border-line bg-surface2 sm:mt-3 md:grid-cols-2">
            {[
              ["Kills", stats?.kills || 0],
              ["Deaths", stats?.deaths || 0],
              ["Assists", stats?.assists || 0],
              ["Rounds", stats?.rounds || 0],
              ["KPR", stats?.kpr.toFixed(2) || "0.00"],
              ["DPR", stats?.dpr.toFixed(2) || "0.00"],
              ["KAST", `${stats?.kast.toFixed(1) || "0.0"}%`],
              ["Round swing", `${(stats?.roundSwing || 0) >= 0 ? "+" : ""}${stats?.roundSwing.toFixed(2) || "0.00"}%`],
              ["ADR", stats?.adr.toFixed(1) || "0.0"],
              ["Headshots", `${stats?.headshots || 0} (${stats?.hsPercent.toFixed(1) || "0.0"}%)`],
              ["Opening K-D", `${stats?.firstKills || 0}-${stats?.firstDeaths || 0}`],
              ["Trade kills", stats?.tradeKills || 0],
              ["Traded deaths", stats?.tradedDeaths || 0],
              ["Sniper kills", stats?.sniperKills || 0],
              ["Multi-kill rounds", stats?.multiKillRounds || 0],
              ["Flash assists", stats?.flashAssists || 0],
              ["Damage", stats?.damage || 0]
            ].map(([label, value]) => (
              <div key={label} className="grid grid-cols-[1fr_auto] items-center gap-2 border-b border-line px-2 py-1 odd:border-r sm:px-3 sm:py-1.5 md:[&:nth-last-child(-n+2)]:border-b-0 md:odd:border-r">
                <div className="truncate text-[8px] font-extrabold uppercase tracking-[0.14em] text-slate-500 sm:text-[10px] sm:tracking-[0.2em]">{label}</div>
                <div className="font-rajdhani text-sm font-bold text-slate-100 sm:text-lg">{value}</div>
              </div>
            ))}
          </div>

          <h3 className="mt-3 font-rajdhani text-lg font-bold text-slate-300 sm:mt-4 sm:text-xl">Parsed matches</h3>
          <div className="mt-2 grid gap-2">
            {(stats?.matchIds || []).map((matchId) => (
              <Link key={matchId} href={`/matches/${matchId}`} className="rounded-xl border border-line bg-surface2 px-3 py-2 font-bold text-slate-300 transition hover:border-accent hover:text-accent">
                Match #{matchId}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
