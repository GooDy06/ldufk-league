import { notFound } from "next/navigation";
import { RoomCameraGrid } from "@/components/cams/room-camera-grid";
import { publicCameraPlayer } from "@/lib/cams/server-utils";
import { getCamsServiceClient } from "@/lib/cams/supabase";
import type { CameraPlayerWithRoom, PublicCameraPlayer } from "@/lib/cams/types";

export const dynamic = "force-dynamic";

type RoomSearchParams = {
  mode?: "cover" | "contain";
  rounded?: string;
  names?: string;
};

function bool(value: string | undefined, fallback = false) {
  if (value === undefined) return fallback;
  return value === "true" || value === "1" || value === "yes";
}

async function getRoomPlayers(roomId: string) {
  const supabase = getCamsServiceClient();
  const { data, error } = await supabase
    .from("camera_players")
    .select("*, room:camera_rooms(id,name,tournament_name,created_at)")
    .eq("room_id", roomId)
    .order("team_name", { ascending: true, nullsFirst: false })
    .order("nickname", { ascending: true });

  if (error) {
    console.error("Camera room lookup error:", error.message);
    return null;
  }

  return ((data || []) as CameraPlayerWithRoom[])
    .map((player) => publicCameraPlayer(player))
    .filter(Boolean) as PublicCameraPlayer[];
}

export default async function CameraRoomPage({ params, searchParams }: { params: { roomId: string }; searchParams: RoomSearchParams }) {
  const players = await getRoomPlayers(params.roomId);

  if (!players) notFound();

  const mode = searchParams.mode === "contain" ? "contain" : "cover";
  const rounded = bool(searchParams.rounded, true);
  const showNames = bool(searchParams.names, true);

  return <RoomCameraGrid players={players} mode={mode} rounded={rounded} showNames={showNames} />;
}
