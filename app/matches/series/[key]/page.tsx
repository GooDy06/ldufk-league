import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getMatchMapStats,
  getMatchPlayerStats,
  getOwnSeasons,
  getOwnRecentMatches,
  groupMatchesIntoSeries,
  matchStatus,
  matchWinnerName,
  type LotMatch,
  type LotPlayerStat
} from "@/lib/lotgaming";
import { mapImageFor } from "@/lib/map-assets";

export const dynamic = "force-dynamic";

type PlayerAggregate = {
  steamId: string;
  name: string;
  teamName: string;
  teamId: number;
  kills: number;
  deaths: number;
  assists: number;
  damage: number;
  rounds: number;
};

function statusLabel(match: LotMatch) {
  const status = matchStatus(match);
  if (status === "live") return "Live";
  if (status === "cancelled") return "Cancelled";
  return "Finished";
}

function aggregatePlayers(stats: LotPlayerStat[], series: NonNullable<ReturnType<typeof groupMatchesIntoSeries>[number]>) {
  const players = new Map<string, PlayerAggregate>();

  for (const stat of stats) {
    const teamName = stat.team_id === series.team1Id
      ? series.team1
      : stat.team_id === series.team2Id
        ? series.team2
        : stat.team_name || "Team";
    const current = players.get(stat.steam_id) || {
      steamId: stat.steam_id,
      name: stat.name,
      teamName,
      teamId: stat.team_id,
      kills: 0,
      deaths: 0,
      assists: 0,
      damage: 0,
      rounds: 0
    };

    current.teamName = current.teamName === "Team" ? teamName : current.teamName;
    current.kills += stat.kills || 0;
    current.deaths += stat.deaths || 0;
    current.assists += stat.assists || 0;
    current.damage += stat.damage || 0;
    current.rounds += stat.roundsplayed || 0;
    players.set(stat.steam_id, current);
  }

  return [...players.values()].sort((a, b) => b.kills - a.kills || b.damage - a.damage);
}

function kd(player: PlayerAggregate) {
  if (!player.deaths) return player.kills.toFixed(2);
  return (player.kills / player.deaths).toFixed(2);
}

function adr(player: PlayerAggregate) {
  if (!player.rounds) return "0.0";
  return (player.damage / player.rounds).toFixed(1);
}

function rating(player: PlayerAggregate) {
  if (!player.rounds) return "0.00";
  const killPart = (player.kills / player.rounds) / 0.7;
  const damagePart = player.damage / player.rounds / 85;
  const survivalPart = ((player.rounds - player.deaths) / player.rounds) / 0.7;
  return ((killPart * 0.45) + (damagePart * 0.35) + (Math.max(0, survivalPart) * 0.2)).toFixed(2);
}

function cleanMapName(value: string | null) {
  if (!value) return "TBA";
  return value.replace(/^de_/, "").replace(/^\w/, (char) => char.toUpperCase());
}

function teamPlayers(players: PlayerAggregate[], teamId: number) {
  return players.filter((player) => player.teamId === teamId).sort((a, b) => Number(rating(b)) - Number(rating(a)) || b.kills - a.kills);
}

function PlayerStatsTable({ title, players, winner }: { title: string; players: PlayerAggregate[]; winner: boolean }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface2">
      <div className="grid grid-cols-[1fr_64px_64px_70px] items-center border-b border-line bg-bg/40 px-3 py-2 text-sm md:grid-cols-[1fr_76px_76px_80px]">
        <div className={`font-rajdhani text-xl font-bold ${winner ? "text-white" : "text-slate-400"}`}>{title}</div>
        <div className="text-right text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">K-D</div>
        <div className="text-right text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">ADR</div>
        <div className="text-right text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">Rating</div>
      </div>
      {players.map((player) => {
        const playerRating = Number(rating(player));
        return (
          <div key={player.steamId} className="grid grid-cols-[1fr_64px_64px_70px] items-center border-b border-line/70 px-3 py-2 text-sm last:border-0 md:grid-cols-[1fr_76px_76px_80px]">
            <div className="min-w-0">
              <div className="truncate font-bold text-slate-200">{player.name}</div>
            </div>
            <div className="text-right font-rajdhani text-lg font-bold text-slate-300">{player.kills}-{player.deaths}</div>
            <div className="text-right font-rajdhani text-lg font-bold text-slate-300">{adr(player)}</div>
            <div className={`text-right font-rajdhani text-lg font-bold ${playerRating >= 1 ? "text-emerald-300" : "text-red-300"}`}>{playerRating.toFixed(2)}</div>
          </div>
        );
      })}
    </div>
  );
}

