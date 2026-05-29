import Link from "next/link";
import { circuitLeagues } from "@/lib/circuit-tournaments";
import { getOwnRecentMatches, groupMatchesIntoSeries } from "@/lib/lotgaming";
import { SiteNav } from "@/components/site-nav";

async function getHeaderBadges() {
  const hasRegistration = circuitLeagues.some((league) => league.tournaments.some((tournament) => tournament.status === "Реєстрація"));

  try {
    const matches = await getOwnRecentMatches(80);
    const hasLiveMatch = groupMatchesIntoSeries(matches).some((series) => series.status === "live");

    return { hasLiveMatch, hasRegistration };
  } catch {
    return { hasLiveMatch: false, hasRegistration };
  }
}

export async function SiteHeader() {
  const { hasLiveMatch, hasRegistration } = await getHeaderBadges();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-20 max-w-6xl flex-wrap items-center justify-between gap-3 px-3 py-2 sm:px-4 sm:py-3">
        <Link href="/" className="flex items-center gap-0">
          <img src="/assets/logo.png" alt="LDUFK League" className="h-12 w-12 rounded-lg object-contain sm:h-[75px] sm:w-[75px]" />
          <div className="-ml-1">
            <div className="font-rajdhani text-base font-bold tracking-wider sm:text-xl">LDUFK LEAGUE</div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-slate-500 sm:text-[10px] sm:tracking-[0.24em]">CS2 · Season 2026</div>
          </div>
        </Link>
        <SiteNav hasLiveMatch={hasLiveMatch} hasRegistration={hasRegistration} />
      </div>
    </header>
  );
}
