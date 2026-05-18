import { existsSync, readdirSync, readFileSync } from "fs";
import path from "path";
import { schoolRosters } from "@/lib/school-rosters";

export type PlayerComputedStats = {
  nick: string;
  teamNames: string[];
  maps: number;
  kills: number;
  deaths: number;
  assists: number;
  damage: number;
  headshots: number;
  firstKills: number;
  firstDeaths: number;
  flashAssists: number;
  rounds: number;
  sniperKills: number;
  multiKillRounds: number;
  kastRounds: number;
  tradeKills: number;
  tradedDeaths: number;
  rating: number;
  tRating: number;
  ctRating: number;
  kd: number;
  kpr: number;
  dpr: number;
  adr: number;
  hsPercent: number;
  kast: number;
  roundSwing: number;
  firepower: number;
  entrying: number;
  trading: number;
  opening: number;
  clutching: number;
  sniping: number;
  multiKill: number;
  utility: number;
  sides: Record<"T" | "CT", PlayerSideComputedStats>;
  matchIds: number[];
};

export type PlayerSideComputedStats = {
  rounds: number;
  kills: number;
  deaths: number;
  assists: number;
  damage: number;
  firstKills: number;
  firstDeaths: number;
  rating: number;
  kpr: number;
  dpr: number;
  adr: number;
};

type RawDemoPlayer = {
  name: string;
  teamName: string;
  sides: Record<string, {
    kills?: number;
    deaths?: number;
    assists?: number;
    damage?: number;
    firstKills?: number;
    firstDeaths?: number;
    flashAssists?: number;
    headshots?: number;
  }>;
};

type RawDemoKill = {
  tick?: number;
  attacker?: string | null;
  attackerTeam?: string | null;
  victim?: string | null;
  victimTeam?: string | null;
  assister?: string | null;
  assisterTeam?: string | null;
  weapon?: string | null;
};

type RawDemoRound = {
  kills?: RawDemoKill[];
};

type RawDemoTeamSide = {
  teamName: string;
  side: "T" | "CT";
  roundsPlayed?: number;
};

type RawDemo = {
  matchId: number;
  rounds?: RawDemoRound[];
  teamSideStats?: RawDemoTeamSide[];
  players?: RawDemoPlayer[];
};

const SNIPER_WEAPONS = new Set(["awp", "ssg08", "scout", "scar20", "g3sg1"]);
const TRADE_TICK_WINDOW = 640;

function emptySideStats(): PlayerSideComputedStats {
  return {
    rounds: 0,
    kills: 0,
    deaths: 0,
    assists: 0,
    damage: 0,
    firstKills: 0,
    firstDeaths: 0,
    rating: 0,
    kpr: 0,
    dpr: 0,
    adr: 0,
  };
}

function emptyStats(nick: string): PlayerComputedStats {
  return {
    nick,
    teamNames: [],
    maps: 0,
    kills: 0,
    deaths: 0,
    assists: 0,
    damage: 0,
    headshots: 0,
    firstKills: 0,
    firstDeaths: 0,
    flashAssists: 0,
    rounds: 0,
    sniperKills: 0,
    multiKillRounds: 0,
    kastRounds: 0,
    tradeKills: 0,
    tradedDeaths: 0,
    rating: 0,
    tRating: 0,
    ctRating: 0,
    kd: 0,
    kpr: 0,
    dpr: 0,
    adr: 0,
    hsPercent: 0,
    kast: 0,
    roundSwing: 0,
    firepower: 0,
    entrying: 0,
    trading: 0,
    opening: 0,
    clutching: 0,
    sniping: 0,
    multiKill: 0,
    utility: 0,
    sides: {
      T: emptySideStats(),
      CT: emptySideStats(),
    },
    matchIds: []
  };
}

function score(value: number, target: number) {
  if (!Number.isFinite(value) || target <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((value / target) * 100)));
}

function finalize(stats: PlayerComputedStats) {
  const rounds = Math.max(1, stats.rounds || stats.maps * 20);
  stats.kd = stats.deaths > 0 ? stats.kills / stats.deaths : stats.kills;
  stats.kpr = stats.kills / rounds;
  stats.dpr = stats.deaths / rounds;
  stats.adr = stats.damage / rounds;
  stats.hsPercent = stats.kills > 0 ? (stats.headshots / stats.kills) * 100 : 0;
  stats.kast = (stats.kastRounds / rounds) * 100;

  const killPart = stats.kpr / 0.7;
  const damagePart = stats.adr / 85;
  const survivalPart = ((rounds - stats.deaths) / rounds) / 0.7;
  stats.rating = (killPart * 0.45) + (damagePart * 0.35) + (Math.max(0, survivalPart) * 0.2);
  stats.tRating = finalizeSide(stats.sides.T);
  stats.ctRating = finalizeSide(stats.sides.CT);
  stats.roundSwing = (
    (stats.firstKills * 1.1) +
    (stats.tradeKills * 0.55) +
    (stats.multiKillRounds * 0.75) +
    (stats.kastRounds * 0.08) -
    (stats.firstDeaths * 0.95) -
    (stats.tradedDeaths * 0.25) -
    (stats.deaths * 0.08)
  ) / rounds * 10;

  stats.firepower = score(stats.kpr, 0.9);
  stats.entrying = score(stats.firstKills / Math.max(1, stats.firstKills + stats.firstDeaths), 0.65);
  stats.trading = score(((stats.assists * 0.55) + stats.tradeKills + (stats.tradedDeaths * 0.35)) / rounds, 0.35);
  stats.opening = score(stats.firstKills / rounds, 0.16);
  stats.clutching = score(stats.kd, 1.5);
  stats.sniping = score((stats.sniperKills / rounds) + ((stats.sniperKills / Math.max(1, stats.kills)) * 0.35), 0.32);
  stats.multiKill = score(stats.multiKillRounds / Math.max(1, stats.maps), 1.8);
  stats.utility = score(stats.flashAssists / rounds, 0.08);
  stats.teamNames = [...new Set(stats.teamNames)].filter(Boolean);
  stats.matchIds = [...new Set(stats.matchIds)].sort((a, b) => b - a);

  return stats;
}

