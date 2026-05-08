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

function failIfError(error: { message: string } | null, entity: string) {
  if (error) {
    console.error(`Supabase ${entity} error:`, error.message);
    throw new Error(`Не вдалося зберегти ${entity}: ${error.message}`);
  }
}

async function assertAdmin() {
  const { supabase, user } = await requireAdmin();
  if (!user) redirect("/admin");
  return supabase;
}

export async function signIn(formData: FormData) {
  const supabase = createClient();
  const email = text(formData, "email").toLowerCase();
  const password = text(formData, "password");
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) redirect("/admin?error=credentials");

  if (email !== process.env.ADMIN_EMAIL?.trim().toLowerCase()) {
    await supabase.auth.signOut();
    redirect("/admin?error=email");
  }

  redirect("/admin");
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/admin");
}

export async function saveTeam(formData: FormData) {
  const supabase = await assertAdmin();
  const id = nullableText(formData, "id");
  const points = Number(text(formData, "points") || 0);
  const previousPoints = Number(text(formData, "previous_points") || 0);
  const trend = bool(formData, "auto_trend") && id ? points - previousPoints : Number(text(formData, "trend") || 0);
  const payload = {
    name: text(formData, "name"),
    slug: text(formData, "slug"),
    division: text(formData, "division"),
    org: text(formData, "org"),
    points,
    trend,
    color: text(formData, "color") || "#00d5ff",
    logo_url: nullableText(formData, "logo_url"),
    summary: nullableText(formData, "summary"),
    published: bool(formData, "published")
  };

  const { error } = id ? await supabase.from("teams").update(payload).eq("id", id) : await supabase.from("teams").insert(payload);
  failIfError(error, "team");
  revalidatePath("/");
  revalidatePath("/ranking");
  revalidatePath("/admin/teams");
  redirect("/admin/teams?saved=team");
}

export async function deleteTeam(formData: FormData) {
  const supabase = await assertAdmin();
  const { error } = await supabase.from("teams").delete().eq("id", text(formData, "id"));
  failIfError(error, "team");
  revalidatePath("/");
  revalidatePath("/ranking");
  revalidatePath("/admin/teams");
  redirect("/admin/teams?deleted=team");
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

  const { error } = id ? await supabase.from("players").update(payload).eq("id", id) : await supabase.from("players").insert(payload);
  failIfError(error, "player");
  revalidatePath("/");
  revalidatePath("/ranking");
  revalidatePath("/admin/players");
  redirect("/admin/players?saved=player");
}

export async function deletePlayer(formData: FormData) {
  const supabase = await assertAdmin();
  const { error } = await supabase.from("players").delete().eq("id", text(formData, "id"));
  failIfError(error, "player");
  revalidatePath("/");
  revalidatePath("/ranking");
  revalidatePath("/admin/players");
  redirect("/admin/players?deleted=player");
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

  const { error } = id ? await supabase.from("news").update(payload).eq("id", id) : await supabase.from("news").insert(payload);
  failIfError(error, "news");
  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath("/admin/news");
  redirect("/admin/news?saved=news");
}

export async function deleteNews(formData: FormData) {
  const supabase = await assertAdmin();
  const { error } = await supabase.from("news").delete().eq("id", text(formData, "id"));
  failIfError(error, "news");
  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath("/admin/news");
  redirect("/admin/news?deleted=news");
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
    featured_home: bool(formData, "featured_home"),
    published: bool(formData, "published")
  };

  const { error } = id ? await supabase.from("tournaments").update(payload).eq("id", id) : await supabase.from("tournaments").insert(payload);
  failIfError(error, "tournament");
  revalidatePath("/");
  revalidatePath("/tournaments");
  revalidatePath("/admin/tournaments");
  redirect("/admin/tournaments?saved=tournament");
}

export async function deleteTournament(formData: FormData) {
  const supabase = await assertAdmin();
  const { error } = await supabase.from("tournaments").delete().eq("id", text(formData, "id"));
  failIfError(error, "tournament");
  revalidatePath("/");
  revalidatePath("/tournaments");
  revalidatePath("/admin/tournaments");
  redirect("/admin/tournaments?deleted=tournament");
}

export async function saveHomepageChampion(formData: FormData) {
  const supabase = await assertAdmin();
  const slot = text(formData, "slot");
  const payload = {
    slot,
    team_name: text(formData, "team_name"),
    tournament_name: text(formData, "tournament_name"),
    date_label: text(formData, "date_label"),
    division_label: text(formData, "division_label"),
    image_url: nullableText(formData, "image_url"),
    details_url: nullableText(formData, "details_url")
  };

  const { error } = await supabase.from("homepage_champions").upsert(payload, { onConflict: "slot" });
  failIfError(error, "homepage champion");
  revalidatePath("/");
  revalidatePath("/admin/homepage");
  redirect("/admin/homepage?saved=homepage");
}
