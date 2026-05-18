#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { parseEvent, parseHeader } = require("@laihoe/demoparser2");

const LOT_API_BASE = process.env.LOTGAMING_API_BASE || "https://matches.lotgaming.xyz/api";

function argValue(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : null;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

async function download(url, outputPath) {
  if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) return;

  const response = await fetch(url);
  if (!response.ok || !response.body) {
    throw new Error(`Could not download demo: ${response.status} ${response.statusText}`);
  }

  ensureDir(path.dirname(outputPath));
  const file = fs.createWriteStream(outputPath);
  await new Promise((resolve, reject) => {
    response.body.pipeTo(new WritableStream({
      write(chunk) {
        file.write(Buffer.from(chunk));
      },
      close() {
        file.end(resolve);
      },
      abort(error) {
        file.destroy(error);
        reject(error);
      }
    })).catch(reject);
  });
}

async function lotFetch(pathname) {
  const response = await fetch(`${LOT_API_BASE}${pathname}`, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error(`LOT API failed ${pathname}: ${response.status}`);
  return response.json();
}

function sideName(value) {
  if (value === "CT") return "CT";
  if (value === "TERRORIST" || value === "T") return "T";
  return value || "unknown";
}

function sideKey(value) {
  return sideName(value).toLowerCase();
}

function roundFromEvent(event) {
  return Number(event.total_rounds_played || 0) + 1;
}

function roundFromRoundEnd(event) {
  return Number(event.total_rounds_played || 0);
}

function emptyStats() {
  return {
    kills: 0,
    deaths: 0,
    assists: 0,
    damage: 0,
    firstKills: 0,
    firstDeaths: 0,
    flashAssists: 0,
    headshots: 0
  };
}

function playerKey(event, prefix) {
  return event[`${prefix}_steamid`] || event[`${prefix}_player_steamid`] || null;
}

function playerName(event, prefix) {
  return event[`${prefix}_name`] || event[`${prefix}_player_name`] || null;
}

function addPlayer(players, steamId, name, teamName) {
  if (!steamId) return null;
  if (!players.has(steamId)) {
    players.set(steamId, {
      steamId,
      name: name || steamId,
      teamName: teamName || "Unknown",
      sides: {
        T: emptyStats(),
        CT: emptyStats()
      }
    });
  }
  const player = players.get(steamId);
  if (name && player.name === steamId) player.name = name;
  if (teamName && player.teamName === "Unknown") player.teamName = teamName;
  return player;
}

function getSideStats(player, side) {
  const key = sideName(side);
  if (!player.sides[key]) player.sides[key] = emptyStats();
  return player.sides[key];
}

function teamSideStatsKey(teamName, side) {
  return `${teamName}::${sideName(side)}`;
}

function addTeamSideStats(map, teamName, side) {
  if (!teamName || teamName === "Unknown" || sideName(side) === "unknown") return null;
  const key = teamSideStatsKey(teamName, side);
  if (!map.has(key)) {
    map.set(key, {
      teamName,
      side: sideName(side),
      roundsPlayed: 0,
      roundsWon: 0,
      kills: 0,
      deaths: 0,
      assists: 0,
      damage: 0,
      firstKills: 0,
      firstDeaths: 0,
      flashAssists: 0
    });
  }
  return map.get(key);
}

async function main() {
  const matchId = argValue("match");
  const demoUrl = argValue("url");
  const inputPath = argValue("file");

  if (!matchId) throw new Error("Usage: node scripts/parse-demo.cjs --match 2724 --url https://...dem");
  if (!demoUrl && !inputPath) throw new Error("Pass --url or --file");

  const demoPath = inputPath || path.join(".cache", "demos", `${matchId}.dem`);
  if (demoUrl) await download(demoUrl, demoPath);

  const [{ match }, { playerstats }] = await Promise.all([
    lotFetch(`/matches/${matchId}`),
    lotFetch(`/playerstats/match/${matchId}`)
  ]);

  const teamById = new Map([
    [match.team1_id, match.team1_string],
    [match.team2_id, match.team2_string]
  ]);
  const playerTeamBySteam = new Map();
  const playerTeamByName = new Map();

  for (const stat of playerstats || []) {
    const teamName = teamById.get(stat.team_id) || stat.team_name || "Unknown";
    playerTeamBySteam.set(String(stat.steam_id), teamName);
    playerTeamByName.set(stat.name, teamName);
  }

  const header = parseHeader(demoPath);
  const deaths = parseEvent(demoPath, "player_death", ["player_name", "player_steamid", "team_name", "team_num", "X", "Y"], ["total_rounds_played"]);
  const hurts = parseEvent(demoPath, "player_hurt", ["player_name", "player_steamid", "team_name", "team_num"], ["total_rounds_played"]);
  const roundEnds = parseEvent(demoPath, "round_end", [], ["total_rounds_played"]);
  const plants = parseEvent(demoPath, "bomb_planted", ["player_name", "player_steamid", "team_name", "team_num"], ["total_rounds_played"]);
  const defuses = parseEvent(demoPath, "bomb_defused", ["player_name", "player_steamid", "team_name", "team_num"], ["total_rounds_played"]);
  const explosions = parseEvent(demoPath, "bomb_exploded", ["player_name", "player_steamid", "team_name", "team_num"], ["total_rounds_played"]);

  const players = new Map();
  const teamSides = new Map();
  const roundSideTeams = new Map();
  const killsByRound = new Map();
  const damageByRound = new Map();

  function resolveTeam(steamId, name) {
    return playerTeamBySteam.get(String(steamId)) || playerTeamByName.get(name) || "Unknown";
  }

  function registerRoundSide(roundNumber, side, teamName) {
    if (!roundNumber || !teamName || teamName === "Unknown") return;
    if (!roundSideTeams.has(roundNumber)) roundSideTeams.set(roundNumber, {});
    roundSideTeams.get(roundNumber)[sideName(side)] = teamName;
  }

  for (const event of hurts) {
    const roundNumber = roundFromEvent(event);
    const attackerSteam = playerKey(event, "attacker");
    const userSteam = playerKey(event, "user");
    const attackerTeam = resolveTeam(attackerSteam, playerName(event, "attacker"));
    const userTeam = resolveTeam(userSteam, playerName(event, "user"));
    registerRoundSide(roundNumber, event.attacker_team_name, attackerTeam);
    registerRoundSide(roundNumber, event.user_team_name, userTeam);

    if (attackerSteam && attackerSteam !== userSteam && attackerTeam !== userTeam) {
      const attacker = addPlayer(players, attackerSteam, playerName(event, "attacker"), attackerTeam);
      const sideStats = getSideStats(attacker, event.attacker_team_name);
      sideStats.damage += Number(event.dmg_health || 0);
      const teamStats = addTeamSideStats(teamSides, attackerTeam, event.attacker_team_name);
      if (teamStats) teamStats.damage += Number(event.dmg_health || 0);
      if (!damageByRound.has(roundNumber)) damageByRound.set(roundNumber, []);
      damageByRound.get(roundNumber).push({
        tick: event.tick,
        attacker: playerName(event, "attacker"),
        victim: playerName(event, "user"),
        damage: Number(event.dmg_health || 0),
        weapon: event.weapon
      });
    }
  }

  for (const event of deaths) {
    const roundNumber = roundFromEvent(event);
    const attackerSteam = playerKey(event, "attacker");
    const userSteam = playerKey(event, "user");
    const assisterSteam = playerKey(event, "assister");
    const attackerTeam = resolveTeam(attackerSteam, playerName(event, "attacker"));
    const userTeam = resolveTeam(userSteam, playerName(event, "user"));
    const assisterTeam = resolveTeam(assisterSteam, playerName(event, "assister"));
    const attackerSide = sideName(event.attacker_team_name);
    const userSide = sideName(event.user_team_name);

    registerRoundSide(roundNumber, event.attacker_team_name, attackerTeam);
    registerRoundSide(roundNumber, event.user_team_name, userTeam);
    registerRoundSide(roundNumber, event.assister_team_name, assisterTeam);

    if (!killsByRound.has(roundNumber)) killsByRound.set(roundNumber, []);
    const kill = {
      tick: event.tick,
      roundNumber,
      attacker: playerName(event, "attacker"),
      attackerSteamId: attackerSteam,
      attackerTeam,
      attackerSide,
      victim: playerName(event, "user"),
      victimSteamId: userSteam,
      victimTeam: userTeam,
      victimSide: userSide,
      assister: playerName(event, "assister"),
      assisterTeam,
      assistedFlash: Boolean(event.assistedflash),
      weapon: event.weapon,
      headshot: Boolean(event.headshot)
    };
    killsByRound.get(roundNumber).push(kill);

    if (attackerSteam && attackerSteam !== userSteam && attackerTeam !== userTeam) {
      const attacker = addPlayer(players, attackerSteam, playerName(event, "attacker"), attackerTeam);
      const attackerStats = getSideStats(attacker, attackerSide);
      attackerStats.kills += 1;
      if (event.headshot) attackerStats.headshots += 1;
      const teamStats = addTeamSideStats(teamSides, attackerTeam, attackerSide);
      if (teamStats) teamStats.kills += 1;
    }

    if (userSteam) {
      const victim = addPlayer(players, userSteam, playerName(event, "user"), userTeam);
      getSideStats(victim, userSide).deaths += 1;
      const teamStats = addTeamSideStats(teamSides, userTeam, userSide);
      if (teamStats) teamStats.deaths += 1;
    }

    if (assisterSteam && assisterSteam !== attackerSteam && assisterTeam === attackerTeam) {
      const assister = addPlayer(players, assisterSteam, playerName(event, "assister"), assisterTeam);
      const assisterStats = getSideStats(assister, event.assister_team_name);
      assisterStats.assists += 1;
      if (event.assistedflash) assisterStats.flashAssists += 1;
      const teamStats = addTeamSideStats(teamSides, assisterTeam, event.assister_team_name);
      if (teamStats) {
        teamStats.assists += 1;
        if (event.assistedflash) teamStats.flashAssists += 1;
      }
    }
  }

  const bombByRound = new Map();
  for (const event of [...plants, ...defuses, ...explosions]) {
    const roundNumber = roundFromEvent(event);
    if (!bombByRound.has(roundNumber)) bombByRound.set(roundNumber, []);
    bombByRound.get(roundNumber).push({
      type: event.event_name.replace("bomb_", ""),
      tick: event.tick,
      player: playerName(event, "user"),
      teamName: resolveTeam(playerKey(event, "user"), playerName(event, "user")),
      side: sideName(event.user_team_name),
      site: event.site
    });
  }

  const filteredRoundEnds = roundEnds.filter((event) => event.winner);
  const rounds = filteredRoundEnds.map((event) => {
    const roundNumber = roundFromRoundEnd(event);
    const roundKills = (killsByRound.get(roundNumber) || []).sort((a, b) => a.tick - b.tick);
    const firstKill = roundKills.find((kill) => kill.attackerSteamId && kill.attackerTeam !== "Unknown" && kill.attackerTeam !== kill.victimTeam) || null;
    const sideWinner = sideName(event.winner);
    const sides = roundSideTeams.get(roundNumber) || {};
    const winnerTeam = sides[sideWinner] || "Unknown";

    return {
      roundNumber,
      winnerSide: sideWinner,
      winnerTeam,
      reason: event.reason,
      firstKill,
      kills: roundKills,
      bombEvents: (bombByRound.get(roundNumber) || []).sort((a, b) => a.tick - b.tick)
    };
  });

  for (const round of rounds) {
    const sides = roundSideTeams.get(round.roundNumber) || {};
    for (const side of ["T", "CT"]) {
      const teamName = sides[side];
      if (!teamName) continue;
      const stats = addTeamSideStats(teamSides, teamName, side);
      if (stats) {
        stats.roundsPlayed += 1;
        if (round.winnerTeam === teamName) stats.roundsWon += 1;
      }
    }

    if (round.firstKill) {
      const killer = players.get(round.firstKill.attackerSteamId);
      const victim = players.get(round.firstKill.victimSteamId);
      if (killer) getSideStats(killer, round.firstKill.attackerSide).firstKills += 1;
      if (victim) getSideStats(victim, round.firstKill.victimSide).firstDeaths += 1;
      const openerStats = addTeamSideStats(teamSides, round.firstKill.attackerTeam, round.firstKill.attackerSide);
      const openedStats = addTeamSideStats(teamSides, round.firstKill.victimTeam, round.firstKill.victimSide);
      if (openerStats) openerStats.firstKills += 1;
      if (openedStats) openedStats.firstDeaths += 1;
    }
  }

  const output = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    sourceDemoUrl: demoUrl || null,
    matchId: Number(matchId),
    mapName: header.map_name,
    serverName: header.server_name,
    teams: {
      team1: { id: match.team1_id, name: match.team1_string },
      team2: { id: match.team2_id, name: match.team2_string }
    },
    rounds,
    teamSideStats: Array.from(teamSides.values()).sort((a, b) => a.teamName.localeCompare(b.teamName) || a.side.localeCompare(b.side)),
    players: Array.from(players.values()).sort((a, b) => a.teamName.localeCompare(b.teamName) || a.name.localeCompare(b.name))
  };

  const outputPath = path.join("public", "demo-data", "matches", `${matchId}.json`);
  ensureDir(path.dirname(outputPath));
  fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`Wrote ${outputPath}`);
  console.log(`${rounds.length} rounds, ${deaths.length} kills, ${players.size} players`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
