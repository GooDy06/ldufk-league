import { AdminNav, Field, inputClass } from "@/components/admin";
import { SubmitButton } from "@/components/submit-button";
import { deleteTournament, saveTournament } from "@/lib/admin-actions";
import { requireAdmin } from "@/lib/supabase/server";
import type { Team, Tournament } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminTournamentsPage() {
  const { supabase, role } = await requireAdmin();
  const [{ data: tournaments }, { data: teams }] = await Promise.all([
    supabase.from("tournaments").select("*, winner:teams(name, slug)").order("created_at", { ascending: false }),
    supabase.from("teams").select("*").order("name")
  ]);

  return (
    <div className="py-8">
      <AdminNav role={role} />
      <h1 className="mb-4 font-rajdhani text-4xl font-bold">Tournaments CRUD</h1>
      <TournamentForm teams={(teams || []) as Team[]} role={role} />
      <div className="mt-6 grid gap-4">
        {((tournaments || []) as Tournament[]).map((tournament) => <TournamentForm key={tournament.id} tournament={tournament} teams={(teams || []) as Team[]} role={role} />)}
      </div>
    </div>
  );
}

function TournamentForm({ tournament, teams, role }: { tournament?: Tournament; teams: Team[]; role?: string | null }) {
  const canDelete = role === "main_admin" || role === "admin";

  return (
    <form action={saveTournament} className="grid gap-3 rounded-2xl border border-line bg-surface p-4">
      <input type="hidden" name="id" defaultValue={tournament?.id} />
      <div className="grid gap-3 md:grid-cols-3">
        <Field label="Name"><input className={inputClass} name="name" defaultValue={tournament?.name} required /></Field>
        <Field label="Slug"><input className={inputClass} name="slug" defaultValue={tournament?.slug} required /></Field>
        <Field label="Division"><select className={inputClass} name="division" defaultValue={tournament?.division || "University"}><option>University</option><option>School</option><option>Global</option></select></Field>
        <Field label="Type"><select className={inputClass} name="type" defaultValue={tournament?.type || "online"}><option value="online">online</option><option value="lan">lan</option></select></Field>
        <Field label="Date"><input className={inputClass} name="date_label" defaultValue={tournament?.date_label} required /></Field>
        <Field label="Status"><select className={inputClass} name="status" defaultValue={tournament?.status || "soon"}><option value="done">done</option><option value="live">live</option><option value="soon">soon</option></select></Field>
        <Field label="Teams count"><input className={inputClass} name="teams_count" type="number" defaultValue={tournament?.teams_count || 0} /></Field>
        <Field label="Winner">
          <select className={inputClass} name="winner_team_id" defaultValue={tournament?.winner_team_id || ""}>
            <option value="">TBA</option>
            {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
          </select>
        </Field>
        <Field label="Banner URL"><input className={inputClass} name="banner_url" defaultValue={tournament?.banner_url || ""} /></Field>
        <Field label="Published"><input name="published" type="checkbox" defaultChecked={tournament?.published} className="h-5 w-5" /></Field>
        <Field label="Show on homepage"><input name="featured_home" type="checkbox" defaultChecked={tournament?.featured_home} className="h-5 w-5" /></Field>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Field label="Points"><input className={inputClass} name="points" defaultValue={tournament?.points || ""} /></Field>
        <Field label="Prize"><input className={inputClass} name="prize" defaultValue={tournament?.prize || ""} /></Field>
        <Field label="Format"><input className={inputClass} name="format" defaultValue={tournament?.format || ""} /></Field>
      </div>
      <Field label="Description"><textarea className={inputClass} name="description" defaultValue={tournament?.description || ""} /></Field>
      <Field label="Participants, one per line"><textarea className={inputClass} name="participants" defaultValue={(tournament?.participants || []).join("\n")} /></Field>
      <SubmitButton pendingText={tournament ? "Зберігаю..." : "Створюю..."} className="w-fit rounded-lg bg-accent px-4 py-2 font-bold text-bg">
        {tournament ? "Зберегти" : "Створити"}
      </SubmitButton>
      {tournament && canDelete ? (
        <SubmitButton formAction={deleteTournament} name="id" value={tournament.id} pendingText="Видаляю..." className="w-fit rounded-lg border border-red-500/30 px-3 py-2 text-sm font-bold text-red-300">
          Видалити
        </SubmitButton>
      ) : null}
    </form>
  );
}
