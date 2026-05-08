import { AdminNav, Field, inputClass } from "@/components/admin";
import { deleteTeam, saveTeam } from "@/lib/admin-actions";
import { requireAdmin } from "@/lib/supabase/server";
import type { Team } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminTeamsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("teams").select("*").order("division").order("points", { ascending: false });
  const teams = (data || []) as Team[];

  return (
    <div className="py-8">
      <AdminNav />
      <h1 className="mb-4 font-rajdhani text-4xl font-bold">Teams CRUD</h1>
      <TeamForm />
      <div className="mt-6 grid gap-4">
        {teams.map((team) => <TeamForm key={team.id} team={team} />)}
      </div>
    </div>
  );
}

function TeamForm({ team }: { team?: Team }) {
  return (
    <form action={saveTeam} className="grid gap-3 rounded-2xl border border-line bg-surface p-4">
      <input type="hidden" name="id" defaultValue={team?.id} />
      <div className="grid gap-3 md:grid-cols-3">
        <Field label="Name"><input className={inputClass} name="name" defaultValue={team?.name} required /></Field>
        <Field label="Slug"><input className={inputClass} name="slug" defaultValue={team?.slug} required /></Field>
        <Field label="Division"><select className={inputClass} name="division" defaultValue={team?.division || "University"}><option>University</option><option>School</option></select></Field>
        <Field label="Org"><input className={inputClass} name="org" defaultValue={team?.org} required /></Field>
        <Field label="Points"><input className={inputClass} name="points" type="number" defaultValue={team?.points || 0} /></Field>
        <Field label="Trend"><input className={inputClass} name="trend" type="number" defaultValue={team?.trend || 0} /></Field>
        <Field label="Color"><input className={inputClass} name="color" defaultValue={team?.color || "#00d5ff"} /></Field>
        <Field label="Logo URL"><input className={inputClass} name="logo_url" defaultValue={team?.logo_url || ""} /></Field>
        <Field label="Published"><input name="published" type="checkbox" defaultChecked={team?.published} className="h-5 w-5" /></Field>
      </div>
      <Field label="Summary"><textarea className={inputClass} name="summary" defaultValue={team?.summary || ""} /></Field>
      <div className="flex gap-2">
        <button className="rounded-lg bg-accent px-4 py-2 font-bold text-bg">{team ? "Зберегти" : "Створити"}</button>
      </div>
      {team ? <DeleteButton action={deleteTeam} id={team.id} /> : null}
    </form>
  );
}

function DeleteButton({ action, id }: { action: (formData: FormData) => Promise<void>; id: string }) {
  return <button formAction={action} name="id" value={id} className="w-fit rounded-lg border border-red-500/30 px-3 py-2 text-sm font-bold text-red-300">Видалити</button>;
}
