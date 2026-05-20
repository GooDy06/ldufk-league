import { headers } from "next/headers";
import { CopyLinkButton } from "@/components/cams/copy-link-button";
import { addCameraPlayer, createCameraRoom, loginCamsAdmin, logoutCamsAdmin, regenerateCameraToken, removeCamera } from "@/lib/cams/actions";
import { isCamsAdminAuthed } from "@/lib/cams/auth";
import { getCamsBaseUrl, isFreshOnline } from "@/lib/cams/server-utils";
import { getCamsServiceClient } from "@/lib/cams/supabase";
import type { CameraPlayer, CameraRoom } from "@/lib/cams/types";

export const dynamic = "force-dynamic";

type AdminSearchParams = {
  error?: string;
  saved?: string;
};

function fieldClass() {
  return "rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-300";
}

function formatLastSeen(value: string | null) {
  if (!value) return "never";
  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

async function getRoomsAndPlayers() {
  const supabase = getCamsServiceClient();
  const [roomsResult, playersResult] = await Promise.all([
    supabase.from("camera_rooms").select("*").order("created_at", { ascending: false }),
    supabase.from("camera_players").select("*").order("created_at", { ascending: true })
  ]);

  if (roomsResult.error) throw new Error(roomsResult.error.message);
  if (playersResult.error) throw new Error(playersResult.error.message);

  return {
    rooms: (roomsResult.data || []) as CameraRoom[],
    players: (playersResult.data || []) as CameraPlayer[]
  };
}

function LoginPanel({ error }: { error?: string }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_16%_0%,rgba(0,213,255,0.16),transparent_34%),linear-gradient(135deg,#05080d,#0a1320_55%,#02050a)] px-4 py-10 text-white">
      <div className="mx-auto max-w-md rounded-lg border border-white/10 bg-white/[0.05] p-5 shadow-2xl backdrop-blur">
        <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-200/70">LDUFK Cams</div>
        <h1 className="mt-2 font-rajdhani text-4xl font-bold">Admin access</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">Керування room, токенами і live-статусами камер.</p>
        {error ? <p className="mt-4 rounded-lg border border-red-300/20 bg-red-500/10 p-3 text-sm text-red-100">Невірний пароль або сесія закінчилась.</p> : null}
        <form action={loginCamsAdmin} className="mt-5 grid gap-3">
          <input name="password" type="password" required placeholder="CAMS_ADMIN_PASSWORD" className={fieldClass()} />
          <button className="rounded-lg bg-cyan-300 px-4 py-3 font-rajdhani text-lg font-bold uppercase tracking-wide text-black transition hover:bg-emerald-300">Sign in</button>
        </form>
      </div>
    </div>
  );
}

