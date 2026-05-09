"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, requireAdmin } from "@/lib/supabase/server";
import type { AdminRole } from "@/lib/types";

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

function dateTime(formData: FormData, key: string) {
  const value = text(formData, key);
  if (!value.length) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function failIfError(error: { message: string } | null, entity: string) {
  if (error) {
    console.error(`Supabase ${entity} error:`, error.message);
    throw new Error(`Не вдалося зберегти ${entity}: ${error.message}`);
  }
}

function isRole(role: AdminRole | null, roles: AdminRole[]) {
  return role ? roles.includes(role) : false;
}

async function assertAdmin(roles: AdminRole[] = ["main_admin", "admin", "moderator", "reporter"]) {
  const { supabase, user, role } = await requireAdmin();
  if (!user) redirect("/admin");
  if (!isRole(role, roles)) {
    throw new Error("Недостатньо прав для цієї дії.");
  }
  return { supabase, user, role, email: user.email?.trim().toLowerCase() || null };
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

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const { data: adminUser } = await supabase.from("admin_users").select("role").eq("email", email).maybeSingle();

  if (email !== adminEmail && !adminUser?.role) {
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
  const { supabase, role } = await assertAdmin(["main_admin", "admin", "moderator"]);
  const id = nullableText(formData, "id");

  if (role === "moderator") {
    if (!id) throw new Error("Модератор може тільки редагувати назви існуючих команд.");
    const { error } = await supabase.from("teams").update({
      name: text(formData, "name"),
      slug: text(formData, "slug"),
      org: text(formData, "org")
    }).eq("id", id);
    failIfError(error, "team");
    revalidatePath("/");
    revalidatePath("/ranking");
    revalidatePath("/admin/teams");
    redirect("/admin/teams?saved=team");
  }

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
  const { supabase } = await assertAdmin(["main_admin", "admin"]);
  const { error } = await supabase.from("teams").delete().eq("id", text(formData, "id"));
  failIfError(error, "team");
  revalidatePath("/");
  revalidatePath("/ranking");
  revalidatePath("/admin/teams");
  redirect("/admin/teams?deleted=team");
}

export async function savePlayer(formData: FormData) {
  const { supabase, role } = await assertAdmin(["main_admin", "admin", "moderator"]);
  const id = nullableText(formData, "id");

  if (role === "moderator") {
    if (!id) throw new Error("Модератор може тільки редагувати ніки існуючих гравців.");
    const { error } = await supabase.from("players").update({
      nick: text(formData, "nick")
    }).eq("id", id);
    failIfError(error, "player");
    revalidatePath("/");
    revalidatePath("/ranking");
    revalidatePath("/admin/players");
    redirect("/admin/players?saved=player");
  }

  const payload = {
    team_id: nullableText(formData, "team_id"),
    nick: text(formData, "nick"),
    role: text(formData, "role"),
    rating: Number(text(formData, "rating") || 1),
    avatar_url: nullableText(formData, "avatar_url"),
    highlight_youtube_url: nullableText(formData, "highlight_youtube_url"),
    highlight_title: nullableText(formData, "highlight_title"),
    highlight_tournament: nullableText(formData, "highlight_tournament"),
    highlight_map: nullableText(formData, "highlight_map"),
    highlight_date: nullableText(formData, "highlight_date"),
    highlight_description: nullableText(formData, "highlight_description"),
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
  const { supabase } = await assertAdmin(["main_admin", "admin"]);
  const { error } = await supabase.from("players").delete().eq("id", text(formData, "id"));
  failIfError(error, "player");
  revalidatePath("/");
  revalidatePath("/ranking");
  revalidatePath("/admin/players");
  redirect("/admin/players?deleted=player");
}

export async function saveNews(formData: FormData) {
  const { supabase, user } = await assertAdmin(["main_admin", "admin", "reporter"]);
  const id = nullableText(formData, "id");
  const published = bool(formData, "published");
  const selectedPublishedAt = dateTime(formData, "published_at");
  const payload = {
    slug: text(formData, "slug"),
    title: text(formData, "title"),
    tag: text(formData, "tag") || "ann",
    excerpt: text(formData, "excerpt"),
    body: text(formData, "body"),
    image_url: nullableText(formData, "image_url"),
    published,
    published_at: published ? selectedPublishedAt || new Date().toISOString() : null,
    created_by: user.id
  };

  const { error } = id ? await supabase.from("news").update(payload).eq("id", id) : await supabase.from("news").insert(payload);
  failIfError(error, "news");
  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath("/admin/news");
  redirect("/admin/news?saved=news");
}

export async function deleteNews(formData: FormData) {
  const { supabase } = await assertAdmin(["main_admin", "admin", "reporter"]);
  const { error } = await supabase.from("news").delete().eq("id", text(formData, "id"));
  failIfError(error, "news");
  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath("/admin/news");
  redirect("/admin/news?deleted=news");
}

export async function saveTournament(formData: FormData) {
  const { supabase } = await assertAdmin(["main_admin", "admin"]);
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
  const { supabase } = await assertAdmin(["main_admin", "admin"]);
  const { error } = await supabase.from("tournaments").delete().eq("id", text(formData, "id"));
  failIfError(error, "tournament");
  revalidatePath("/");
  revalidatePath("/tournaments");
  revalidatePath("/admin/tournaments");
  redirect("/admin/tournaments?deleted=tournament");
}

export async function saveHomepageChampion(formData: FormData) {
  const { supabase } = await assertAdmin(["main_admin", "admin"]);
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

export async function saveAdminUser(formData: FormData) {
  const { supabase, email } = await assertAdmin(["main_admin"]);
  const targetEmail = text(formData, "email").toLowerCase();
  const requestedRole = text(formData, "role") as AdminRole;
  const mainEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (targetEmail === email && requestedRole !== "main_admin") {
    throw new Error("Не можна понизити свою роль через сайт, щоб не втратити доступ.");
  }

  const payload = {
    email: targetEmail,
    role: targetEmail === mainEmail ? "main_admin" as AdminRole : requestedRole
  };

  const { error } = await supabase.from("admin_users").upsert(payload, { onConflict: "email" });
  failIfError(error, "admin user");
  revalidatePath("/admin/admins");
  redirect("/admin/admins?saved=admin");
}

export async function deleteAdminUser(formData: FormData) {
  const { supabase, email } = await requireAdmin();
  if (!email) redirect("/admin");
  if (email !== process.env.ADMIN_EMAIL?.trim().toLowerCase()) {
    throw new Error("Тільки головний адмін може видаляти адмінів.");
  }

  const targetEmail = text(formData, "email").toLowerCase();
  if (targetEmail === email) {
    throw new Error("Не можна видалити самого себе з головних адмінів.");
  }

  const { error } = await supabase.from("admin_users").delete().eq("email", targetEmail);
  failIfError(error, "admin user");
  revalidatePath("/admin/admins");
  redirect("/admin/admins?deleted=admin");
}
