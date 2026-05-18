const LOT_API_BASE = process.env.LOTGAMING_API_BASE || "https://matches.lotgaming.xyz/api";
const LOT_OWNER = (process.env.LOTGAMING_OWNER || "GooDy").trim().toLowerCase();
const LOT_USER_ID = Number(process.env.LOTGAMING_USER_ID || 140);
const SERIES_WINDOW_HOURS = Number(process.env.LOTGAMING_SERIES_WINDOW_HOURS || 6);

export type LotMatch = {
  id: number;
  user_id: number;
  team1_id: number;
  team2_id: number;
  winner: number | null;
  team1_score: number | null;
  team2_score: number | null;
  team1_series_score: number | null;
  team2_series_score: number | null;
  team1_string: string;
  team2_string: string;
  cancelled: number;
  forfeit: number;
  start_time: string | null;
  end_time: string | null;
  max_maps: number;
  season_id: number | null;
  is_pug: number;
  owner?: string;
  team1_mapscore?: number | null;
  team2_mapscore?: number | null;
};

export type LotSeason = {
  id: number;
  user_id: number;
  name: string;
  start_date: string | null;
  end_date: string | null;
};

export type LotMapStat = {
  id: number;
  match_id: number;
  winner: number | null;
  map_number: number;
  map_name: string | null;
  team1_score: number | null;
  team2_score: number | null;
  start_time: string | null;
  end_time: string | null;
  demoFile: string | null;
};

export type LotPlayerStat = {
  id: number;
  match_id: number;
  map_id: number;
  team_id: number;
  steam_id: string;
  name: string;
  kills: number;
  deaths: number;
  assists: number;
  flashbang_assists?: number;
  headshot_kills: number;
  damage: number;
  util_damage: number;
  roundsplayed: number;
  kast?: number;
  firstdeath_ct?: number;
  firstdeath_t?: number;
  firstkill_ct?: number;
  firstkill_t?: number;
  k1?: number;
  k2?: number;
  k3?: number;
  k4?: number;
  k5?: number;
  v1?: number;
  v2?: number;
  v3?: number;
  v4?: number;
  v5?: number;
  mvp: number;
  contribution_score: number;
  team_name: string | null;
};

export type LotPlayerLeaderboard = {
  steamId: string;
  name: string;
  kills: number;
  deaths: number;
  assists: number;
  hsk: number;
  hsp: number;
  average_rating: number;
  wins: number;
  total_maps: number;
  total_damage: number;
};

export type OwnPlayerSummary = {
  steamId: string;
  name: string;
  kills: number;
  deaths: number;
  assists: number;
  maps: number;
  damage: number;
  rating: number;
};

export type LotMatchSeries = {
  key: string;
  team1: string;
  team2: string;
  team1Id: number;
  team2Id: number;
  seasonId: number | null;
  dateKey: string;
  startTime: string | null;
  endTime: string | null;
  matches: LotMatch[];
  team1Wins: number;
  team2Wins: number;
  status: "live" | "finished" | "cancelled";
};

