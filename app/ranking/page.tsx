import { createClient } from "@/lib/supabase/server";
import type { Team } from "@/lib/types";
import { Panel, TeamRow } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function RankingPage({ searchParams }: { searchParams: { division?: string } }) {
  const division = searchParams.division === "School" ? "School" : "University";
  const supabase = createClient();
  const { data } = await supabase
    .from("teams")
    .select("*")
    .eq("published", true)
    .eq("division", division)
    .order("points", { ascending: false });

  const teams = (data || []) as Team[];

  return (
    <div className="py-8">
      <div className="mb-5 text-center">
        <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-accent">LDUFK Ranking</div>
        <h1 className="font-rajdhani text-5xl font-bold">{division} Division</h1>
      </div>
      <div className="mb-4 flex justify-center gap-2">
        <a className={`rounded-lg border px-4 py-2 text-sm font-bold ${division === "University" ? "border-accent bg-accent/10 text-accent" : "border-line text-slate-400"}`} href="/ranking?division=University">University</a>
        <a className={`rounded-lg border px-4 py-2 text-sm font-bold ${division === "School" ? "border-school bg-school/10 text-school" : "border-line text-slate-400"}`} href="/ranking?division=School">School</a>
      </div>
      <Panel title="Рейтинг команд" eyebrow="Top 4 отримують LAN Invite">
        <div className="grid gap-2">{teams.map((team, index) => <TeamRow key={team.id} team={team} index={index} />)}</div>
      </Panel>
    </div>
  );
}
