import { NextResponse } from "next/server";
import { ACTIVE_MAPS, normalizeMaps, type VetoFormat, type VetoTeamKey } from "@/lib/veto/types";
import { getVetoServiceClient, rowToVetoState } from "@/lib/veto/server";

export const dynamic = "force-dynamic";

type CreatePayload = {
  team1?: string;
  team2?: string;
  format?: VetoFormat;
  firstTeam?: VetoTeamKey;
  mapPool?: string[];
};

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as CreatePayload;
  const mapPool = normalizeMaps(payload.mapPool?.length ? payload.mapPool : ACTIVE_MAPS);

  const supabase = getVetoServiceClient();
  const { data, error } = await supabase
    .from("veto_sessions")
    .insert({
      team1: payload.team1?.trim() || "Team 1",
      team2: payload.team2?.trim() || "Team 2",
      format: payload.format || "bo3",
      first_team: payload.firstTeam || "team1",
      map_pool: mapPool,
      steps: [],
      status: "draft"
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, session: rowToVetoState(data) });
}
