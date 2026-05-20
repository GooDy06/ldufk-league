import { NextResponse } from "next/server";
import { normalizeMaps, type VetoFormat, type VetoStep, type VetoTeamKey } from "@/lib/veto/types";
import { getVetoServiceClient, rowToVetoState } from "@/lib/veto/server";
import { requireAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type UpdatePayload = {
  team1?: string;
  team2?: string;
  format?: VetoFormat;
  firstTeam?: VetoTeamKey;
  mapPool?: string[];
  steps?: VetoStep[];
  status?: "draft" | "live" | "complete";
};

export async function GET(_request: Request, { params }: { params: { sessionId: string } }) {
  const supabase = getVetoServiceClient();
  const { data, error } = await supabase
    .from("veto_sessions")
    .select("*")
    .eq("id", params.sessionId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ ok: false, error: "Veto session not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, session: rowToVetoState(data) });
}

export async function PATCH(request: Request, { params }: { params: { sessionId: string } }) {
  const { user } = await requireAdmin();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const payload = (await request.json().catch(() => ({}))) as UpdatePayload;
  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString()
  };

  if (payload.team1 !== undefined) update.team1 = payload.team1.trim() || "Team 1";
  if (payload.team2 !== undefined) update.team2 = payload.team2.trim() || "Team 2";
  if (payload.format) update.format = payload.format;
  if (payload.firstTeam) update.first_team = payload.firstTeam;
  if (payload.mapPool) update.map_pool = normalizeMaps(payload.mapPool);
  if (payload.steps) update.steps = payload.steps;
  if (payload.status) update.status = payload.status;

  const supabase = getVetoServiceClient();
  const { data, error } = await supabase
    .from("veto_sessions")
    .update(update)
    .eq("id", params.sessionId)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, session: rowToVetoState(data) });
}
