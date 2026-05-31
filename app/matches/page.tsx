import type { Metadata } from "next";
import Link from "next/link";
import {
  getOwnPlayerSummaries,
  getOwnRecentMatches,
  getOwnSeasons,
  getMatchMapStats,
  groupMatchesIntoSeries,
  type LotMapStat,
  type LotSeason,
  type LotMatchSeries
} from "@/lib/lotgaming";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Матчі",
  description: "Матчі та статистика LDUFK League."
};

function formatDate(value: string | null) {
  if (!value) return "Live";
  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatTime(value: string | null) {
  if (!value) return "Live";
  return new Intl.DateTimeFormat("uk-UA", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function tournamentKey(series: LotMatchSeries) {
  return series.seasonId ? String(series.seasonId) : "no-season";
}

function tournamentName(season: LotSeason | undefined, key: string) {
  return season?.name || (key === "no-season" ? "Без турніру" : `Турнір #${key}`);
}

function SeriesRow({ series, mapStats }: { series: LotMatchSeries; mapStats?: LotMapStat[] }) {
  const href = series.matches.length > 1 ? `/matches/series/${series.key}` : `/matches/${series.matches[0].id}`;
  const statusLabel = series.status === "live" ? "Live" : series.status === "cancelled" ? "Cancelled" : "Finished";
  const seriesLabel = series.matches.length > 1 ? `BO${series.matches.length}` : "BO1";
  const winner = series.team1Wins === series.team2Wins ? null : series.team1Wins > series.team2Wins ? series.team1 : series.team2;
  const firstMatch = series.matches[0];
  const firstMap = mapStats?.[0];
  const isSingleMap = series.matches.length === 1;
  const team1Score = isSingleMap
    ? firstMap?.team1_score ?? firstMatch.team1_mapscore ?? firstMatch.team1_score ?? series.team1Wins
    : series.team1Wins;
  const team2Score = isSingleMap
    ? firstMap?.team2_score ?? firstMatch.team2_mapscore ?? firstMatch.team2_score ?? series.team2Wins
    : series.team2Wins;

  return (
    <Link href={href} className="soft-enter grid grid-cols-[42px_minmax(0,1fr)_58px_minmax(0,1fr)] items-center gap-1.5 border-b border-line bg-surface px-2 py-2 transition last:border-0 hover:bg-surface2 sm:grid-cols-[64px_minmax(0,1fr)_92px_minmax(0,1fr)_70px_96px] sm:gap-2 sm:px-4 sm:py-3 md:grid-cols-[74px_minmax(0,1fr)_120px_minmax(0,1fr)_88px_120px]">
      <div>
        <div className="font-rajdhani text-sm font-bold leading-none text-slate-200 sm:text-2xl">{formatTime(series.startTime)}</div>
        <div className="mt-0.5 truncate text-[7px] font-bold uppercase tracking-[0.1em] text-slate-600 sm:text-[10px] sm:tracking-[0.14em]">{formatDate(series.startTime)}</div>
      </div>
      <div className={`truncate text-right font-rajdhani text-sm font-bold sm:text-2xl ${winner === series.team1 ? "text-white" : "text-slate-400"}`}>{series.team1}</div>
      <div className="w-[58px] justify-self-center border border-line bg-bg px-1.5 py-1 text-center font-rajdhani text-sm font-bold text-accent sm:w-24 sm:px-2 sm:py-1.5 sm:text-2xl md:w-28">{team1Score}:{team2Score}</div>
      <div className={`truncate font-rajdhani text-sm font-bold sm:text-2xl ${winner === series.team2 ? "text-white" : "text-slate-400"}`}>{series.team2}</div>
      <div className="hidden text-center text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500 sm:block">{seriesLabel}</div>
      <div className="hidden items-center gap-2 justify-self-start text-xs font-bold uppercase tracking-[0.14em] sm:flex md:justify-self-end">
        <span className={`h-2 w-2 rounded-full ${series.status === "live" ? "live-pulse bg-red-400" : series.status === "cancelled" ? "bg-slate-600" : "bg-emerald-400"}`} />
        <span className={series.status === "live" ? "text-red-300" : "text-slate-500"}>{statusLabel}</span>
      </div>
    </Link>
  );
}

export default async function MatchesPage({ searchParams }: { searchParams: { tournament?: string } }) {
  const matches = await getOwnRecentMatches(120);
  const seasons = await getOwnSeasons();
  const series = groupMatchesIntoSeries(matches);
  const players = await getOwnPlayerSummaries(matches);
  const tournamentKeys = [...new Set(series.map(tournamentKey))];
  const selectedTournament = tournamentKeys.includes(searchParams.tournament || "")
    ? searchParams.tournament!
    : tournamentKeys[0] || "";
  const selectedSeason = seasons.find((season) => String(season.id) === selectedTournament);
  const selectedSeries = series.filter((item) => tournamentKey(item) === selectedTournament);
  const liveSeries = selectedSeries.filter((item) => item.status === "live");
  const finishedSeries = selectedSeries.filter((item) => item.status !== "live");
  const selectedSeriesMapStats = new Map(
    await Promise.all(selectedSeries.map(async (item) => [item.key, await getMatchMapStats(item.matches[0].id)] as const))
  );

  return (
    <div className="soft-enter py-3 sm:py-8">
      <section className="mb-3 sm:mb-8">
        <h1 className="font-rajdhani text-3xl font-bold leading-none sm:text-5xl md:text-6xl">Матчі та статистика</h1>
      </section>

      <section className="grid gap-3 sm:gap-4 lg:grid-cols-[1fr_340px]">
        <div className="grid gap-3 sm:gap-4">
          <div className="rounded-xl border border-line bg-surface p-2 sm:rounded-2xl sm:p-4">
            <div className="mb-2 flex items-center justify-between sm:mb-3">
              <div>
                <div className="text-[8px] font-extrabold uppercase tracking-[0.16em] text-red-300 sm:text-[10px] sm:tracking-[0.2em]">Live</div>
                <h2 className="font-rajdhani text-xl font-bold sm:text-2xl">Активні матчі</h2>
              </div>
              <div className="text-sm font-bold text-slate-500">{liveSeries.length}</div>
            </div>
            <div className="grid gap-3">
              {liveSeries.length ? liveSeries.map((item) => <SeriesRow key={item.key} series={item} mapStats={selectedSeriesMapStats.get(item.key)} />) : <div className="rounded-xl border border-line bg-surface2 p-4 text-sm text-slate-500">Зараз немає live-матчів.</div>}
            </div>
          </div>

          <div className="rounded-xl border border-line bg-surface p-2 sm:rounded-2xl sm:p-4">
            <div className="mb-2 flex flex-wrap items-end justify-between gap-2 sm:mb-3">
              <div>
                <div className="text-[8px] font-extrabold uppercase tracking-[0.16em] text-slate-500 sm:text-[10px] sm:tracking-[0.2em]">History</div>
                <h2 className="font-rajdhani text-xl font-bold sm:text-2xl">{tournamentName(selectedSeason, selectedTournament)}</h2>
              </div>
              <div className="text-sm font-bold text-slate-500">{finishedSeries.length} матчів</div>
            </div>
            <div className="overflow-hidden border border-line bg-surface">
              {finishedSeries.length ? finishedSeries.map((item) => <SeriesRow key={item.key} series={item} mapStats={selectedSeriesMapStats.get(item.key)} />) : <div className="p-4 text-sm text-slate-500">У цьому турнірі ще немає завершених матчів.</div>}
            </div>
          </div>
        </div>

        <aside className="grid gap-4">
          <div className="rounded-2xl border border-line bg-surface p-4">
            <div className="mb-3">
              <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">Tournaments</div>
              <h2 className="font-rajdhani text-2xl font-bold">Обери турнір</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {tournamentKeys.map((key) => {
                const season = seasons.find((item) => String(item.id) === key);
                const active = key === selectedTournament;
                return (
                  <Link
                    key={key}
                    href={`/matches?tournament=${encodeURIComponent(key)}`}
                    className={`rounded-xl border px-3 py-2 text-sm font-bold transition ${active ? "border-accent bg-accent text-bg" : "border-line bg-surface2 text-slate-300 hover:border-accent/50 hover:text-white"}`}
                  >
                    {tournamentName(season, key)}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-4">
            <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">Player Stats 2.0</div>
            <h2 className="font-rajdhani text-2xl font-bold">Топ за Rating</h2>
            <div className="mt-4 grid gap-2">
              {players.map((player, index) => (
                <Link href={`/players/${encodeURIComponent(player.name)}`} key={player.steamId} className="interactive-card grid grid-cols-[28px_1fr_auto] items-center gap-3 rounded-xl border border-line bg-surface2 p-3 transition hover:border-accent/45">
                  <div className={`font-rajdhani text-xl font-bold ${index === 0 ? "text-gold" : index === 1 ? "text-slate-300" : index === 2 ? "text-amber-700" : "text-slate-500"}`}>{index + 1}</div>
                  <div>
                    <div className="font-bold">{player.name}</div>
                    <div className="text-xs text-slate-600">K/D {player.kills}/{player.deaths}</div>
                  </div>
                  <div className="text-right font-rajdhani text-xl font-bold text-accent">{Number(player.rating || 0).toFixed(2)}</div>
                </Link>
              ))}
              {!players.length ? <div className="rounded-xl border border-line bg-surface2 p-3 text-sm text-slate-500">Ще немає статистики гравців у твоїх останніх матчах.</div> : null}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
