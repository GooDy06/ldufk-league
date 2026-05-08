"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, requireAdmin } from "@/lib/supabase/server";

function text(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function nullableText(formData: FormData, key: string) {
  const value = text(formData, key);
  return value.length ? value : null;
}

function bool(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

async function assertAdmin() {
  const { supabase, user } = await requireAdmin();
  if (!user) redirect("/admin");
  return supabase;
}

export async function signIn(formData: FormData) {
  const supabase = createClient();
  const email = text(formData, "email");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`
    }
  });
  redirect("/admin?sent=1");
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/admin");
}

export async function saveTeam(formData: FormData) {
  const supabase = await assertAdmin();
  const id = nullableText(formData, "id");
  const payload = {
    name: text(formData, "name"),
    slug: text(formData, "slug"),
    division: text(formData, "division"),
    org: text(formData, "org"),
    points: Number(text(formData, "points") || 0),
    trend: Number(text(formData, "trend") || 0),
    color: text(formData, "color") || "#00d5ff",
    logo_url: nullableText(formData, "logo_url"),
    summary: nullableText(formData, "summary"),
    published: bool(formData, "published")
  };

  if (id) await supabase.from("teams").update(payload).eq("id", id);
  else await supabase.from("teams").insert(payload);
  revalidatePath("/");
  revalidatePath("/admin/teams");
}

export async function deleteTeam(formData: FormData) {
  const supabase = await assertAdmin();
  await supabase.from("teams").delete().eq("id", text(formData, "id"));
  revalidatePath("/");
  revalidatePath("/admin/teams");
}

export async function savePlayer(formData: FormData) {
  const supabase = await assertAdmin();
  const id = nullableText(formData, "id");
  const payload = {
    team_id: nullableText(formData, "team_id"),
    nick: text(formData, "nick"),
    role: text(formData, "role"),
    rating: Number(text(formData, "rating") || 1),
    avatar_url: nullableText(formData, "avatar_url"),
    published: bool(formData, "published")
  };

  if (id) await supabase.from("players").update(payload).eq("id", id);
  else await supabase.from("players").insert(payload);
  revalidatePath("/");
  revalidatePath("/admin/players");
}

export async function deletePlayer(formData: FormData) {
  const supabase = await assertAdmin();
  await supabase.from("players").delete().eq("id", text(formData, "id"));
  revalidatePath("/");
  revalidatePath("/admin/players");
}

export async function saveNews(formData: FormData) {
  const supabase = await assertAdmin();
  const id = nullableText(formData, "id");
  const published = bool(formData, "published");
  const payload = {
    slug: text(formData, "slug"),
    title: text(formData, "title"),
    tag: text(formData, "tag") || "ann",
    excerpt: text(formData, "excerpt"),
    body: text(formData, "body"),
    image_url: nullableText(formData, "image_url"),
    published,
    published_at: published ? new Date().toISOString() : null
  };

  if (id) await supabase.from("news").update(payload).eq("id", id);
  else await supabase.from("news").insert(payload);
  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath("/admin/news");
}

export async function deleteNews(formData: FormData) {
  const supabase = await assertAdmin();
  await supabase.from("news").delete().eq("id", text(formData, "id"));
  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath("/admin/news");
}

export async function saveTournament(formData: FormData) {
  const supabase = await assertAdmin();
  const id = nullableText(formData, "id");
  const participants = text(formData, "participants")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
  const payload = {
    slug: text(formData, "slug"),
    name: text(formData, "name"),
    division: text(formData, "division"),
    type: text(formData, "type"),
    date_label: text(formData, "date_label"),
    status: text(formData, "status"),
    teams_count: Number(text(formData, "teams_count") || 0),
    winner_team_id: nullableText(formData, "winner_team_id"),
    points: nullableText(formData, "points"),
    prize: nullableText(formData, "prize"),
    format: nullableText(formData, "format"),
    description: nullableText(formData, "description"),
    participants,
    banner_url: nullableText(formData, "banner_url"),
    published: bool(formData, "published")
  };

  if (id) await supabase.from("tournaments").update(payload).eq("id", id);
  else await supabase.from("tournaments").insert(payload);
  revalidatePath("/");
  revalidatePath("/tournaments");
  revalidatePath("/admin/tournaments");
}

export async function deleteTournament(formData: FormData) {
  const supabase = await assertAdmin();
  await supabase.from("tournaments").delete().eq("id", text(formData, "id"));
  revalidatePath("/");
  revalidatePath("/tournaments");
  revalidatePath("/admin/tournaments");
}