export default async function MatchSeriesPage({ params, searchParams }: { params: { key: string }; searchParams: { map?: string } }) {
  const matches = await getOwnRecentMatches(160);
  const series = groupMatchesIntoSeries(matches).find((item) => item.key === params.key);

  if (!series) notFound();

  const mapStatsByMatch = await Promise.all(series.matches.map(async (match) => ({
    match,
    maps: await getMatchMapStats(match.id),
    playerStats: await getMatchPlayerStats(match.id)
  })));
  const seasons = await getOwnSeasons();
  const seasonName = seasons.find((season) => season.id === series.seasonId)?.name || `Season ${series.seasonId || "TBA"}`;
  const selectedBundle = mapStatsByMatch.find(({ match }) => String(match.id) === searchParams.map);
  const selectedStats = selectedBundle ? selectedBundle.playerStats : mapStatsByMatch.flatMap((bundle) => bundle.playerStats);
  const players = aggregatePlayers(selectedStats, series);
  const winner = series.team1Wins === series.team2Wins ? null : series.team1Wins > series.team2Wins ? series.team1 : series.team2;
  const baseHref = `/matches/series/${params.key}`;

  return (
    <div className="py-5 sm:py-8">
      <Link href="/matches" className="text-sm font-bold text-accent hover:text-white">Назад до матчів</Link>

      <section className="mx-auto mt-4 max-w-5xl overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="border-b border-line px-3 py-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-accent">Match Series · BO{series.matches.length}</div>
            <div className={`rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] ${series.status === "live" ? "border-red-400/40 text-red-300" : "border-line text-slate-400"}`}>
              {series.status === "live" ? "Live" : series.status === "cancelled" ? "Cancelled" : "Finished"}
            </div>
          </div>

          <div className="mt-2 grid grid-cols-[1fr_116px_1fr] items-center gap-2 sm:grid-cols-[1fr_150px_1fr] md:grid-cols-[1fr_170px_1fr]">
            <div className={`truncate font-rajdhani text-xl font-bold sm:text-2xl md:text-3xl ${winner === series.team1 ? "text-white" : "text-slate-400"}`}>{series.team1}</div>
            <div className="text-center">
              <div className="rounded-xl border border-line bg-bg px-2 py-1 font-rajdhani text-xl font-bold sm:px-3 sm:text-2xl md:text-3xl">
                <span className={winner === series.team1 ? "text-emerald-300" : "text-red-300"}>{series.team1Wins}</span>
                <span className="px-1 text-white">:</span>
                <span className={winner === series.team2 ? "text-emerald-300" : "text-red-300"}>{series.team2Wins}</span>
              </div>
              <div className="mt-1 text-[10px] font-bold uppercase leading-snug tracking-[0.14em] text-slate-500">{seasonName}</div>
            </div>
            <div className={`truncate text-right font-rajdhani text-xl font-bold sm:text-2xl md:text-3xl ${winner === series.team2 ? "text-white" : "text-slate-400"}`}>{series.team2}</div>
          </div>

        </div>

        <div className="mx-auto grid max-w-3xl gap-2 p-3 sm:grid-cols-2 lg:grid-cols-3">
          {mapStatsByMatch.map(({ match, maps }, index) => {
            const firstMap = maps[0];
            const mapWinner = matchWinnerName(match);
            const team1Score = firstMap?.team1_score ?? match.team1_mapscore ?? match.team1_score ?? 0;
            const team2Score = firstMap?.team2_score ?? match.team2_mapscore ?? match.team2_score ?? 0;
            const team1Won = mapWinner === match.team1_string;
            const team2Won = mapWinner === match.team2_string;
            const headerColor = index === 1 ? "bg-emerald-500/20" : "bg-accent/20";
            const mapImage = mapImageFor(firstMap?.map_name);

            return (
              <div
                key={match.id}
                className="relative min-h-[108px] overflow-hidden rounded-xl border border-line bg-surface2 bg-cover bg-center shadow-[0_16px_40px_rgba(0,0,0,0.18)]"
                style={mapImage ? { backgroundImage: `linear-gradient(rgba(7, 12, 22, 0.42), rgba(7, 12, 22, 0.86)), url(${mapImage})` } : undefined}
              >
                <div className={`px-3 py-1 text-center font-rajdhani text-lg font-bold text-white backdrop-blur-[1px] ${headerColor}`}>
                  {cleanMapName(firstMap?.map_name || null)}
                </div>
                <div className="grid grid-cols-[1fr_72px_1fr] items-center gap-2 px-3 py-2">
                  <div className="min-w-0">
                    <div className={`truncate font-rajdhani text-xl font-bold ${team1Won ? "text-white" : "text-slate-400"}`}>{match.team1_string}</div>
                    <div className={`font-rajdhani text-2xl font-bold leading-none ${team1Won ? "text-emerald-300" : "text-red-300"}`}>{team1Score}</div>
                  </div>
                  <div className="text-center">
                    <Link href={`/matches/${match.id}`} className="inline-flex rounded-lg border border-line bg-bg/90 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-300 transition hover:border-accent hover:text-accent">Stats</Link>
                    <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">Map {index + 1}</div>
                  </div>
                  <div className="min-w-0 text-right">
                    <div className={`truncate font-rajdhani text-xl font-bold ${team2Won ? "text-white" : "text-slate-400"}`}>{match.team2_string}</div>
                    <div className={`font-rajdhani text-2xl font-bold leading-none ${team2Won ? "text-emerald-300" : "text-red-300"}`}>{team2Score}</div>
                    <div className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{statusLabel(match)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section id="stats" className="mx-auto mt-4 max-w-5xl rounded-2xl border border-line bg-surface p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">Match Stats</div>
            <h2 className="font-rajdhani text-2xl font-bold">{selectedBundle ? `Статистика мапи ${cleanMapName(selectedBundle.maps[0]?.map_name || null)}` : "Статистика серії"}</h2>
          </div>
          <div className="flex flex-wrap gap-2 text-sm font-bold text-slate-400">
            <Link href={baseHref} scroll={false} className={`rounded-xl px-3 py-2 transition ${!selectedBundle ? "bg-accent text-bg" : "bg-surface2 hover:text-white"}`}>All maps</Link>
            {mapStatsByMatch.map(({ match, maps }, index) => (
              <Link key={match.id} href={`${baseHref}?map=${match.id}`} scroll={false} className={`rounded-xl px-3 py-2 transition ${selectedBundle?.match.id === match.id ? "bg-accent text-bg" : "bg-surface2 hover:text-white"}`}>
                {cleanMapName(maps[0]?.map_name || null)}
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-4 grid gap-3">
          <PlayerStatsTable title={series.team1} players={teamPlayers(players, series.team1Id)} winner={winner === series.team1} />
          <PlayerStatsTable title={series.team2} players={teamPlayers(players, series.team2Id)} winner={winner === series.team2} />
          {!players.length ? <div className="rounded-xl border border-line bg-surface2 p-3 text-sm text-slate-500">Статистика гравців для цієї серії ще не підтягнулась.</div> : null}
        </div>
      </section>
    </div>
  );
}
