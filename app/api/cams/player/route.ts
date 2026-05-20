import { NextResponse } from "next/server";
import { normalizeSteamId64, publicCameraPlayer } from "@/lib/cams/server-utils";
import { getCamsServiceClient } from "@/lib/cams/supabase";
import type { CameraPlayerWithRoom } from "@/lib/cams/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const steamid = normalizeSteamId64(searchParams.get("steamid"));

  if (!steamid) {
    return NextResponse.json({ error: "Invalid SteamID64" }, { status: 400 });
  }

  try {
    const supabase = getCamsServiceClient();
    const { data, error } = await supabase
      .from("camera_players")
      .select("*, room:camera_rooms(id,name,tournament_name,created_at)")
      .eq("steamid64", steamid)
      .order("is_online", { ascending: false })
      .order("last_seen", { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Camera player lookup error:", error.message);
      return NextResponse.json({ error: "Camera lookup failed" }, { status: 500 });
    }

    return NextResponse.json({ player: publicCameraPlayer(data as CameraPlayerWithRoom | null) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Camera service is not configured" }, { status: 503 });
  }
}
