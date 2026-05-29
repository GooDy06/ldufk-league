import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Player, Team } from "@/lib/types";
import { RankingList } from "@/components/ranking-list";
import { getAllPlayerStats } from "@/lib/player-stats";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Рейтинг",
  description: "Рейтинг команд LDUFK League."
};

export default async function RankingPage({ searchParams }: { searchParams: { division?: string } }) {
  const division = searchParams.division === "School" ? "School" : "University";
  const supabase = createClient();
  const { data } = await supabase
    .from("teams")
    .select("*")
    .eq("published", true)
    .eq("division", division)
    .order("points", { ascending: false })
    .limit(20);

  const baseTeams = (data || []) as Team[];
  const teamIds = baseTeams.map((team) => team.id);
  const { data: playerRows } = teamIds.length
    ? await supabase
        .from("players")
        .select("*")
        .eq("published", true)
        .in("team_id", teamIds)
        .order("rating", { ascending: false })
    : { data: [] };
  const computedRatings = new Map(getAllPlayerStats().map((player) => [player.nick.toLowerCase(), player.rating]));
  const playersByTeam = new Map<string, Player[]>();
  for (const player of (playerRows || []) as Player[]) {
    if (!player.team_id) continue;
    const computedRating = computedRatings.get(player.nick.toLowerCase());
    const playerWithComputedRating = computedRating ? { ...player, rating: Number(computedRating.toFixed(2)) } : player;
    playersByTeam.set(player.team_id, [...(playersByTeam.get(player.team_id) || []), playerWithComputedRating]);
  }
  const teams = baseTeams.map((team) => ({ ...team, players: playersByTeam.get(team.id) || [] }));

  return (
    <div className="py-3 sm:py-4">
      <div className="mb-2 text-center sm:mb-3">
        <div className="text-[8px] font-bold uppercase tracking-[0.22em] text-accent sm:text-[10px] sm:tracking-[0.24em]">LDUFK Ranking</div>
        <h1 className="font-rajdhani text-3xl font-bold leading-none sm:text-4xl">{division} Division</h1>
      </div>
      <div className="mb-2 flex justify-center gap-1.5 sm:mb-3 sm:gap-2">
        <a className={`rounded-md border px-3 py-1.5 text-xs font-bold sm:rounded-lg sm:px-4 sm:py-2 sm:text-sm ${division === "University" ? "border-accent bg-accent/10 text-accent" : "border-line text-slate-400"}`} href="/ranking?division=University">University</a>
        <a className={`rounded-md border px-3 py-1.5 text-xs font-bold sm:rounded-lg sm:px-4 sm:py-2 sm:text-sm ${division === "School" ? "border-school bg-school/10 text-school" : "border-line text-slate-400"}`} href="/ranking?division=School">School</a>
      </div>
      <section className="soft-enter rounded-xl border border-line bg-surface p-2">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div>
            <div className="text-[8px] font-extrabold uppercase tracking-[0.18em] text-slate-500 sm:text-[10px] sm:tracking-[0.2em]">Top 4 отримують LAN Invite</div>
            <h2 className="font-rajdhani text-base font-bold tracking-wide sm:text-lg">Рейтинг команд</h2>
          </div>
          <div className="rounded-full border border-accent/25 bg-accent/10 px-2 py-1 text-[8px] font-extrabold uppercase tracking-[0.14em] text-accent sm:text-[10px]">
            {teams.length} teams
          </div>
        </div>
        <RankingList teams={teams} />
      </section>
    </div>
  );
}
