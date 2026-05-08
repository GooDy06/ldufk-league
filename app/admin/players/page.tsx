import { AdminNav, Field, inputClass } from "@/components/admin";
import { SubmitButton } from "@/components/submit-button";
import { deletePlayer, savePlayer } from "@/lib/admin-actions";
import { requireAdmin } from "@/lib/supabase/server";
import type { Player, Team } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminPlayersPage({ searchParams }: { searchParams: { saved?: string; deleted?: string } }) {
  const { supabase } = await requireAdmin();
  const [{ data: players }, { data: teams }] = await Promise.all([
    supabase.from("players").select("*, team:teams(name, slug, division, color)").order("rating", { ascending: false }),
    supabase.from("teams").select("*").order("name")
  ]);

  return (
    <div className="py-8">
      <AdminNav />
      <h1 className="mb-4 font-rajdhani text-4xl font-bold">Players CRUD</h1>
      {searchParams.saved ? <StatusMessage text="Гравця створено / збережено." /> : null}
      {searchParams.deleted ? <StatusMessage text="Гравця видалено." /> : null}
      <PlayerForm teams={(teams || []) as Team[]} />
      <div className="mt-6 grid gap-4">
        {((players || []) as Player[]).map((player) => <PlayerForm key={player.id} player={player} teams={(teams || []) as Team[]} />)}
      </div>
    </div>
  );
}

function StatusMessage({ text }: { text: string }) {
  return <div className="mb-4 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm font-bold text-emerald-200">{text}</div>;
}

function PlayerForm({ player, teams }: { player?: Player; teams: Team[] }) {
  return (
    <form action={savePlayer} className="grid gap-3 rounded-2xl border border-line bg-surface p-4">
      <input type="hidden" name="id" defaultValue={player?.id} />
      <div className="grid gap-3 md:grid-cols-3">
        <Field label="Nick"><input className={inputClass} name="nick" defaultValue={player?.nick} required /></Field>
        <Field label="Role"><input className={inputClass} name="role" defaultValue={player?.role || "Rifler"} /></Field>
        <Field label="Rating"><input className={inputClass} name="rating" type="number" step="0.01" defaultValue={player?.rating || 1} /></Field>
        <Field label="Team">
          <select className={inputClass} name="team_id" defaultValue={player?.team_id || ""}>
            <option value="">Free agent</option>
            {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
          </select>
        </Field>
        <Field label="Avatar URL"><input className={inputClass} name="avatar_url" defaultValue={player?.avatar_url || ""} /></Field>
        <Field label="Published"><input name="published" type="checkbox" defaultChecked={player?.published} className="h-5 w-5" /></Field>
      </div>
      <SubmitButton pendingText={player ? "Зберігаю..." : "Створюю..."} className="w-fit rounded-lg bg-accent px-4 py-2 font-bold text-bg">
        {player ? "Зберегти" : "Створити"}
      </SubmitButton>
      {player ? (
        <SubmitButton formAction={deletePlayer} name="id" value={player.id} pendingText="Видаляю..." className="w-fit rounded-lg border border-red-500/30 px-3 py-2 text-sm font-bold text-red-300">
          Видалити
        </SubmitButton>
      ) : null}
    </form>
  );
}
