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
    <div className="rounded bg-slate-700/45 px-3 py-2">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <div>
          <div className="font-rajdhani text-lg font-bold text-slate-300 sm:text-xl">{label}</div>
          {hint ? <div className="text-[10px] font-semibold text-slate-600">{hint}</div> : null}
        </div>
        <div className="text-right font-rajdhani text-lg font-bold text-slate-300">{value}<span className="text-xs text-slate-500">/100</span></div>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-700/40">
        <div className={`h-full rounded-full ${state.bar} ${state.glow}`} style={{ width: `${Math.max(2, Math.min(100, value))}%` }} />
      </div>
      <div className={`mt-0.5 text-right text-[9px] font-extrabold uppercase tracking-[0.16em] ${state.color}`}>{state.label}</div>
    </div>
  );
}

function heroMetric(label: string, value: string | number, rawScore: number, accent = "text-slate-100") {
  const state = grade(rawScore);
  return (
    <div>
      <div className={`font-rajdhani text-xl font-bold leading-none sm:text-2xl ${accent}`}>{value}</div>
      <div className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.12em] text-sky-200/70">{label}</div>
      <div className="mt-0.5 h-0.5 overflow-hidden rounded-full bg-slate-500/35">
        <div className={`h-full rounded-full ${state.bar} ${state.glow}`} style={{ width: `${Math.max(3, Math.min(100, rawScore))}%` }} />
      </div>
      <div className={`mt-0.5 text-right text-[8px] font-extrabold uppercase tracking-[0.16em] ${state.color}`}>{state.label}</div>
    </div>
  );
}

function socialIcons(player: Player | null) {
  const links = [
    { key: "x", label: "X", href: player?.x_url, node: <span className="font-rajdhani text-lg font-bold">X</span>, className: "bg-black/85 text-slate-200 hover:text-white" },
    { key: "twitch", label: "Twitch", href: player?.twitch_url, node: <img src="/assets/twitch.png" alt="" className="h-4 w-4 object-contain" />, className: "bg-[#6441a5] hover:bg-[#7653bd]" },
    { key: "instagram", label: "Instagram", href: player?.instagram_url, node: <img src="/assets/instagram.png" alt="" className="h-4 w-4 object-contain" />, className: "bg-[#d62976] hover:bg-[#e13f89]" },
    { key: "faceit", label: "FACEIT", href: player?.faceit_url, node: <span className="block h-0 w-0 border-y-[7px] border-l-[13px] border-y-transparent border-l-orange-500" />, className: "bg-black/85 hover:bg-black" },
  ];
  const visible = links.filter((link) => link.href);
  if (!visible.length) return null;

  return (
    <div className="absolute right-3 top-3 z-10 flex gap-2">
      {visible.map((link) => (
        <a key={link.key} href={link.href || "#"} target="_blank" rel="noreferrer" aria-label={link.label} className={`grid h-9 w-9 place-items-center rounded-md border border-white/10 shadow-lg transition ${link.className}`}>
          {link.node}
        </a>
      ))}
    </div>
  );
}

