import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getMatch,
  getMatchMapStats,
  getMatchPlayerStats,
  getOwnSeasons,
  isOwnLotMatch,
  matchStatus,
  matchWinnerName,
  type LotPlayerStat
} from "@/lib/lotgaming";
import { getDemoAnalysis, type DemoAnalysis, type DemoAnalysisPlayer } from "@/lib/demo-analysis";
import { demoFileProxyHref, demoViewerHref, getDemoFile } from "@/lib/demo-files";
import { mapImageFor } from "@/lib/map-assets";

export const dynamic = "force-dynamic";

type StatSide = "all" | "T" | "CT";

function formatDate(value: string | null) {
  if (!value) return "Live";
  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function cleanMapName(value: string | null) {
  if (!value) return "TBA";
  return value.replace(/^de_/, "").replace(/^\w/, (char) => char.toUpperCase());
}

function adr(player: LotPlayerStat) {
  if (!player.roundsplayed) return 0;
  return player.damage / player.roundsplayed;
}

function rating(player: LotPlayerStat) {
  if (!player.roundsplayed) return 0;
  const killPart = (player.kills / player.roundsplayed) / 0.7;
  const damagePart = adr(player) / 85;
  const survivalPart = ((player.roundsplayed - player.deaths) / player.roundsplayed) / 0.7;
  return (killPart * 0.45) + (damagePart * 0.35) + (Math.max(0, survivalPart) * 0.2);
}

function multiKills(player: LotPlayerStat) {
  return (player.k2 || 0) + (player.k3 || 0) + (player.k4 || 0) + (player.k5 || 0);
}

function clutches(player: LotPlayerStat) {
  return (player.v1 || 0) + (player.v2 || 0) + (player.v3 || 0) + (player.v4 || 0) + (player.v5 || 0);
}

function teamRating(players: LotPlayerStat[]) {
  if (!players.length) return "0.00";
  return (players.reduce((sum, player) => sum + rating(player), 0) / players.length).toFixed(2);
}

function teamClutches(players: LotPlayerStat[]) {
  return players.reduce((sum, player) => sum + clutches(player), 0);
}

function openingKills(player: LotPlayerStat) {
  return (player.firstkill_ct || 0) + (player.firstkill_t || 0);
}

function openingDeaths(player: LotPlayerStat) {
  return (player.firstdeath_ct || 0) + (player.firstdeath_t || 0);
}

function hasRealValue(players: LotPlayerStat[], getValue: (player: LotPlayerStat) => number | undefined) {
  return players.some((player) => Number(getValue(player) || 0) > 0);
}

function demoPlayerOpening(player: DemoAnalysisPlayer | undefined) {
  if (!player) return { firstKills: 0, firstDeaths: 0, flashAssists: 0 };
  const sides = Object.values(player.sides);
  return {
    firstKills: sides.reduce((sum, side) => sum + side.firstKills, 0),
    firstDeaths: sides.reduce((sum, side) => sum + side.firstDeaths, 0),
    flashAssists: sides.reduce((sum, side) => sum + side.flashAssists, 0)
  };
}

function leader(players: LotPlayerStat[], label: string, getValue: (player: LotPlayerStat) => number, format = (value: number) => String(value)) {
  const player = [...players].sort((a, b) => getValue(b) - getValue(a))[0];
  if (!player) return null;
  const value = getValue(player);
  return { label, name: player.name, value: format(value) };
}

function sideRating(stats: { kills: number; deaths: number; damage: number }, rounds: number) {
  if (!rounds) return 0;
  const killPart = (stats.kills / rounds) / 0.7;
  const damagePart = (stats.damage / rounds) / 85;
  const survivalPart = ((rounds - stats.deaths) / rounds) / 0.7;
  return (killPart * 0.45) + (damagePart * 0.35) + (Math.max(0, survivalPart) * 0.2);
}

function PlayerTable({
  title,
  players,
  winner,
  demoPlayers,
  selectedSide,
  sideRounds
}: {
  title: string;
  players: LotPlayerStat[];
  winner: boolean;
  demoPlayers: Map<string, DemoAnalysisPlayer>;
  selectedSide: StatSide;
  sideRounds: number;
}) {
  const sorted = [...players].sort((a, b) => {
    if (selectedSide !== "all") {
      const aSide = demoPlayers.get(a.steam_id)?.sides[selectedSide];
      const bSide = demoPlayers.get(b.steam_id)?.sides[selectedSide];
      return sideRating(bSide || { kills: 0, deaths: 0, damage: 0 }, sideRounds) - sideRating(aSide || { kills: 0, deaths: 0, damage: 0 }, sideRounds) || (bSide?.kills || 0) - (aSide?.kills || 0);
    }
    return rating(b) - rating(a) || b.kills - a.kills;
  });
  const showOpening = hasRealValue(players, openingKills) || hasRealValue(players, openingDeaths) || players.some((player) => {
    const demo = demoPlayerOpening(demoPlayers.get(player.steam_id));
    return demo.firstKills > 0 || demo.firstDeaths > 0;
  });
  const showKast = selectedSide === "all" && hasRealValue(players, (player) => player.kast);
  const showFlash = hasRealValue(players, (player) => player.flashbang_assists) || players.some((player) => demoPlayerOpening(demoPlayers.get(player.steam_id)).flashAssists > 0);
  const showMvp = selectedSide === "all" && hasRealValue(players, (player) => player.mvp);
  const showLotOnlyColumns = selectedSide === "all";

  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-surface2">
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-line bg-bg/30">
            <th className={`px-3 py-2 font-rajdhani text-xl font-bold ${winner ? "text-white" : "text-slate-400"}`}>{title}</th>
            {showOpening ? <th className="px-2 py-2 text-right text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">Op. K-D</th> : null}
            {showLotOnlyColumns ? <th className="px-2 py-2 text-right text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">MKs</th> : null}
            {showLotOnlyColumns ? <th className="px-2 py-2 text-right text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">1vsX</th> : null}
            <th className="px-2 py-2 text-right text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">K (hs)</th>
            <th className="px-2 py-2 text-right text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">A</th>
            {showFlash ? <th className="px-2 py-2 text-right text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">FA</th> : null}
            <th className="px-2 py-2 text-right text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">D</th>
            <th className="px-2 py-2 text-right text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">ADR</th>
            {showKast ? <th className="px-2 py-2 text-right text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">KAST</th> : null}
            {showMvp ? <th className="px-2 py-2 text-right text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">MVP</th> : null}
            <th className="px-3 py-2 text-right text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">Rating</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((player) => {
            const demoPlayer = demoPlayers.get(player.steam_id);
            const sideStats = selectedSide === "all" ? null : demoPlayer?.sides[selectedSide];
            const demo = selectedSide === "all" ? demoPlayerOpening(demoPlayer) : {
              firstKills: sideStats?.firstKills || 0,
              firstDeaths: sideStats?.firstDeaths || 0,
              flashAssists: sideStats?.flashAssists || 0
            };
            const kills = sideStats?.kills ?? player.kills;
            const deaths = sideStats?.deaths ?? player.deaths;
            const assists = sideStats?.assists ?? player.assists;
            const damage = sideStats?.damage ?? player.damage;
            const headshots = sideStats?.headshots ?? player.headshot_kills ?? 0;
            const rounds = selectedSide === "all" ? player.roundsplayed : sideRounds;
            const playerRating = selectedSide === "all" ? rating(player) : sideRating({ kills, deaths, damage }, rounds);
            const playerAdr = rounds ? damage / rounds : 0;
            const firstKills = demo.firstKills || (selectedSide === "all" ? openingKills(player) : 0);
            const firstDeaths = demo.firstDeaths || (selectedSide === "all" ? openingDeaths(player) : 0);
            const flashAssists = demo.flashAssists || (selectedSide === "all" ? player.flashbang_assists || 0 : 0);
            return (
              <tr key={`${player.steam_id}-${player.map_id}`} className="border-b border-line/70 last:border-0">
                <td className="px-3 py-2 font-bold text-slate-200">{player.name}</td>
                {showOpening ? <td className="px-2 py-2 text-right font-rajdhani text-lg font-bold text-slate-300">{firstKills}-{firstDeaths}</td> : null}
                {showLotOnlyColumns ? <td className="px-2 py-2 text-right font-rajdhani text-lg font-bold text-slate-300">{multiKills(player)}</td> : null}
                {showLotOnlyColumns ? <td className="px-2 py-2 text-right font-rajdhani text-lg font-bold text-slate-300">{clutches(player)}</td> : null}
                <td className="px-2 py-2 text-right font-rajdhani text-lg font-bold text-slate-300">{kills} ({headshots})</td>
                <td className="px-2 py-2 text-right font-rajdhani text-lg font-bold text-slate-300">{assists}</td>
                {showFlash ? <td className="px-2 py-2 text-right font-rajdhani text-lg font-bold text-slate-300">{flashAssists}</td> : null}
                <td className="px-2 py-2 text-right font-rajdhani text-lg font-bold text-slate-300">{deaths}</td>
                <td className="px-2 py-2 text-right font-rajdhani text-lg font-bold text-slate-300">{playerAdr.toFixed(1)}</td>
                {showKast ? <td className="px-2 py-2 text-right font-rajdhani text-lg font-bold text-slate-300">{Number(player.kast || 0).toFixed(1)}%</td> : null}
                {showMvp ? <td className="px-2 py-2 text-right font-rajdhani text-lg font-bold text-slate-300">{player.mvp || 0}</td> : null}
                <td className={`px-3 py-2 text-right font-rajdhani text-lg font-bold ${playerRating >= 1 ? "text-emerald-300" : "text-red-300"}`}>{playerRating.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function reasonLabel(reason: string | null) {
  if (reason === "t_killed") return "elimination";
  if (reason === "ct_killed") return "elimination";
  if (reason === "bomb_defused") return "defuse";
  if (reason === "target_bombed") return "bomb";
  return reason || "round";
}

function RoundHistory({ analysis }: { analysis: DemoAnalysis }) {
  const teams = [...new Set([
    ...analysis.teamSideStats.map((item) => item.teamName),
    ...analysis.rounds.map((round) => round.winnerTeam)
  ])].filter(Boolean).slice(0, 2);
  const columns = `repeat(${analysis.rounds.length}, minmax(30px, 1fr))`;

  return (
    <section className="mt-4 rounded-2xl border border-line bg-surface p-4">
      <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">Demo Analysis</div>
      <h2 className="font-rajdhani text-3xl font-bold text-slate-100">Round history</h2>
      <div className="mt-3 overflow-x-auto rounded-xl border border-line bg-surface2 p-3">
        <div className="min-w-[720px]">
          <div className="grid pl-32 text-center font-rajdhani text-sm font-bold text-slate-600" style={{ gridTemplateColumns: columns }}>
            {analysis.rounds.map((round) => (
              <div key={`number-${round.roundNumber}`}>{round.roundNumber}</div>
            ))}
          </div>
          {teams.map((team) => (
            <div key={team} className="grid grid-cols-[128px_1fr] items-center border-t border-line/80 py-2 first:mt-1">
              <div className="truncate pr-3 font-rajdhani text-xl font-bold text-slate-200">{team}</div>
              <div className="grid gap-1" style={{ gridTemplateColumns: columns }}>
                {analysis.rounds.map((round) => {
                  const won = round.winnerTeam === team;
                  const sideClass = round.winnerSide === "CT" ? "border-cyan-300/70 bg-cyan-300/20 text-cyan-200" : "border-red-300/70 bg-red-300/20 text-red-200";
                  const firstKill = round.firstKill ? `${round.firstKill.attacker || "Unknown"} > ${round.firstKill.victim || "Unknown"}` : "No opening kill";
                  const bomb = round.bombEvents.find((event) => event.type === "planted" || event.type === "defused" || event.type === "exploded");

                  return (
                    <div
                      key={`${team}-${round.roundNumber}`}
                      title={won ? `R${round.roundNumber}: ${round.winnerTeam} (${round.winnerSide}) · ${reasonLabel(round.reason)} · ${firstKill}${bomb ? ` · bomb ${bomb.type}` : ""}` : undefined}
                      className={`h-8 rounded-lg border text-center font-rajdhani text-sm font-bold leading-8 ${won ? sideClass : "border-transparent bg-bg/30 text-transparent"}`}
                    >
                      {won ? round.winnerSide : "-"}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="mt-2 flex flex-wrap gap-3 border-t border-line/70 pt-2 text-xs font-bold text-slate-500">
            <span><span className="mr-1 inline-block h-3 w-3 rounded bg-red-300/50 align-middle" />T round</span>
            <span><span className="mr-1 inline-block h-3 w-3 rounded bg-cyan-300/50 align-middle" />CT round</span>
            <span>Hover по раунду показує opening kill і причину раунду.</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default async function MatchDetailPage({ params, searchParams }: { params: { id: string }; searchParams: { side?: string } }) {
  const [match, mapstats, playerstats, seasons] = await Promise.all([
    getMatch(params.id),
    getMatchMapStats(params.id),
    getMatchPlayerStats(params.id),
    getOwnSeasons()
  ]);

  if (!match || !isOwnLotMatch(match)) notFound();

  const status = matchStatus(match);
  const winner = matchWinnerName(match);
  const firstMap = mapstats[0];
  const team1Players = playerstats.filter((player) => player.team_id === match.team1_id);
  const team2Players = playerstats.filter((player) => player.team_id === match.team2_id);
  const hasOpeningStats = hasRealValue(playerstats, openingKills) || hasRealValue(playerstats, openingDeaths);
  const hasFlashStats = hasRealValue(playerstats, (player) => player.flashbang_assists);
  const team1Score = firstMap?.team1_score ?? match.team1_mapscore ?? match.team1_score ?? 0;
  const team2Score = firstMap?.team2_score ?? match.team2_mapscore ?? match.team2_score ?? 0;
  const seasonName = seasons.find((season) => season.id === match.season_id)?.name || `Season ${match.season_id || "TBA"}`;
  const mapImage = mapImageFor(firstMap?.map_name);
  const demoFile = getDemoFile(params.id);
  const demoAnalysis = getDemoAnalysis(params.id);
  const demoPlayers = new Map((demoAnalysis?.players || []).map((player) => [player.steamId, player]));
  const selectedSide: StatSide = demoAnalysis && (searchParams.side === "T" || searchParams.side === "CT") ? searchParams.side : "all";
  const allPlayers = [...team1Players, ...team2Players];
  const demoOpeningBySteam = new Map((demoAnalysis?.players || []).map((player) => [player.steamId, demoPlayerOpening(player)]));
  const getPlayerOpeningKills = (player: LotPlayerStat) => demoOpeningBySteam.get(player.steam_id)?.firstKills || openingKills(player);
  const getPlayerFlashAssists = (player: LotPlayerStat) => demoOpeningBySteam.get(player.steam_id)?.flashAssists || player.flashbang_assists || 0;
  const leaders = [
    leader(allPlayers, "Most kills", (player) => player.kills || 0),
    leader(allPlayers, "Most damage", (player) => player.damage || 0),
    leader(allPlayers, "Most assists", (player) => player.assists || 0),
    (hasOpeningStats || demoAnalysis) ? leader(allPlayers, "Most opening kills", getPlayerOpeningKills) : null,
    (hasFlashStats || demoAnalysis) ? leader(allPlayers, "Most flash assists", getPlayerFlashAssists) : null,
    leader(allPlayers, "Best rating", rating, (value) => value.toFixed(2))
  ].filter(Boolean) as { label: string; name: string; value: string }[];
  const performance = [...allPlayers].sort((a, b) => rating(b) - rating(a)).slice(0, 10);
  const team1OpeningKills = team1Players.reduce((sum, player) => sum + getPlayerOpeningKills(player), 0);
  const team2OpeningKills = team2Players.reduce((sum, player) => sum + getPlayerOpeningKills(player), 0);
  const sideRoundsFor = (teamName: string) => {
    if (!demoAnalysis || selectedSide === "all") return 0;
    return demoAnalysis.teamSideStats.find((item) => item.teamName === teamName && item.side === selectedSide)?.roundsPlayed || 0;
  };
  const sideTabs: Array<{ label: string; value: StatSide }> = [
    { label: "All", value: "all" },
    { label: "T side", value: "T" },
    { label: "CT side", value: "CT" }
  ];

  return (
    <div className="py-5 sm:py-8">
      <Link href="/matches" className="text-sm font-bold text-accent hover:text-white">Назад до матчів</Link>

      <section
        className="mx-auto mt-4 overflow-hidden rounded-2xl border border-line bg-surface bg-cover bg-center"
        style={mapImage ? { backgroundImage: `linear-gradient(90deg, rgba(255, 154, 162, 0.14), rgba(7, 12, 22, 0.9) 34%, rgba(7, 12, 22, 0.9) 66%, rgba(111, 240, 194, 0.14)), url(${mapImage})` } : undefined}
      >
        <div className="grid grid-cols-[1fr_108px_1fr] items-center gap-2 p-3 backdrop-blur-[1px] sm:grid-cols-[1fr_150px_1fr] sm:p-4 md:grid-cols-[1fr_190px_1fr]">
          <div className="min-w-0">
            <div className={`truncate font-rajdhani text-xl font-bold sm:text-3xl md:text-4xl ${winner === match.team1_string ? "text-white" : "text-slate-400"}`}>{match.team1_string}</div>
            <div className={`mt-0.5 font-rajdhani text-3xl font-bold ${winner === match.team1_string ? "text-emerald-300" : "text-red-300"}`}>{team1Score}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-accent">{seasonName}</div>
            <div className="mt-1 font-rajdhani text-2xl font-bold text-slate-100">{cleanMapName(firstMap?.map_name || null)}</div>
            <div className="mt-1 rounded-full border border-line bg-bg/50 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">{status === "live" ? "Live" : status === "cancelled" ? "Cancelled" : "Match over"}</div>
          </div>
          <div className="min-w-0 text-right">
            <div className={`truncate font-rajdhani text-xl font-bold sm:text-3xl md:text-4xl ${winner === match.team2_string ? "text-white" : "text-slate-400"}`}>{match.team2_string}</div>
            <div className={`mt-0.5 font-rajdhani text-3xl font-bold ${winner === match.team2_string ? "text-emerald-300" : "text-red-300"}`}>{team2Score}</div>
          </div>
        </div>
      </section>

      {demoFile ? (
        <section className="mx-auto mt-4 rounded-2xl border border-line bg-surface p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">Demo Replay</div>
              <div className="font-rajdhani text-2xl font-bold text-slate-200">{demoFile.label}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={demoViewerHref(demoFile.url)}
                target="_blank"
                className="rounded-xl border border-accent bg-accent px-4 py-2 text-sm font-extrabold uppercase tracking-[0.14em] text-bg transition hover:bg-cyan-300"
              >
                2D Demo
              </Link>
              <Link
                href={demoFileProxyHref(demoFile.url)}
                target="_blank"
                download
                className="rounded-xl border border-line bg-surface2 px-4 py-2 text-sm font-extrabold uppercase tracking-[0.14em] text-slate-300 transition hover:border-accent hover:text-accent"
              >
                Download demo
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto mt-4 grid gap-3 lg:grid-cols-[0.95fr_1fr]">
        <div className="relative overflow-hidden rounded-2xl border border-line bg-surface">
          {mapImage ? (
            <div
              className="absolute inset-0 scale-110 bg-cover bg-center opacity-55 blur-sm"
              style={{ backgroundImage: `linear-gradient(rgba(2, 6, 12, 0.5), rgba(2, 6, 12, 0.78)), url(${mapImage})` }}
            />
          ) : null}
          <div className="relative bg-accent/15 px-4 py-2 text-center text-sm font-bold text-white backdrop-blur-[2px]">{seasonName}</div>
          <div className="relative grid grid-cols-[1fr_76px_1fr] items-center gap-2 px-3 py-3 text-center sm:grid-cols-[1fr_100px_1fr] sm:gap-3 sm:px-4 sm:py-4">
            <div>
              <div className="truncate font-rajdhani text-xl font-bold md:text-3xl">{match.team1_string}</div>
              <div className={`mt-1 font-rajdhani text-3xl font-bold ${team1Score > team2Score ? "text-emerald-300" : "text-red-300"}`}>{team1Score}</div>
            </div>
            <div className="text-sm font-extrabold uppercase tracking-[0.18em] text-slate-500">Map<br /><span className="text-white">{cleanMapName(firstMap?.map_name || null)}</span></div>
            <div>
              <div className="truncate font-rajdhani text-xl font-bold md:text-3xl">{match.team2_string}</div>
              <div className={`mt-1 font-rajdhani text-3xl font-bold ${team2Score > team1Score ? "text-emerald-300" : "text-red-300"}`}>{team2Score}</div>
            </div>
          </div>
          <div className="relative divide-y divide-line border-t border-line bg-surface/90 text-sm backdrop-blur-[2px]">
            <div className="grid grid-cols-[1fr_auto] px-4 py-2"><strong>Breakdown</strong><span><span className="text-red-300">{team1Score}</span> <span className="text-white">:</span> <span className="text-emerald-300">{team2Score}</span></span></div>
            <div className="grid grid-cols-[1fr_auto] px-4 py-2"><strong>Team rating</strong><span>{teamRating(team1Players)} <span className="text-white">:</span> {teamRating(team2Players)}</span></div>
            {(hasOpeningStats || demoAnalysis) ? <div className="grid grid-cols-[1fr_auto] px-4 py-2"><strong>Opening kills</strong><span>{team1OpeningKills} <span className="text-white">:</span> {team2OpeningKills}</span></div> : null}
            <div className="grid grid-cols-[1fr_auto] px-4 py-2"><strong>Clutches won</strong><span>{teamClutches(team1Players)} <span className="text-white">:</span> {teamClutches(team2Players)}</span></div>
            <div className="grid grid-cols-[1fr_auto] px-4 py-2"><strong>Started</strong><span>{formatDate(firstMap?.start_time || match.start_time)}</span></div>
          </div>
        </div>

        <div className="grid gap-2">
          {leaders.map((item) => (
            <div key={item.label} className="grid grid-cols-[1fr_auto] items-center rounded-xl border border-line bg-surface2 px-4 py-3">
              <div>
                <div className="font-rajdhani text-2xl font-bold text-slate-200">{item.name}</div>
                <div className="text-sm text-slate-500">{item.label}</div>
              </div>
              <div className="font-rajdhani text-3xl font-bold text-accent">{item.value}</div>
            </div>
          ))}
        </div>
      </section>

      {demoAnalysis ? <RoundHistory analysis={demoAnalysis} /> : null}

      <section className="mt-5 grid gap-4">
        {demoAnalysis ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-3">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">Players</div>
              <h2 className="font-rajdhani text-2xl font-bold text-slate-100">Статистика гравців</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {sideTabs.map((tab) => {
                const href = tab.value === "all" ? `/matches/${params.id}` : `/matches/${params.id}?side=${tab.value}`;
                return (
                  <Link
                    key={tab.value}
                    href={href}
                    scroll={false}
                    className={`rounded-xl px-3 py-2 text-sm font-extrabold transition ${selectedSide === tab.value ? "bg-accent text-bg" : "bg-surface2 text-slate-400 hover:text-white"}`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}
        <PlayerTable title={match.team1_string} players={team1Players} winner={winner === match.team1_string} demoPlayers={demoPlayers} selectedSide={selectedSide} sideRounds={sideRoundsFor(match.team1_string)} />
        <PlayerTable title={match.team2_string} players={team2Players} winner={winner === match.team2_string} demoPlayers={demoPlayers} selectedSide={selectedSide} sideRounds={sideRoundsFor(match.team2_string)} />
      </section>

      <section className="mt-5 rounded-2xl border border-line bg-surface p-4">
        <h2 className="font-rajdhani text-2xl font-bold text-slate-400">Performance · rating</h2>
        <div className="mt-3 rounded-2xl border border-line bg-surface2 p-4">
          {performance.map((player) => {
            const value = rating(player);
            return (
              <div key={player.steam_id} className="grid grid-cols-[120px_1fr_54px] items-center gap-3 py-2">
                <div className="truncate text-right text-sm font-bold text-slate-500">{player.name}</div>
                <div className="h-6 overflow-hidden rounded-full bg-bg">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(100, Math.max(8, (value / 1.7) * 100))}%` }} />
                </div>
                <div className="font-rajdhani text-xl font-bold text-slate-200">{value.toFixed(2)}</div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