function finalizeSide(side: PlayerSideComputedStats) {
  const rounds = Math.max(1, side.rounds);
  side.kpr = side.kills / rounds;
  side.dpr = side.deaths / rounds;
  side.adr = side.damage / rounds;
  const killPart = side.kpr / 0.7;
  const damagePart = side.adr / 85;
  const survivalPart = ((rounds - side.deaths) / rounds) / 0.7;
  side.rating = (killPart * 0.45) + (damagePart * 0.35) + (Math.max(0, survivalPart) * 0.2);
  return side.rating;
}

export function getAllPlayerStats() {
  const dir = path.join(process.cwd(), "public", "demo-data", "matches");
  const players = new Map<string, PlayerComputedStats>();

  if (!existsSync(dir)) return [];

  for (const file of readdirSync(dir)) {
    if (!file.endsWith(".json")) continue;
    const demo = JSON.parse(readFileSync(path.join(dir, file), "utf8")) as RawDemo;
    const teamSideRounds = new Map<string, number>();
    for (const item of demo.teamSideStats || []) {
      teamSideRounds.set(`${item.teamName}:${item.side}`, item.roundsPlayed || 0);
    }

    for (const player of demo.players || []) {
      const current = players.get(player.name) || emptyStats(player.name);
      current.maps += 1;
      current.rounds += demo.rounds?.length || 20;
      current.teamNames.push(player.teamName);
      current.matchIds.push(demo.matchId);

      for (const side of Object.values(player.sides || {})) {
        current.kills += side.kills || 0;
        current.deaths += side.deaths || 0;
        current.assists += side.assists || 0;
        current.damage += side.damage || 0;
        current.headshots += side.headshots || 0;
        current.firstKills += side.firstKills || 0;
        current.firstDeaths += side.firstDeaths || 0;
        current.flashAssists += side.flashAssists || 0;
      }

      for (const sideName of ["T", "CT"] as const) {
        const source = player.sides?.[sideName];
        if (!source) continue;
        const side = current.sides[sideName];
        side.rounds += teamSideRounds.get(`${player.teamName}:${sideName}`) || 0;
        side.kills += source.kills || 0;
        side.deaths += source.deaths || 0;
        side.assists += source.assists || 0;
        side.damage += source.damage || 0;
        side.firstKills += source.firstKills || 0;
        side.firstDeaths += source.firstDeaths || 0;
      }

      players.set(player.name, current);
    }

    const roundKillCounts = new Map<string, number>();
    const matchPlayers = demo.players || [];
    for (const round of demo.rounds || []) {
      roundKillCounts.clear();
      const killed = new Set<string>();
      const impact = new Set<string>();
      const kills = round.kills || [];

      for (const kill of kills) {
        if (kill.victim) killed.add(kill.victim);
        if (kill.attacker) impact.add(kill.attacker);
        if (kill.assister) impact.add(kill.assister);
      }

      for (const kill of kills) {
        if (!kill.victim || !kill.attacker || !kill.tick) continue;
        const deathTick = kill.tick;
        const traded = kills.find((candidate) => (
          candidate.attacker &&
          candidate.victim === kill.attacker &&
          candidate.attackerTeam === kill.victimTeam &&
          candidate.tick &&
          candidate.tick > deathTick &&
          candidate.tick - deathTick <= TRADE_TICK_WINDOW
        ));

        if (!traded?.attacker) continue;
        impact.add(kill.victim);

        const trader = players.get(traded.attacker) || emptyStats(traded.attacker);
        trader.tradeKills += 1;
        players.set(traded.attacker, trader);

        const tradedPlayer = players.get(kill.victim) || emptyStats(kill.victim);
        tradedPlayer.tradedDeaths += 1;
        players.set(kill.victim, tradedPlayer);
      }

      for (const player of matchPlayers) {
        if (!player.name) continue;
        if (!killed.has(player.name)) impact.add(player.name);
      }

      for (const nick of impact) {
        const current = players.get(nick) || emptyStats(nick);
        current.kastRounds += 1;
        players.set(nick, current);
      }

      for (const kill of round.kills || []) {
        if (!kill.attacker) continue;
        const current = players.get(kill.attacker) || emptyStats(kill.attacker);
        if (kill.attackerTeam) current.teamNames.push(kill.attackerTeam);
        current.matchIds.push(demo.matchId);

        const weapon = (kill.weapon || "").toLowerCase();
        if (SNIPER_WEAPONS.has(weapon)) {
          current.sniperKills += 1;
        }

        roundKillCounts.set(kill.attacker, (roundKillCounts.get(kill.attacker) || 0) + 1);
        players.set(kill.attacker, current);
      }

      for (const [nick, kills] of roundKillCounts) {
        if (kills < 2) continue;
        const current = players.get(nick);
        if (current) current.multiKillRounds += 1;
      }
    }
  }

  return [...players.values()].map(finalize).sort((a, b) => b.rating - a.rating || b.kills - a.kills);
}

export function getPlayerStatsByNick(nick: string) {
  return getAllPlayerStats().find((player) => player.nick.toLowerCase() === nick.toLowerCase()) || null;
}

export function getManualTeamForNick(nick: string) {
  return schoolRosters.find((team) => team.players.some((player) => player.toLowerCase() === nick.toLowerCase())) || null;
}
