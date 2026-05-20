import { notFound } from "next/navigation";
import { PlayerCameraClient } from "@/components/cams/player-camera-client";
import { getCamsServiceClient } from "@/lib/cams/supabase";
import type { CameraPlayerWithRoom } from "@/lib/cams/types";

export const dynamic = "force-dynamic";

async function getPlayerByToken(token: string) {
  const supabase = getCamsServiceClient();
  const { data, error } = await supabase
    .from("camera_players")
    .select("*, room:camera_rooms(id,name,tournament_name,created_at)")
    .eq("join_token", token)
    .maybeSingle();

  if (error) {
    console.error("Camera token lookup error:", error.message);
    return null;
  }

  return data as CameraPlayerWithRoom | null;
}

export default async function PlayerJoinPage({ params }: { params: { token: string } }) {
  const player = await getPlayerByToken(params.token);

  if (!player) notFound();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_16%_0%,rgba(0,213,255,0.16),transparent_36%),radial-gradient(circle_at_86%_10%,rgba(52,211,153,0.1),transparent_30%),linear-gradient(135deg,#05080d,#0a1320_55%,#02050a)] px-3 py-5 text-white sm:px-5">
      <div className="mx-auto grid max-w-6xl gap-5">
        <header className="rounded-lg border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
          <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-200/70">{player.room?.tournament_name || "LDUFK Cams"}</div>
          <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="font-rajdhani text-5xl font-bold leading-none">{player.room?.name || "Camera room"}</h1>
              <p className="mt-2 text-sm text-slate-400">Увімкни вебкамеру перед матчем. Сервіс не записує відео, тільки live stream для HUD.</p>
            </div>
            <div className="grid gap-1 text-right">
              <div className="font-rajdhani text-3xl font-bold text-white">{player.nickname}</div>
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200/70">{player.team_name || "No team"}</div>
              <div className="font-rajdhani text-lg font-bold text-cyan-100">{player.steamid64}</div>
            </div>
          </div>
        </header>

        <PlayerCameraClient token={params.token} player={player} />
      </div>
    </div>
  );
}
