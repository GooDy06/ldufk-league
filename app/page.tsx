import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { NewsItem, Team, Tournament, Player } from "@/lib/types";
import { ChampionCard, HeroTitle, NewsCard, Panel, TeamRow } from "@/components/ui";

export const dynamic = "force-dynamic";

async function getHomeData() {
  const supabase = createClient();
  const [teams, players, news, tournaments] = await Promise.all([
    supabase.from("teams").select("*").eq("published", true).order("points", { ascending: false }),
    supabase.from("players").select("*, team:teams(name, slug, division, color)").eq("published", true).order("rating", { ascending: false }).limit(6),
    supabase.from("news").select("*").eq("published", true).order("published_at", { ascending: false, nullsFirst: false }).limit(4),
    supabase.from("tournaments").select("*, winner:teams(name, slug)").eq("published", true).eq("status", "done").order("created_at", { ascending: false })
  ]);

  return {
    teams: (teams.data || []) as Team[],
    players: (players.data || []) as Player[],
    news: (news.data || []) as NewsItem[],
    tournaments: (tournaments.data || []) as Tournament[]
  };
}

export default async function HomePage() {
  const { teams, players, news, tournaments } = await getHomeData();
  const universityTeams = teams.filter((team) => team.division === "University").slice(0, 5);
  const schoolTeams = teams.filter((team) => team.division === "School").slice(0, 5);
  const universityWinner = tournaments.find((t) => t.division === "University");
  const schoolWinner = tournaments.find((t) => t.division === "School");

  return (
    <>
      <HeroTitle />

      <section className="grid gap-4 md:grid-cols-2">
        {universityWinner ? <ChampionCard tournament={universityWinner} /> : null}
        {schoolWinner ? <ChampionCard tournament={schoolWinner} /> : null}
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-2">
        <Panel
          eyebrow="University Ranking"
          title="Топ університетів"
          action={<Link className="rounded-lg border border-line px-3 py-2 text-sm font-bold text-slate-300 hover:text-accent" href="/ranking?division=University">Весь топ</Link>}
        >
          <div className="grid gap-2">{universityTeams.map((team, index) => <TeamRow key={team.id} team={team} index={index} />)}</div>
        </Panel>

        <Panel
          eyebrow="School Ranking"
          title="Топ шкіл"
          action={<Link className="rounded-lg border border-line px-3 py-2 text-sm font-bold text-slate-300 hover:text-school" href="/ranking?division=School">Весь топ</Link>}
        >
          <div className="grid gap-2">{schoolTeams.map((team, index) => <TeamRow key={team.id} team={team} index={index} />)}</div>
        </Panel>
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <Panel eyebrow="Player Watch" title="Топ-гравці">
          <div className="grid gap-2">
            {players.map((player, index) => (
              <div key={player.id} className="grid grid-cols-[34px_34px_1fr_auto] items-center gap-3 rounded-xl border border-line bg-surface2 p-3">
                <div className="font-rajdhani text-xl font-bold text-gold">{index + 1}</div>
                <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-accent to-violet-600 text-xs font-bold">
                  {player.nick.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold">{player.nick}</div>
                  <div className="text-xs text-slate-500">{player.team?.name || "Free agent"} · {player.role}</div>
                </div>
                <div className="font-rajdhani text-lg font-bold">{player.rating}</div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel eyebrow="Новини ліги" title="Останні анонси" action={<Link href="/news" className="rounded-lg border border-line px-3 py-2 text-sm font-bold text-slate-300 hover:text-accent">Всі новини</Link>}>
          <div className="grid gap-3 md:grid-cols-2">{news.map((item) => <NewsCard key={item.id} item={item} />)}</div>
        </Panel>
      </section>
    </>
  );
}