function analyticHero(stats: PlayerComputedStats | null, rating: number, player: Player | null, manualTeam: ReturnType<typeof getManualTeamForNick> | null, displayNick: string, teamName: string) {
  const positiveSwing = (stats?.roundSwing || 0) >= 0;
  const teamColor = player?.team?.color || manualTeam?.color || "#18d7ff";
  const teamInitial = teamName.trim().charAt(0).toUpperCase();
  return (
    <div className="overflow-hidden rounded-sm border border-line bg-[#26313d]">
      <div className="grid min-h-[164px] lg:grid-cols-[270px_1fr]">
        <div className="relative min-h-[196px] overflow-hidden border-r border-line bg-gradient-to-br from-slate-700/50 to-bg lg:min-h-[164px]">
          <div className="absolute inset-y-0 left-0 w-16 border-r border-white/10 bg-white/5" />
          <div className="absolute inset-0 opacity-20" style={{ background: `linear-gradient(135deg, transparent 36%, ${teamColor} 37%, transparent 66%)` }} />
          <div className="absolute left-5 top-4 z-10 grid h-10 w-10 place-items-center rounded-md border border-white/10 bg-bg/65 font-rajdhani text-lg font-bold text-accent shadow-lg">{teamInitial}</div>
          {socialIcons(player)}
          <img src={player?.avatar_url || DEFAULT_PLAYER_AVATAR} alt={displayNick} className="absolute inset-x-1 bottom-[23px] mx-auto h-[115%] w-[112%] object-contain object-bottom" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#111a24] via-[#111a24]/25 to-transparent px-4 pb-1.5 pt-16">
            <h1 className="break-words font-rajdhani text-[1.6rem] font-bold leading-none text-white sm:text-[2.1rem]">{displayNick}</h1>
            <div className="mt-0.5 text-[11px] font-semibold text-slate-400">{teamName}</div>
          </div>
        </div>

        <div className="relative overflow-hidden p-2 sm:p-2.5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_42%_18%,rgba(255,255,255,0.08),transparent_28%),linear-gradient(90deg,rgba(255,154,162,0.06),transparent_46%,rgba(111,240,194,0.06))]" />
          <div className="relative">
            <div className="grid items-center gap-2 lg:grid-cols-[1fr_96px_1fr]">
              <div className="text-center">
                <div className="font-rajdhani text-2xl font-bold text-amber-400">{stats?.tRating.toFixed(2) || "0.00"}</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-300/80">T rating</div>
              </div>

              <div className="mx-auto grid h-24 w-24 place-items-center rounded-full border-[6px] border-slate-600/80 bg-[#202a35]/80 shadow-inner" style={{ borderTopColor: rating >= 1 ? "#44c23a" : "#fca5a5", borderLeftColor: rating >= 1.12 ? "#44c23a" : "#64748b" }}>
                <div className="text-center">
                  <div className={`text-[8px] font-extrabold uppercase tracking-[0.14em] ${rating >= 1 ? "text-green-400" : "text-red-300"}`}>{rating >= 1.15 ? "Great" : rating >= 1 ? "Good" : "Poor"}</div>
                  <div className="font-rajdhani text-3xl font-bold leading-none text-white">{rating.toFixed(2)}</div>
                  <div className="text-[8px] font-bold uppercase tracking-[0.12em] text-sky-200/70">Rating 3.0</div>
                </div>
              </div>

              <div className="text-center">
                <div className="font-rajdhani text-2xl font-bold text-sky-400">{stats?.ctRating.toFixed(2) || "0.00"}</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-sky-300/80">CT rating</div>
              </div>
            </div>

            <div className="mt-2 grid gap-x-4 gap-y-1.5 sm:grid-cols-2 xl:grid-cols-3">
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
    .select("*, team:teams(name, slug, division, color)")
    .ilike("nick", nick)
    .eq("published", true)
    .maybeSingle();

  const player = data as Player | null;
  const stats = getPlayerStatsByNick(player?.nick || nick);
  const manualTeam = getManualTeamForNick(player?.nick || nick);
  const teamName = player?.team?.name || manualTeam?.name || stats?.teamNames[0] || "No team";

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
    <div className="py-5 sm:py-8">
      <section>
        {analyticHero(stats, rating, player, manualTeam, displayNick, teamName)}
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-md border border-line bg-surface p-3 sm:p-4">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <h2 className="font-rajdhani text-2xl font-bold sm:text-3xl">{displayNick} statistics</h2>
            <div className="text-sm font-bold text-slate-500">All parsed demos · {stats?.maps || 0} maps</div>
          </div>
          <div className="rounded-md border border-line bg-surface2 p-3">
            <div className="mb-3 grid items-center gap-3 border-b border-line pb-2 lg:grid-cols-[230px_330px_72px]">
              <div className="min-w-0">
                <strong className="font-rajdhani text-xl text-slate-300">Rating 3.0</strong>
                <div className="text-xs font-bold text-slate-600">
                  {selectedSide === "both" ? "All sides" : selectedSide === "ct" ? "Counter-Terrorist side" : "Terrorist side"} · {selectedSideValue.rounds} rounds
                </div>
              </div>
              <div className="grid w-full grid-cols-3 overflow-hidden rounded-md border border-slate-500/40 bg-bg/60 p-0.5 lg:w-[330px]">
                {sideTabs.map(([key, label]) => (
                  <Link
                    key={key}
                    href={key === "both" ? basePlayerHref : `${basePlayerHref}?side=${key}`}
                    className={`h-9 min-w-0 rounded px-2 text-center text-sm font-bold leading-9 transition ${selectedSide === key ? "bg-slate-500/70 text-white" : "text-slate-400 hover:text-accent"}`}
                  >
                    {label}
                  </Link>
                ))}
              </div>
              <span className="text-right font-rajdhani text-2xl font-bold text-slate-200">{selectedSideValue.rating.toFixed(2)}</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {sideBarStats(stats, selectedSide).map(([label, value, hint]) => bar(label, value, hint))}
            </div>
          </div>
        </div>

        <div className="rounded-md border border-line bg-surface p-3 sm:p-4">
          <h2 className="font-rajdhani text-2xl font-bold">Complete statistics</h2>
          <div className="mt-3 grid overflow-hidden rounded-md border border-line bg-surface2 md:grid-cols-2">
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
              <div key={label} className="grid grid-cols-[1fr_auto] items-center border-b border-line px-3 py-1.5 md:[&:nth-last-child(-n+2)]:border-b-0 md:odd:border-r">
                <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">{label}</div>
                <div className="font-rajdhani text-lg font-bold text-slate-100">{value}</div>
              </div>
            ))}
          </div>

          <h3 className="mt-4 font-rajdhani text-xl font-bold text-slate-300">Parsed matches</h3>
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
