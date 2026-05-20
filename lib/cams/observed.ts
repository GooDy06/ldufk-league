export function normalizeObservedSteamId(value: unknown) {
  const steamid = String(value || "").trim();
  return /^\d{17}$/.test(steamid) ? steamid : null;
}

function readPath(source: unknown, path: string[]) {
  let current = source;

  for (const key of path) {
    if (!current || typeof current !== "object" || !(key in current)) return null;
    current = (current as Record<string, unknown>)[key];
  }

  return current;
}

export function getObservedSteamId(gameState: unknown) {
  const candidatePaths = [
    ["observedSteamId"],
    ["observed_steamid"],
    ["observed", "steamid64"],
    ["observed", "steamid"],
    ["observed_player", "steamid64"],
    ["observed_player", "steamid"],
    ["observer", "steamid64"],
    ["observer", "steamid"],
    ["spectating", "steamid64"],
    ["spectating", "steamid"],
    ["active_player", "steamid64"],
    ["active_player", "steamid"],
    ["current_player", "steamid64"],
    ["current_player", "steamid"],
    ["player", "steamid64"],
    ["player", "steamid"]
  ];

  for (const path of candidatePaths) {
    const steamid = normalizeObservedSteamId(readPath(gameState, path));
    if (steamid) return steamid;
  }

  return null;
}
