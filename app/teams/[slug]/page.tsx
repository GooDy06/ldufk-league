import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Player, Team } from "@/lib/types";
import { Panel } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function TeamPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: team } = await supabase.from("teams").select("*").eq("slug", params.slug).eq("published", true).single();
  if (!team) notFound();

  const { data: players } = await supabase.from("players").select("*").eq("team_id", team.id).eq("published", true).order("rating", { ascending: false });

  const typedTeam = team as Team;

  return (
    <div className="py-8">
      <div className="mb-5 rounded-2xl border border-line bg-surface p-6">
        <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-accent">{typedTeam.division} Division</div>
        <h1 className="font-rajdhani text-5xl font-bold">{typedTeam.name}</h1>
        <p className="mt-2 text-slate-400">{typedTeam.org}</p>
        <div className="mt-4 flex gap-3 text-sm">
          <span className="rounded-lg border border-line bg-surface2 px-3 py-2">Очки: <strong>{typedTeam.points}</strong></span>
          <span className="rounded-lg border border-line bg-surface2 px-3 py-2">Тренд: <strong>{typedTeam.trend}</strong></span>
        </div>
      </div>
      <Panel title="Склад команди" eyebrow="Players">
        <div className="grid gap-2 md:grid-cols-2">
          {((players || []) as Player[]).map((player) => (
            <div key={player.id} className="rounded-xl border border-line bg-surface2 p-4">
              <div className="font-bold">{player.nick}</div>
              <div className="text-sm text-slate-500">{player.role} · rating {player.rating}</div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
