import { getCamsServiceClient } from "@/lib/cams/supabase";
import type { VetoFormat, VetoSessionState, VetoStep, VetoTeamKey } from "@/lib/veto/types";

type VetoSessionRow = {
  id: string;
  team1: string | null;
  team2: string | null;
  format: VetoFormat | null;
  first_team: VetoTeamKey | null;
  map_pool: string[] | null;
  steps: VetoStep[] | null;
  status: "draft" | "live" | "complete" | null;
  updated_at: string | null;
};

export function rowToVetoState(row: VetoSessionRow): VetoSessionState {
  return {
    id: row.id,
    team1: row.team1 || "Team 1",
    team2: row.team2 || "Team 2",
    format: row.format || "bo3",
    firstTeam: row.first_team || "team1",
    mapPool: row.map_pool || [],
    steps: row.steps || [],
    status: row.status || "draft",
    updatedAt: row.updated_at
  };
}

export function getVetoServiceClient() {
  return getCamsServiceClient();
}
