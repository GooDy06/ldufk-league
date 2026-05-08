import { AdminNav, Field, inputClass } from "@/components/admin";
import { SubmitButton } from "@/components/submit-button";
import { deleteTeam, saveTeam } from "@/lib/admin-actions";
import { requireAdmin } from "@/lib/supabase/server";
import type { Team } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminTeamsPage({ searchParams }: { searchParams: { saved?: string; deleted?: string } }) {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("teams").select("*").order("division").order("points", { ascending: false });
  const teams = (data || []) as Team[];
  const universityTeams = teams.filter((team) => team.division === "University");
  const schoolTeams = teams.filter((team) => team.division === "School");

  return (
    <div className="py-8">
      <AdminNav />
      <h1 className="mb-4 font-rajdhani text-4xl font-bold">Teams CRUD</h1>
      {searchParams.saved ? <StatusMessage text="Команду збережено." /> : null}
      {searchParams.deleted ? <StatusMessage text="Команду видалено." /> : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <TeamForm defaultDivision="University" />
        <TeamForm defaultDivision="School" />
      </div>
      <TeamSection title="University Teams" teams={universityTeams} />
      <TeamSection title="School Teams" teams={schoolTeams} />
    </div>
  );
}

function StatusMessage({ text }: { text: string }) {
  return <div className="mb-4 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm font-bold text-emerald-200">{text}</div>;
}

function TeamSection({ title, teams }: { title: string; teams: Team[] }) {
  return (
    <section className="mt-6">
      <h2 className="mb-3 font-rajdhani text-3xl font-bold">{title}</h2>
      <div className="grid gap-4">
        {teams.map((team) => <TeamForm key={team.id} team={team} />)}
      </div>
    </section>
  );
}

function TeamForm({ team, defaultDivision = "University" }: { team?: Team; defaultDivision?: Team["division"] }) {
  return (
    <form action={saveTeam} className="grid gap-3 rounded-2xl border border-line bg-surface p-4">
      <input type="hidden" name="id" defaultValue={team?.id} />
      <input type="hidden" name="previous_points" defaultValue={team?.points || 0} />
      {!team ? <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">Create {defaultDivision} team</div> : null}
      <div className="grid gap-3 md:grid-cols-3">
        <Field label="Name"><input className={inputClass} name="name" defaultValue={team?.name} required /></Field>
        <Field label="Slug"><input className={inputClass} name="slug" defaultValue={team?.slug} required /></Field>
        <Field label="Division"><select className={inputClass} name="division" defaultValue={team?.division || defaultDivision}><option>University</option><option>School</option></select></Field>
        <Field label="Org"><input className={inputClass} name="org" defaultValue={team?.org} required /></Field>
        <Field label="Points"><input className={inputClass} name="points" type="number" defaultValue={team?.points || 0} /></Field>
        <Field label="Trend"><input className={inputClass} name="trend" type="number" defaultValue={team?.trend || 0} /></Field>
        <Field label="Color"><input className={inputClass} name="color" defaultValue={team?.color || "#00d5ff"} /></Field>
        <Field label="Logo image URL"><input className={inputClass} name="logo_url" placeholder="https://..." defaultValue={team?.logo_url || ""} /></Field>
        <Field label="Published"><input name="published" type="checkbox" defaultChecked={team?.published} className="h-5 w-5" /></Field>
      </div>
      {team ? (
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
          <input name="auto_trend" type="checkbox" defaultChecked className="h-5 w-5" />
          Auto trend from points change. Вимкни, якщо хочеш вручну поставити Trend.
        </label>
      ) : null}
      <Field label="Summary"><textarea className={inputClass} name="summary" defaultValue={team?.summary || ""} /></Field>
      <div className="flex gap-2">
        <SubmitButton pendingText={team ? "Зберігаю..." : "Створюю..."} className="rounded-lg bg-accent px-4 py-2 font-bold text-bg">
          {team ? "Зберегти" : "Створити"}
        </SubmitButton>
      </div>
      {team ? <DeleteButton action={deleteTeam} id={team.id} /> : null}
    </form>
  );
}

function DeleteButton({ action, id }: { action: (formData: FormData) => Promise<void>; id: string }) {
  return (
    <SubmitButton formAction={action} name="id" value={id} pendingText="Видаляю..." className="w-fit rounded-lg border border-red-500/30 px-3 py-2 text-sm font-bold text-red-300">
      Видалити
    </SubmitButton>
  );
}
