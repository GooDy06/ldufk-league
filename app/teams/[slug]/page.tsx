import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Player, Team } from "@/lib/types";
import { Panel } from "@/components/ui";
import { RosterShowcase } from "@/components/roster-showcase";

export const dynamic = "force-dynamic";

export default async function TeamPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: team } = await supabase.from("teams").select("*").eq("slug", params.slug).eq("published", true).single();
  if (!team) notFound();

  const { data: players } = await supabase.from("players").select("*").eq("team_id", team.id).eq("published", true).order("rating", { ascending: false });

  const typedTeam = team as Team;

  return (
    <div className="py-5 sm:py-8">
      <div className="mb-4 rounded-2xl border border-line bg-surface p-4 sm:mb-5 sm:p-6">
        <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-accent">{typedTeam.division} Division</div>
        <h1 className="font-rajdhani text-4xl font-bold sm:text-5xl">{typedTeam.name}</h1>
        <p className="mt-2 text-sm text-slate-400 sm:text-base">{typedTeam.org}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm sm:gap-3">
          <span className="rounded-lg border border-line bg-surface2 px-3 py-2">Очки: <strong>{typedTeam.points}</strong></span>
          <span className="rounded-lg border border-line bg-surface2 px-3 py-2">Тренд: <strong>{typedTeam.trend}</strong></span>
        </div>
      </div>
      <Panel title="Склад команди" eyebrow="Players">
        <RosterShowcase players={(players || []) as Player[]} />
      </Panel>
    </div>
  );
}
