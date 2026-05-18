import Link from "next/link";
import {
  getOwnPlayerSummaries,
  getOwnRecentMatches,
  getOwnSeasons,
  groupMatchesIntoSeries,
  type LotSeason,
  type LotMatchSeries
} from "@/lib/lotgaming";

export const dynamic = "force-dynamic";

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

function SeriesRow({ series }: { series: LotMatchSeries }) {
  const href = series.matches.length > 1 ? `/matches/series/${series.key}` : `/matches/${series.matches[0].id}`;
  const statusLabel = series.status === "live" ? "Live" : series.status === "cancelled" ? "Cancelled" : "Finished";
  const seriesLabel = series.matches.length > 1 ? `BO${series.matches.length}` : "BO1";
  const winner = series.team1Wins === series.team2Wins ? null : series.team1Wins > series.team2Wins ? series.team1 : series.team2;

  return (
    <Link href={href} className="grid gap-3 border-b border-line bg-surface px-4 py-3 transition last:border-0 hover:bg-surface2 md:grid-cols-[74px_1fr_86px_1fr_88px_88px] md:items-center">
      <div>
        <div className="font-rajdhani text-2xl font-bold text-slate-200">{formatTime(series.startTime)}</div>
        <div className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">{formatDate(series.startTime)}</div>
      </div>
      <div className={`font-rajdhani text-2xl font-bold ${winner === series.team1 ? "text-white" : "text-slate-400"}`}>{series.team1}</div>
      <div className="border border-line bg-bg px-3 py-2 text-center font-rajdhani text-2xl font-bold text-accent">{series.team1Wins}:{series.team2Wins}</div>
      <div className={`font-rajdhani text-2xl font-bold md:text-right ${winner === series.team2 ? "text-white" : "text-slate-400"}`}>{series.team2}</div>
      <div className="text-center text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500">{seriesLabel}</div>
      <div className="flex items-center gap-2 justify-self-start text-xs font-bold uppercase tracking-[0.14em] md:justify-self-end">
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

  return (
    <div className="py-8">
      <section className="mb-8">
        <div className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-accent">LOT Gaming API</div>
        <h1 className="mt-2 font-rajdhani text-5xl font-bold leading-none md:text-6xl">Матчі та статистика</h1>
        <p className="mt-3 max-w-3xl text-slate-400">
          Live-матчі, історія і K/D/A гравців тільки з матчів, створених твоїм LOT Gaming акаунтом. Дані оновлюються автоматично з публічного API.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="grid gap-4">
          <div className="rounded-2xl border border-line bg-surface p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-red-300">Live</div>
                <h2 className="font-rajdhani text-2xl font-bold">Активні матчі</h2>
              </div>
              <div className="text-sm font-bold text-slate-500">{liveSeries.length}</div>
            </div>
            <div className="grid gap-3">
              {liveSeries.length ? liveSeries.map((item) => <SeriesRow key={item.key} series={item} />) : <div className="rounded-xl border border-line bg-surface2 p-4 text-sm text-slate-500">Зараз немає live-матчів.</div>}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-4">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">History</div>
                <h2 className="font-rajdhani text-2xl font-bold">{tournamentName(selectedSeason, selectedTournament)}</h2>
              </div>
              <div className="text-sm font-bold text-slate-500">{finishedSeries.length} матчів</div>
            </div>
            <div className="overflow-hidden border border-line bg-surface">
              {finishedSeries.length ? finishedSeries.map((item) => <SeriesRow key={item.key} series={item} />) : <div className="p-4 text-sm text-slate-500">У цьому турнірі ще немає завершених матчів.</div>}
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
            <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">Player Stats</div>
            <h2 className="font-rajdhani text-2xl font-bold">Топ за Rating</h2>
            <div className="mt-4 grid gap-2">
              {players.map((player, index) => (
                <div key={player.steamId} className="grid grid-cols-[28px_1fr_auto] items-center gap-3 rounded-xl border border-line bg-surface2 p-3">
                  <div className={`font-rajdhani text-xl font-bold ${index === 0 ? "text-gold" : index === 1 ? "text-slate-300" : index === 2 ? "text-amber-700" : "text-slate-500"}`}>{index + 1}</div>
                  <div>
                    <div className="font-bold">{player.name}</div>
                    <div className="text-xs text-slate-600">K/D {player.kills}/{player.deaths}</div>
                  </div>
                  <div className="text-right font-rajdhani text-xl font-bold text-accent">{Number(player.rating || 0).toFixed(2)}</div>
                </div>
              ))}
              {!players.length ? <div className="rounded-xl border border-line bg-surface2 p-3 text-sm text-slate-500">Ще немає статистики гравців у твоїх останніх матчах.</div> : null}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
