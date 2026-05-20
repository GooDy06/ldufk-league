"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { clearCamsAdminCookie, isCamsAdminAuthed, setCamsAdminCookie } from "@/lib/cams/auth";
import { generateJoinToken, normalizeSteamId64 } from "@/lib/cams/server-utils";
import { getCamsServiceClient } from "@/lib/cams/supabase";

function text(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function nullableText(formData: FormData, key: string) {
  const value = text(formData, key);
  return value ? value : null;
}

function adminRedirectPath(search = "") {
  const host = headers().get("host") || "";
  const base = host.toLowerCase().startsWith("cams.") ? "/admin" : "/cams/admin";
  return `${base}${search}`;
}

function assertCamsAdmin() {
  if (!isCamsAdminAuthed()) {
    redirect(adminRedirectPath("?error=session"));
  }
}

function failIfError(error: { message: string } | null, entity: string) {
  if (error) {
    console.error(`Camera ${entity} error:`, error.message);
    throw new Error(`Не вдалося зберегти ${entity}: ${error.message}`);
  }
}

async function notifySignalingCameraRemoved(playerId: string) {
  const signalingUrl = process.env.NEXT_PUBLIC_CAMS_SIGNALING_URL?.replace(/\/$/, "");
  const secret = process.env.CAMS_SIGNALING_ADMIN_SECRET;

  if (!signalingUrl || !secret) return;

  try {
    await fetch(`${signalingUrl}/admin/remove-camera`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-cams-admin-secret": secret
      },
      body: JSON.stringify({ playerId }),
      cache: "no-store"
    });
  } catch (error) {
    console.error("Could not notify signaling server about removed camera:", error);
  }
}

export async function loginCamsAdmin(formData: FormData) {
  const expectedPassword = process.env.CAMS_ADMIN_PASSWORD;
  const password = text(formData, "password");

  if (!expectedPassword || password !== expectedPassword) {
    redirect(adminRedirectPath("?error=password"));
  }

  setCamsAdminCookie();
  redirect(adminRedirectPath());
}

export async function logoutCamsAdmin() {
  clearCamsAdminCookie();
  redirect(adminRedirectPath());
}

export async function createCameraRoom(formData: FormData) {
  assertCamsAdmin();

  const supabase = getCamsServiceClient();
  const { error } = await supabase.from("camera_rooms").insert({
    name: text(formData, "name"),
    tournament_name: nullableText(formData, "tournament_name")
  });

  failIfError(error, "room");
  revalidatePath("/cams/admin");
  redirect(adminRedirectPath("?saved=room"));
}

export async function addCameraPlayer(formData: FormData) {
  assertCamsAdmin();

  const steamid64 = normalizeSteamId64(text(formData, "steamid64"));
  if (!steamid64) {
    redirect(adminRedirectPath("?error=steamid"));
  }

  const supabase = getCamsServiceClient();
  const { error } = await supabase.from("camera_players").insert({
    room_id: text(formData, "room_id"),
    nickname: text(formData, "nickname"),
    team_name: nullableText(formData, "team_name"),
    steamid64,
    avatar_url: nullableText(formData, "avatar_url"),
    join_token: generateJoinToken(),
    is_online: false
  });

  failIfError(error, "player");
  revalidatePath("/cams/admin");
  redirect(adminRedirectPath("?saved=player"));
}

export async function regenerateCameraToken(formData: FormData) {
  assertCamsAdmin();

  const supabase = getCamsServiceClient();
  const playerId = text(formData, "player_id");
  const { error } = await supabase
    .from("camera_players")
    .update({
      join_token: generateJoinToken(),
      is_online: false,
      last_seen: null
    })
    .eq("id", playerId);

  failIfError(error, "token");

  const { error: sessionError } = await supabase
    .from("camera_sessions")
    .update({
      status: "removed",
      updated_at: new Date().toISOString()
    })
    .eq("player_id", playerId)
    .in("status", ["online", "active", "connecting"]);

  failIfError(sessionError, "session");
  await notifySignalingCameraRemoved(playerId);
  revalidatePath("/cams/admin");
  redirect(adminRedirectPath("?saved=token"));
}

export async function removeCamera(formData: FormData) {
  assertCamsAdmin();

  const playerId = text(formData, "player_id");
  const supabase = getCamsServiceClient();
  const { error: playerError } = await supabase
    .from("camera_players")
    .update({
      is_online: false,
      last_seen: null
    })
    .eq("id", playerId);

  failIfError(playerError, "camera");

  const { error: sessionError } = await supabase
    .from("camera_sessions")
    .update({
      status: "removed",
      updated_at: new Date().toISOString()
    })
    .eq("player_id", playerId)
    .in("status", ["online", "active", "connecting"]);

  failIfError(sessionError, "session");
  await notifySignalingCameraRemoved(playerId);
  revalidatePath("/cams/admin");
  redirect(adminRedirectPath("?saved=offline"));
}