export default async function CamsAdminPage({ searchParams }: { searchParams: AdminSearchParams }) {
  const authed = isCamsAdminAuthed();

  if (!authed) {
    return <LoginPanel error={searchParams.error} />;
  }

  const requestHeaders = headers();
  const baseUrl = getCamsBaseUrl(requestHeaders.get("host"), requestHeaders.get("x-forwarded-proto") || "https");
  const { rooms, players } = await getRoomsAndPlayers();
  const playersByRoom = new Map<string, CameraPlayer[]>();

  for (const player of players) {
    const roomPlayers = playersByRoom.get(player.room_id) || [];
    roomPlayers.push(player);
    playersByRoom.set(player.room_id, roomPlayers);
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_0%,rgba(0,213,255,0.14),transparent_34%),radial-gradient(circle_at_90%_10%,rgba(52,211,153,0.1),transparent_28%),linear-gradient(135deg,#05080d,#0a1320_55%,#02050a)] px-3 py-5 text-white sm:px-5">
      <div className="mx-auto grid max-w-7xl gap-5">
        <header className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 md:flex-row md:items-end">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-200/70">LDUFK broadcast cameras</div>
            <h1 className="mt-2 font-rajdhani text-5xl font-bold leading-none">Camera Control</h1>
            <p className="mt-2 text-sm text-slate-400">Rooms, player links, live camera status and token rotation.</p>
          </div>
          <form action={logoutCamsAdmin}>
            <button className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-slate-200 transition hover:border-cyan-300/40 hover:text-cyan-100">Sign out</button>
          </form>
        </header>

        {searchParams.saved ? <div className="rounded-lg border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">Saved.</div> : null}
        {searchParams.error === "steamid" ? <div className="rounded-lg border border-red-300/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">SteamID64 має містити 17 цифр.</div> : null}

        <section className="grid gap-4 rounded-lg border border-white/10 bg-white/[0.045] p-4 backdrop-blur md:grid-cols-[1fr_1fr]">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-200/70">Create room</div>
            <h2 className="mt-1 font-rajdhani text-3xl font-bold">Match camera room</h2>
          </div>
          <form action={createCameraRoom} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <input name="name" required placeholder="Match name" className={fieldClass()} />
            <input name="tournament_name" placeholder="Tournament" className={fieldClass()} />
            <button className="rounded-lg bg-cyan-300 px-4 py-2 font-bold text-black transition hover:bg-emerald-300">Create</button>
          </form>
        </section>

        <div className="grid gap-5">
          {rooms.map((room) => {
            const roomPlayers = playersByRoom.get(room.id) || [];
            return (
              <section key={room.id} className="rounded-lg border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-200/70">{room.tournament_name || "Camera room"}</div>
                    <h2 className="font-rajdhani text-3xl font-bold">{room.name}</h2>
                  </div>
                  <form action={addCameraPlayer} className="grid gap-2 md:grid-cols-[160px_140px_190px_180px_auto]">
                    <input type="hidden" name="room_id" value={room.id} />
                    <input name="nickname" required placeholder="nickname" className={fieldClass()} />
                    <input name="team_name" placeholder="team" className={fieldClass()} />
                    <input name="steamid64" required placeholder="SteamID64" className={fieldClass()} />
                    <input name="avatar_url" placeholder="avatar optional" className={fieldClass()} />
                    <button className="rounded-lg border border-emerald-300/30 bg-emerald-300/10 px-3 py-2 text-sm font-bold text-emerald-100 transition hover:bg-emerald-300/20">Add player</button>
                  </form>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[980px] border-collapse text-left text-sm">
                    <thead className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                      <tr className="border-b border-white/10">
                        <th className="py-3 pr-3">Player</th>
                        <th className="px-3 py-3">SteamID64</th>
                        <th className="px-3 py-3">Status</th>
                        <th className="px-3 py-3">Join link</th>
                        <th className="py-3 pl-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roomPlayers.map((player) => {
                        const joinLink = `${baseUrl}/join/${player.join_token}`;
                        const isOnline = isFreshOnline(player.is_online, player.last_seen);
                        return (
                          <tr key={player.id} className="border-b border-white/5 last:border-0">
                            <td className="py-3 pr-3">
                              <div className="font-bold text-white">{player.nickname}</div>
                              <div className="text-xs text-slate-500">{player.team_name || "No team"}</div>
                            </td>
                            <td className="px-3 py-3 font-rajdhani text-base font-bold text-cyan-100">{player.steamid64}</td>
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-2">
                                <span className={`h-2.5 w-2.5 rounded-full ${isOnline ? "bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.7)]" : "bg-slate-600"}`} />
                                <span className="font-bold">{isOnline ? "online" : "offline"}</span>
                              </div>
                              <div className="mt-1 text-xs text-slate-500">{formatLastSeen(player.last_seen)}</div>
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-2">
                                <input readOnly value={joinLink} className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-xs text-slate-300 outline-none" />
                                <CopyLinkButton value={joinLink} />
                              </div>
                            </td>
                            <td className="py-3 pl-3">
                              <div className="flex justify-end gap-2">
                                <form action={regenerateCameraToken}>
                                  <input type="hidden" name="player_id" value={player.id} />
                                  <button className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-bold uppercase tracking-wide text-cyan-100 transition hover:border-cyan-300/50">Regenerate</button>
                                </form>
                                <form action={removeCamera}>
                                  <input type="hidden" name="player_id" value={player.id} />
                                  <button className="rounded-lg border border-red-300/20 bg-red-500/10 px-3 py-2 text-xs font-bold uppercase tracking-wide text-red-100 transition hover:border-red-300/50">Remove camera</button>
                                </form>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {!roomPlayers.length ? <div className="rounded-lg border border-dashed border-white/10 bg-black/20 p-5 text-center text-sm text-slate-500">No players in this room yet.</div> : null}
                </div>
              </section>
            );
          })}
        </div>

        {!rooms.length ? <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.03] p-8 text-center text-slate-400">Create the first camera room to generate player join links.</div> : null}
      </div>
    </div>
  );
}
