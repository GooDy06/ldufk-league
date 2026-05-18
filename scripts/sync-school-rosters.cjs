#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

function loadDotEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
}

function slugify(value) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const schoolRosters = [
  { name: "S0mples", slug: "lyceim-74-lviv", org: "Ліцей 74 імені Марійки Підгірянки (Львів)", color: "#18d7ff", players: ["Fintik", "GODlike", "forever", "mar1k_ch", "windivatph"] },
  { name: "KOZA4KU", slug: "lyceum-prestige-nadvirna", org: "Ліцей \"Престиж\" (Надвірна)", color: "#6ff0c2", players: ["Dand_s", "Flaik1ch", "Quer1ann", "mrfliyyy", "zhoha"] },
  { name: "Nonsense_eSports", slug: "lyceum-3-hmel", org: "Ліцей №3 імені Артема Мазура (Хмельницький)", color: "#facc15", players: ["FUGA228", "Goldmay", "awuxm", "sh4d3", "sp5ider"] },
  { name: "Prestige", slug: "prestige", org: "LDUFK School Cup 2026", color: "#ff9aa2", players: ["Cla1m", "Kyos666", "Yarem1ch", "m1quse", "morex666"] },
  { name: "VLMIA", slug: "vlmia", org: "LDUFK School Cup 2026", color: "#a78bfa", players: ["Klin", "TheEvilBoys", "_ome1ya17_", "manrase2", "s0lanaflip3r"] },
  { name: "Kostopil FireTeam", slug: "kostopil-fireteam", org: "LDUFK School Cup 2026", color: "#fb923c", players: ["-1rix", "Arsen_Bakin", "BambooFury", "Snapcake", "monte666"] }
];

const playerAliases = new Map([
  ["GODlike---", "GODlike"],
  ["forev3r-", "forever"],
  ["mar2k_ch", "mar1k_ch"]
]);

function demoStats() {
  const dir = path.join(process.cwd(), "public", "demo-data", "matches");
  const players = new Map();
  if (!fs.existsSync(dir)) return players;

  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith(".json")) continue;
    const data = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
    for (const player of data.players || []) {
      const current = players.get(player.name) || { kills: 0, deaths: 0, damage: 0, maps: 0 };
      current.maps += 1;
      for (const side of Object.values(player.sides || {})) {
        current.kills += side.kills || 0;
        current.deaths += side.deaths || 0;
        current.damage += side.damage || 0;
      }
      players.set(player.name, current);
    }
  }

  for (const stats of players.values()) {
    const rounds = Math.max(1, stats.maps * 20);
    const killPart = (stats.kills / rounds) / 0.7;
    const damagePart = (stats.damage / rounds) / 85;
    const survivalPart = ((rounds - stats.deaths) / rounds) / 0.7;
    stats.rating = Number(((killPart * 0.45) + (damagePart * 0.35) + (Math.max(0, survivalPart) * 0.2)).toFixed(2));
    stats.kd = stats.deaths > 0 ? stats.kills / stats.deaths : stats.kills;
  }

  return players;
}

async function main() {
  loadDotEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Add SUPABASE_SERVICE_ROLE_KEY to .env.local to write teams/players automatically.");
  }

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
  const stats = demoStats();
  const teamIds = new Map();

  for (const [index, team] of schoolRosters.entries()) {
    const payload = {
      name: team.name,
      slug: team.slug,
      division: "School",
      org: team.org,
      points: Math.max(0, 1000 - index * 35),
      trend: 0,
      color: team.color,
      summary: `${team.name} roster for LDUFK School Cup 2026.`,
      published: true
    };
    const { data, error } = await supabase.from("teams").upsert(payload, { onConflict: "slug" }).select("id").single();
    if (error) throw error;
    teamIds.set(team.slug, data.id);
  }

  for (const team of schoolRosters) {
    for (const nick of team.players) {
      const playerStats = stats.get(nick);
      const rating = playerStats?.rating || 1;
      const { data: existingRows, error: findError } = await supabase.from("players").select("*").eq("nick", nick).limit(1);
      if (findError) throw findError;
      const existing = existingRows?.[0] || null;

      const payload = {
        team_id: teamIds.get(team.slug),
        nick,
        rating,
        role: existing?.role || "Rifler",
        avatar_url: existing?.avatar_url || null,
        highlight_youtube_url: existing?.highlight_youtube_url || null,
        highlight_title: existing?.highlight_title || null,
        highlight_tournament: existing?.highlight_tournament || null,
        highlight_map: existing?.highlight_map || null,
        highlight_date: existing?.highlight_date || null,
        highlight_description: existing?.highlight_description || null,
        published: true
      };

      if (existing?.id) {
        const { error } = await supabase.from("players").update(payload).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("players").insert(payload);
        if (error) throw error;
      }
    }
  }

  for (const [alias, canonical] of playerAliases.entries()) {
    const { data: aliasRows, error: aliasError } = await supabase.from("players").select("*").eq("nick", alias).limit(1);
    if (aliasError) throw aliasError;
    const aliasPlayer = aliasRows?.[0];
    if (!aliasPlayer) continue;

    const { data: canonicalRows, error: canonicalError } = await supabase.from("players").select("*").eq("nick", canonical).limit(1);
    if (canonicalError) throw canonicalError;
    const canonicalPlayer = canonicalRows?.[0];

    if (canonicalPlayer) {
      const patch = {};
      for (const key of ["role", "avatar_url", "highlight_youtube_url", "highlight_title", "highlight_tournament", "highlight_map", "highlight_date", "highlight_description"]) {
        if (!canonicalPlayer[key] && aliasPlayer[key]) patch[key] = aliasPlayer[key];
      }
      if (Object.keys(patch).length) {
        const { error } = await supabase.from("players").update(patch).eq("id", canonicalPlayer.id);
        if (error) throw error;
      }
      const { error } = await supabase.from("players").delete().eq("id", aliasPlayer.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("players").update({ nick: canonical }).eq("id", aliasPlayer.id);
      if (error) throw error;
    }
  }

  for (const [teamSlug, teamId] of teamIds.entries()) {
    const team = schoolRosters.find((item) => item.slug === teamSlug);
    if (!team) continue;
    const { data: currentPlayers, error } = await supabase.from("players").select("id, nick").eq("team_id", teamId);
    if (error) throw error;
    const desired = new Set(team.players);
    const staleIds = (currentPlayers || []).filter((player) => !desired.has(player.nick)).map((player) => player.id);
    if (staleIds.length) {
      const { error: staleError } = await supabase.from("players").update({ published: false }).in("id", staleIds);
      if (staleError) throw staleError;
    }
  }

  console.log(`Synced ${schoolRosters.length} teams and school players.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
