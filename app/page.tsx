import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { HomepageChampion, NewsItem, Team, Tournament, Player } from "@/lib/types";
import { ChampionCard, HeroTitle, NewsCard, Panel, TeamRow } from "@/components/ui";
import { DEFAULT_PLAYER_AVATAR } from "@/components/roster-showcase";
import { LiteYoutubePlayer } from "@/components/lite-youtube-player";
import { HomeLeagueTabs } from "@/components/home-league-tabs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Головна | LDUFK League",
  description: "Головна сторінка LDUFK League: рейтинги, матчі, турніри та новини."
};

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

      <section className="mt-1">
        <div className="hidden grid-cols-2 gap-4 md:grid">
          <LeagueFeature label="School League" tone="school">
            {schoolWinner ? <ChampionCard tournament={schoolWinner} /> : null}
          </LeagueFeature>
          <LeagueFeature label="University League" tone="university">
            {universityWinner ? <ChampionCard tournament={universityWinner} /> : null}
          </LeagueFeature>
        </div>
        <HomeLeagueTabs
          school={schoolWinner ? <ChampionCard tournament={schoolWinner} /> : null}
          university={universityWinner ? <ChampionCard tournament={universityWinner} /> : null}
        />
      </section>

      <section className="mt-3 sm:mt-5">
        <div className="hidden grid-cols-2 gap-4 md:grid">
          <SchoolRanking teams={schoolTeams} />
          <UniversityRanking teams={universityTeams} />
        </div>
        <HomeLeagueTabs school={<SchoolRanking teams={schoolTeams} />} university={<UniversityRanking teams={universityTeams} />} />
      </section>

      <section className="mt-3 grid gap-3 sm:mt-5 sm:gap-4 lg:grid-cols-2">
        <Panel eyebrow="Player Watch" title="Топ-гравці">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
            {players.map((player, index) => (
              index === 0 ? (
                <TopPlayerHighlight key={player.id} player={player} />
              ) : (
                <Link href={`/players/${encodeURIComponent(player.nick)}`} key={player.id} className="interactive-card soft-enter grid grid-cols-[18px_26px_minmax(0,1fr)] items-center gap-1.5 rounded-lg border border-line bg-surface2 p-1.5 sm:grid-cols-[22px_30px_minmax(0,1fr)_64px] sm:gap-2 sm:rounded-xl sm:p-2">
                  <div className={`font-rajdhani text-base font-bold leading-none sm:text-xl ${index === 1 ? "text-slate-300" : index === 2 ? "text-amber-700" : "text-slate-500"}`}>{index + 1}</div>
                  <div
                    className="h-6 w-6 overflow-hidden rounded-full bg-gradient-to-br from-accent to-school bg-cover bg-center sm:h-8 sm:w-8"
                    style={{ backgroundImage: `url(${player.avatar_url || DEFAULT_PLAYER_AVATAR})` }}
                  />
                  <div className="min-w-0">
                    <div className="truncate text-xs font-bold leading-none sm:text-base">{player.nick}</div>
                    <div className="mt-0.5 truncate text-[8px] leading-none text-slate-600 sm:text-[11px]">{player.team?.name || "Free agent"} · {player.role}</div>
                  </div>
                  <div className="hidden text-right font-rajdhani text-sm font-bold text-slate-400 sm:block">
                    <span className="block text-[9px] uppercase tracking-widest text-slate-600">Rating 3.0</span>
                    {player.rating}
                  </div>
                </Link>
              )
            ))}
          </div>
        </Panel>

        <Panel eyebrow="Новини ліги" title="Останні анонси" action={<Link href="/news" className="focus-ring whitespace-nowrap rounded-md border border-line px-2 py-1 text-[10px] font-bold text-slate-300 transition hover:border-accent/40 hover:bg-accent/10 hover:text-accent sm:rounded-lg sm:px-3 sm:py-2 sm:text-sm">Всі новини</Link>}>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">{news.map((item) => <NewsCard key={item.id} item={item} />)}</div>
        </Panel>
      </section>
    </>
  );
}

