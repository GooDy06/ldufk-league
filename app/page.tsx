import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { HomepageChampion, NewsItem, Team, Tournament, Player } from "@/lib/types";
import { ChampionCard, HeroTitle, NewsCard, Panel, TeamRow } from "@/components/ui";
import { DEFAULT_PLAYER_AVATAR } from "@/components/roster-showcase";
import { LiteYoutubePlayer } from "@/components/lite-youtube-player";

export const dynamic = "force-dynamic";

async function getHomeData() {
  const supabase = createClient();
  const [teams, players, news, homepageChampions, tournaments] = await Promise.all([
    supabase.from("teams").select("*").eq("published", true).order("points", { ascending: false }),
    supabase.from("players").select("*, team:teams(name, slug, division, color)").eq("published", true).order("rating", { ascending: false }).limit(10),
    supabase.from("news").select("*").eq("published", true).order("published_at", { ascending: false, nullsFirst: false }).limit(4),
    supabase.from("homepage_champions").select("*").order("slot"),
    supabase.from("tournaments").select("*, winner:teams(name, slug)").eq("published", true).eq("status", "done").order("created_at", { ascending: false })
  ]);

  return {
    teams: (teams.data || []) as Team[],
    players: (players.data || []) as Player[],
    news: (news.data || []) as NewsItem[],
    homepageChampions: (homepageChampions.data || []) as HomepageChampion[],
    tournaments: (tournaments.data || []) as Tournament[]
  };
}

function youtubeVideoId(url: string | null) {
  if (!url) return null;

  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.slice(1);
    }

    if (parsed.pathname.startsWith("/shorts/")) {
      return parsed.pathname.split("/")[2] || null;
    }

    if (parsed.pathname.startsWith("/embed/")) {
      return parsed.pathname.split("/")[2] || null;
    }

    return parsed.searchParams.get("v");
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const { teams, players, news, homepageChampions, tournaments } = await getHomeData();
  const universityTeams = teams.filter((team) => team.division === "University").slice(0, 5);
  const schoolTeams = teams.filter((team) => team.division === "School").slice(0, 5);
  const universityWinner = homepageChampions.find((champion) => champion.slot === "University") || tournaments.find((t) => t.division === "University");
  const schoolWinner = homepageChampions.find((champion) => champion.slot === "School") || tournaments.find((t) => t.division === "School");

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

      <section className="mt-5 grid gap-4 lg:grid-cols-2">
        <Panel eyebrow="Player Watch" title="Топ-гравці">
          <div className="grid gap-2">
            {players.map((player, index) => (
              index === 0 ? (
                <TopPlayerHighlight key={player.id} player={player} />
              ) : (
                <div key={player.id} className="grid grid-cols-[34px_34px_1fr_auto] items-center gap-3 rounded-xl border border-line bg-surface2 p-3">
                  <div className={`font-rajdhani text-xl font-bold ${index === 1 ? "text-slate-300" : index === 2 ? "text-amber-700" : "text-slate-500"}`}>{index + 1}</div>
                  <div
                    className="h-9 w-9 overflow-hidden rounded-full bg-gradient-to-br from-accent to-violet-600 bg-cover bg-center"
                    style={{ backgroundImage: `url(${player.avatar_url || DEFAULT_PLAYER_AVATAR})` }}
                  />
                  <div>
                    <div className="font-bold">{player.nick}</div>
                    <div className="text-[11px] text-slate-600">{player.team?.name || "Free agent"} · {player.role}</div>
                  </div>
                  <div className="text-right font-rajdhani text-sm font-bold text-slate-400">
                    <span className="block text-[9px] uppercase tracking-widest text-slate-600">Rating 3.0</span>
                    {player.rating}
                  </div>
                </div>
              )
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

function TopPlayerHighlight({ player }: { player: Player }) {
  const videoId = youtubeVideoId(player.highlight_youtube_url);

  return (
    <div className="overflow-hidden rounded-xl border border-accent/30 bg-surface2">
      <div className="grid grid-cols-[34px_42px_1fr_auto] items-center gap-3 border-b border-line p-3">
        <div className="font-rajdhani text-2xl font-bold text-gold">1</div>
        <div
          className="h-11 w-11 overflow-hidden rounded-full bg-gradient-to-br from-accent to-violet-600 bg-cover bg-center"
          style={{ backgroundImage: `url(${player.avatar_url || DEFAULT_PLAYER_AVATAR})` }}
        />
        <div>
          <div className="font-rajdhani text-2xl font-bold leading-none">{player.nick}</div>
          <div className="mt-1 text-xs text-slate-600">{player.team?.name || "Free agent"} · {player.role}</div>
        </div>
        <div className="text-right font-rajdhani text-sm font-bold text-slate-400">
          <span className="block text-[9px] uppercase tracking-widest text-slate-600">Rating 3.0</span>
          {player.rating}
        </div>
      </div>

      <div className="p-3">
        <div className="mx-auto w-full max-w-[720px] overflow-hidden rounded-lg border border-line bg-black">
          <LiteYoutubePlayer videoId={videoId} title={`${player.nick} highlight`} />
        </div>

        <div className="mx-auto mt-3 max-w-[720px] rounded-lg border border-line bg-bg/25 px-3 py-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-[9px] font-extrabold uppercase tracking-[0.22em] text-accent">Топ-1 highlight останнього періоду</div>
              <div className="mt-1 text-sm font-bold text-slate-300">{player.highlight_title || "Найкращий момент останнього турніру"}</div>
            </div>
            <div className="text-right text-[11px] leading-5 text-slate-500">
              <span>{player.highlight_tournament || "LDUFK League"}</span>
              <span className="mx-2 text-slate-700">/</span>
              <span>{player.highlight_map || "TBA"}</span>
              <span className="mx-2 text-slate-700">/</span>
              <span>{player.highlight_date || "TBA"}</span>
            </div>
          </div>
          {player.highlight_description ? <p className="mt-2 text-xs leading-5 text-slate-500">{player.highlight_description}</p> : null}
        </div>
      </div>
    </div>
  );
}