async function lotFetch<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${LOT_API_BASE}${path}`, {
      next: { revalidate: 30 },
      headers: { accept: "application/json" }
    });

    if (!response.ok) return null;
    return await response.json() as T;
  } catch {
    return null;
  }
}

export async function getRecentMatches(limit = 30) {
  const data = await lotFetch<{ matches: LotMatch[] }>(`/matches/limit/${limit}`);
  return data?.matches || [];
}

export function isOwnLotMatch(match: LotMatch) {
  const byUserId = Number.isFinite(LOT_USER_ID) && match.user_id === LOT_USER_ID;
  const byOwner = Boolean(LOT_OWNER) && match.owner?.trim().toLowerCase() === LOT_OWNER;
  return byUserId || byOwner;
}

export async function getOwnRecentMatches(limit = 80) {
  const matches = await getRecentMatches(limit);
  return matches.filter(isOwnLotMatch);
}

export async function getOwnSeasons() {
  const data = await lotFetch<{ seasons: LotSeason[] }>("/seasons");
  return (data?.seasons || [])
    .filter((season) => season.user_id === LOT_USER_ID)
    .sort((a, b) => new Date(b.start_date || 0).getTime() - new Date(a.start_date || 0).getTime());
}

function dayKey(value: string | null) {
  return value ? value.slice(0, 10) : "live";
}

function pairKey(match: LotMatch) {
  return [match.team1_id, match.team2_id].sort((a, b) => a - b).join("-");
}

function seriesSeed(match: LotMatch) {
  return `${match.season_id || "no-season"}-${dayKey(match.start_time)}-${pairKey(match)}`;
}

function hoursBetween(a: string | null, b: string | null) {
  if (!a || !b) return 0;
  return Math.abs(new Date(a).getTime() - new Date(b).getTime()) / 36e5;
}

export function groupMatchesIntoSeries(matches: LotMatch[]): LotMatchSeries[] {
  const sorted = [...matches].sort((a, b) => new Date(a.start_time || 0).getTime() - new Date(b.start_time || 0).getTime());
  const series: LotMatchSeries[] = [];

  for (const match of sorted) {
    const seed = seriesSeed(match);
    const current = series.find((item) => {
      const latest = item.matches[item.matches.length - 1];
      return item.key.startsWith(seed) && hoursBetween(latest.start_time, match.start_time) <= SERIES_WINDOW_HOURS;
    });

    if (current) {
      current.matches.push(match);
      current.startTime = current.matches[0]?.start_time || current.startTime;
      current.endTime = current.matches.every((item) => item.end_time) ? current.matches[current.matches.length - 1]?.end_time || null : null;
    } else {
      series.push({
        key: `${seed}-${series.filter((item) => item.key.startsWith(seed)).length + 1}`,
        team1: match.team1_string,
        team2: match.team2_string,
        team1Id: match.team1_id,
        team2Id: match.team2_id,
        seasonId: match.season_id,
        dateKey: dayKey(match.start_time),
        startTime: match.start_time,
        endTime: match.end_time,
        matches: [match],
        team1Wins: 0,
        team2Wins: 0,
        status: "finished"
      });
    }
  }

  return series.map((item) => {
    const team1Wins = item.matches.filter((match) => matchWinnerName(match) === item.team1).length;
    const team2Wins = item.matches.filter((match) => matchWinnerName(match) === item.team2).length;
    const hasLive = item.matches.some((match) => matchStatus(match) === "live");
    const allCancelled = item.matches.every((match) => matchStatus(match) === "cancelled");
    const status: LotMatchSeries["status"] = hasLive ? "live" : allCancelled ? "cancelled" : "finished";

    return {
      ...item,
      matches: [...item.matches].sort((a, b) => new Date(a.start_time || 0).getTime() - new Date(b.start_time || 0).getTime()),
      team1Wins,
      team2Wins,
      status
    };
  }).sort((a, b) => new Date(b.startTime || 0).getTime() - new Date(a.startTime || 0).getTime());
}

export async function getMatch(matchId: string | number) {
  const data = await lotFetch<{ match: LotMatch }>(`/matches/${matchId}`);
  return data?.match || null;
}

export async function getMatchMapStats(matchId: string | number) {
  const data = await lotFetch<{ mapstats: LotMapStat[] }>(`/mapstats/${matchId}`);
  return data?.mapstats || [];
}

export async function getMatchPlayerStats(matchId: string | number) {
  const data = await lotFetch<{ playerstats: LotPlayerStat[] }>(`/playerstats/match/${matchId}`);
  return data?.playerstats || [];
}

export async function getPlayerLeaderboard() {
  const data = await lotFetch<{ leaderboard: LotPlayerLeaderboard[] }>("/leaderboard/players");
  return data?.leaderboard || [];
}

export async function getOwnPlayerSummaries(matches: LotMatch[], limit = 8) {
  const targetMatches = matches.filter((match) => !match.cancelled).slice(0, 20);
  const allStats = (await Promise.all(targetMatches.map((match) => getMatchPlayerStats(match.id)))).flat();
  const summaries = new Map<string, OwnPlayerSummary>();

  for (const stat of allStats) {
    const current = summaries.get(stat.steam_id) || {
      steamId: stat.steam_id,
      name: stat.name,
      kills: 0,
      deaths: 0,
      assists: 0,
      maps: 0,
      damage: 0,
      rating: 0
    };

    current.kills += stat.kills || 0;
    current.deaths += stat.deaths || 0;
    current.assists += stat.assists || 0;
    current.damage += stat.damage || 0;
    current.maps += 1;
    current.rating = current.deaths > 0 ? current.kills / current.deaths : current.kills;
    summaries.set(stat.steam_id, current);
  }

  return [...summaries.values()]
    .sort((a, b) => b.rating - a.rating || b.kills - a.kills)
    .slice(0, limit);
}

export function matchStatus(match: LotMatch) {
  if (match.cancelled) return "cancelled";
  if (!match.end_time) return "live";
  return "finished";
}

export function matchWinnerName(match: LotMatch) {
  if (match.winner === match.team1_id) return match.team1_string;
  if (match.winner === match.team2_id) return match.team2_string;
  return null;
}