function TopPlayerHighlight({ player }: { player: Player }) {
  const videoId = youtubeVideoId(player.highlight_youtube_url);

  return (
    <div className="soft-enter col-span-2 overflow-hidden rounded-lg border border-accent/30 bg-surface2 sm:col-span-1 sm:rounded-xl">
      <div className="grid grid-cols-[18px_34px_minmax(0,1fr)_48px] items-center gap-1.5 border-b border-line p-2 sm:grid-cols-[22px_36px_minmax(0,1fr)_64px] sm:gap-2">
        <div className="font-rajdhani text-xl font-bold text-gold sm:text-2xl">1</div>
        <div
          className="h-8 w-8 overflow-hidden rounded-full bg-gradient-to-br from-accent to-school bg-cover bg-center sm:h-9 sm:w-9"
          style={{ backgroundImage: `url(${player.avatar_url || DEFAULT_PLAYER_AVATAR})` }}
        />
        <div className="min-w-0">
          <div className="truncate font-rajdhani text-xl font-bold leading-none sm:text-2xl">{player.nick}</div>
          <div className="mt-0.5 truncate text-[10px] text-slate-600 sm:mt-1 sm:text-xs">{player.team?.name || "Free agent"} · {player.role}</div>
        </div>
        <div className="text-right font-rajdhani text-sm font-bold text-slate-400">
          <span className="block text-[7px] uppercase tracking-[0.12em] text-slate-600 sm:text-[9px] sm:tracking-widest">Rating 3.0</span>
          {player.rating}
        </div>
      </div>

      <div className="p-2 sm:p-3">
        <div className="mx-auto w-full max-w-[720px] overflow-hidden rounded-lg border border-line bg-black">
          <LiteYoutubePlayer videoId={videoId} title={`${player.nick} highlight`} className="aspect-[16/7] sm:aspect-video" />
        </div>

        <div className="mx-auto mt-2 max-w-[720px] rounded-lg border border-line bg-bg/25 px-2 py-1.5 sm:mt-3 sm:px-3 sm:py-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[7px] font-extrabold uppercase tracking-[0.16em] text-accent sm:text-[9px] sm:tracking-[0.22em]">Топ-1 highlight</div>
              <div className="mt-0.5 truncate text-xs font-bold text-slate-300 sm:mt-1 sm:text-sm">{player.highlight_title || "Найкращий момент останнього турніру"}</div>
            </div>
            <div className="hidden text-right text-[11px] leading-5 text-slate-500 sm:block">
              <span>{player.highlight_tournament || "LDUFK League"}</span>
              <span className="mx-2 text-slate-700">/</span>
              <span>{player.highlight_map || "TBA"}</span>
              <span className="mx-2 text-slate-700">/</span>
              <span>{player.highlight_date || "TBA"}</span>
            </div>
          </div>
          {player.highlight_description ? <p className="mt-2 hidden text-xs leading-5 text-slate-500 sm:block">{player.highlight_description}</p> : null}
        </div>
      </div>
    </div>
  );
}

function LeagueFeature({ label, tone, children }: { label: string; tone: "school" | "university"; children: React.ReactNode }) {
  return (
    <div className="soft-enter">
      <div className={`mb-2 text-[10px] font-extrabold uppercase tracking-[0.2em] ${tone === "school" ? "text-school" : "text-accent"}`}>{label}</div>
      {children}
    </div>
  );
}

function SchoolRanking({ teams }: { teams: Team[] }) {
  return (
    <Panel
      eyebrow="School Ranking"
      title="Топ шкіл"
      action={<Link className="focus-ring whitespace-nowrap rounded-md border border-line px-2 py-1 text-[10px] font-bold text-slate-300 transition hover:border-school/40 hover:bg-school/10 hover:text-school sm:rounded-lg sm:px-3 sm:py-2 sm:text-sm" href="/ranking?division=School">Весь топ</Link>}
    >
      <div className="grid gap-2">{teams.map((team, index) => <TeamRow key={team.id} team={team} index={index} />)}</div>
    </Panel>
  );
}

function UniversityRanking({ teams }: { teams: Team[] }) {
  return (
    <Panel
      eyebrow="University Ranking"
      title="Топ університетів"
      action={<Link className="focus-ring whitespace-nowrap rounded-md border border-line px-2 py-1 text-[10px] font-bold text-slate-300 transition hover:border-accent/40 hover:bg-accent/10 hover:text-accent sm:rounded-lg sm:px-3 sm:py-2 sm:text-sm" href="/ranking?division=University">Весь топ</Link>}
    >
      <div className="grid gap-2">{teams.map((team, index) => <TeamRow key={team.id} team={team} index={index} />)}</div>
    </Panel>
  );
}
