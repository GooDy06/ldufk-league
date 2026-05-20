export type VetoFormat = "bo1" | "bo3" | "bo5";
export type VetoAction = "ban" | "pick" | "decider";
export type VetoTeamKey = "team1" | "team2" | "system";

export type VetoStep = {
  team: VetoTeamKey;
  action: VetoAction;
  map: string;
};

export type VetoSessionState = {
  id: string;
  team1: string;
  team2: string;
  format: VetoFormat;
  firstTeam: VetoTeamKey;
  mapPool: string[];
  steps: VetoStep[];
  status: "draft" | "live" | "complete";
  updatedAt?: string | null;
};

export const ACTIVE_MAPS = ["Ancient", "Anubis", "Dust2", "Inferno", "Mirage", "Nuke", "Overpass"];

export function formatLabel(format: VetoFormat) {
  if (format === "bo1") return "Best of 1";
  if (format === "bo5") return "Best of 5";
  return "Best of 3";
}

export function normalizeMaps(value: string | string[]) {
  const source = Array.isArray(value) ? value : value.split(/\n|,/);

  return source
    .map((map) => map.trim())
    .filter(Boolean)
    .filter((map, index, maps) => maps.findIndex((item) => item.toLowerCase() === map.toLowerCase()) === index);
}

type PlannedVetoStep = Omit<VetoStep, "map">;

export function planFor(format: VetoFormat, first: VetoTeamKey, totalMaps: number): PlannedVetoStep[] {
  const second: VetoTeamKey = first === "team1" ? "team2" : "team1";

  if (format === "bo1") {
    const steps: PlannedVetoStep[] = [];
    for (let index = 0; index < Math.max(0, totalMaps - 1); index += 1) {
      steps.push({ team: index % 2 === 0 ? first : second, action: "ban" });
    }
    steps.push({ team: "system", action: "decider" });
    return steps;
  }

  if (format === "bo5") {
    const picksNeeded = Math.min(4, Math.max(0, totalMaps - 3));
    return [
      { team: first, action: "ban" },
      { team: second, action: "ban" },
      ...Array.from({ length: picksNeeded }, (_, index) => ({ team: index % 2 === 0 ? first : second, action: "pick" as VetoAction })),
      { team: "system", action: "decider" }
    ];
  }

  return [
    { team: first, action: "ban" },
    { team: second, action: "ban" },
    { team: first, action: "pick" },
    { team: second, action: "pick" },
    { team: first, action: "ban" },
    { team: second, action: "ban" },
    { team: "system", action: "decider" }
  ];
}

export function actionLabel(action: VetoAction) {
  if (action === "ban") return "banned";
  if (action === "pick") return "picked";
  return "decider";
}

export function actionColor(action: VetoAction) {
  if (action === "ban") return "text-rose-300";
  return "text-emerald-300";
}

export function mapSlug(map: string) {
  const clean = map.trim().toLowerCase().replace(/^de_/, "").replace(/\s+/g, "_");
  if (clean === "dust2" || clean === "dust_2") return "de_dust2";
  return `de_${clean}`;
}

export function teamNameFor(state: Pick<VetoSessionState, "team1" | "team2">, team: VetoTeamKey) {
  if (team === "team1") return state.team1 || "Team 1";
  if (team === "team2") return state.team2 || "Team 2";
  return "System";
}

export function remainingMaps(mapPool: string[], steps: VetoStep[]) {
  return mapPool.filter((map) => !steps.some((step) => step.map.toLowerCase() === map.toLowerCase()));
}

export function publicObsUrl(sessionId: string) {
  const base = process.env.NEXT_PUBLIC_VETO_ORIGIN || "https://veto.ldufk.com";
  return `${base}/obs/${sessionId}`;
}
