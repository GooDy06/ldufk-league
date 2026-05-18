import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Player } from "@/lib/types";
import { DEFAULT_PLAYER_AVATAR } from "@/components/roster-showcase";
import { getManualTeamForNick, getPlayerStatsByNick } from "@/lib/player-stats";

export const dynamic = "force-dynamic";

function bar(label: string, value: number) {
  return (
    <div className="border-b border-line/70 py-2 last:border-0">
      <div className="mb-1 flex items-end justify-between gap-3">
        <div className="font-rajdhani text-xl font-bold text-slate-300">{label}</div>
        <div className="font-rajdhani text-xl font-bold text-slate-300">{value}<span className="text-sm text-slate-500">/100</span></div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-700/40">
        <div className="h-full rounded-full bg-cyan-300" style={{ width: `${Math.max(2, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}

export default async function PlayerPage({ params }: { params: { nick: string } }) {
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

  return (
    <div className="py-5 sm:py-8">
      <section className="overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="grid gap-4 bg-surface2 p-3 sm:p-5 md:grid-cols-[240px_1fr] lg:grid-cols-[260px_1fr]">
          <div className="relative min-h-[180px] overflow-hidden rounded-xl border border-line bg-gradient-to-br from-slate-700/40 to-bg sm:min-h-[240px] md:min-h-[260px]">
            <div className="absolute inset-0 opacity-20" style={{ background: `linear-gradient(135deg, transparent 35%, ${player?.team?.color || manualTeam?.color || "#18d7ff"} 36%, transparent 64%)` }} />
            <img src={player?.avatar_url || DEFAULT_PLAYER_AVATAR} alt={displayNick} className="relative h-full w-full object-contain object-bottom" />
          </div>
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-accent">Player</div>
            <h1 className="break-words font-rajdhani text-4xl font-bold text-slate-100 sm:text-5xl md:text-6xl">{displayNick}</h1>
            <div className="mt-1 text-sm font-bold uppercase tracking-widest text-slate-500 sm:mt-2 sm:text-xl">{player?.role || "Rifler"}</div>
            <div className="mt-4 divide-y divide-line text-sm sm:mt-5 sm:text-lg">
              <div className="grid grid-cols-[120px_1fr] gap-2 py-2 sm:grid-cols-[180px_1fr] sm:py-3"><strong className="text-slate-400">Current team</strong><span>{teamName}</span></div>
              <div className="grid grid-cols-[120px_1fr] gap-2 py-2 sm:grid-cols-[180px_1fr] sm:py-3"><strong className="text-slate-400">Rating 3.0</strong><span className={rating >= 1 ? "text-emerald-300" : "text-red-300"}>{rating.toFixed(2)}</span></div>
              <div className="grid grid-cols-[120px_1fr] gap-2 py-2 sm:grid-cols-[180px_1fr] sm:py-3"><strong className="text-slate-400">Maps</strong><span>{stats?.maps || 0}</span></div>
              <div className="grid grid-cols-[120px_1fr] gap-2 py-2 sm:grid-cols-[180px_1fr] sm:py-3"><strong className="text-slate-400">K/D</strong><span>{stats ? `${stats.kills}/${stats.deaths} (${stats.kd.toFixed(2)})` : "0/0"}</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <h2 className="font-rajdhani text-2xl font-bold sm:text-3xl">{displayNick} statistics</h2>
            <div className="text-sm font-bold text-slate-500">All parsed demos · {stats?.maps || 0} maps</div>
          </div>
          <div className="rounded-xl border border-line bg-surface2 p-4">
            <div className="mb-3 flex items-center justify-between border-b border-line pb-3">
              <strong className="font-rajdhani text-xl text-slate-300">Rating 3.0</strong>
              <span className="font-rajdhani text-3xl font-bold text-slate-200">{rating.toFixed(2)}</span>
            </div>
            {bar("Firepower", stats?.firepower || 0)}
            {bar("Entrying", stats?.entrying || 0)}
            {bar("Trading", stats?.trading || 0)}
            {bar("Opening", stats?.opening || 0)}
            {bar("Clutching", stats?.clutching || 0)}
            {bar("Sniping", stats?.sniping || 0)}
            {bar("Utility", stats?.utility || 0)}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-4">
          <h2 className="font-rajdhani text-3xl font-bold">Detailed stats</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {[
              ["Kills", stats?.kills || 0],
              ["Deaths", stats?.deaths || 0],
              ["Assists", stats?.assists || 0],
              ["ADR", stats?.adr.toFixed(1) || "0.0"],
              ["Headshots", `${stats?.headshots || 0} (${stats?.hsPercent.toFixed(1) || "0.0"}%)`],
              ["Opening K-D", `${stats?.firstKills || 0}-${stats?.firstDeaths || 0}`],
              ["Flash assists", stats?.flashAssists || 0],
              ["Damage", stats?.damage || 0]
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-line bg-surface2 p-3">
                <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">{label}</div>
                <div className="font-rajdhani text-3xl font-bold text-slate-100">{value}</div>
              </div>
            ))}
          </div>

          <h3 className="mt-5 font-rajdhani text-2xl font-bold text-slate-300">Parsed matches</h3>
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
