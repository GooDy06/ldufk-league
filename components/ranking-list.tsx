"use client";

import { useState } from "react";
import Link from "next/link";
import type { Player, Team } from "@/lib/types";
import { RosterShowcase } from "@/components/roster-showcase";

type RankingTeam = Team & { players?: Player[] };

function rankColor(index: number) {
  if (index === 0) return "text-gold";
  if (index === 1) return "text-slate-300";
  if (index === 2) return "text-amber-700";
  return "text-slate-500";
}

export function RankingList({ teams }: { teams: RankingTeam[] }) {
  const [openIds, setOpenIds] = useState<string[]>(teams[0]?.id ? [teams[0].id] : []);

  function toggleTeam(teamId: string) {
    setOpenIds((current) => (current.includes(teamId) ? current.filter((id) => id !== teamId) : [...current, teamId]));
  }

  return (
    <div className="grid gap-1.5 sm:gap-1">
      {teams.map((team, index) => {
        const isOpen = openIds.includes(team.id);
        const trendLabel = team.trend > 0 ? `+${team.trend}` : String(team.trend);
        const rosterLine = team.players?.length ? team.players.slice(0, 5).map((player) => player.nick).join(" · ") : team.org;

        return (
          <article key={team.id} className={`interactive-card soft-enter overflow-hidden rounded-md border bg-surface2 sm:rounded-lg ${isOpen ? "border-line sm:border-accent/45 sm:shadow-[0_0_24px_rgba(0,213,255,0.07)]" : "border-line"}`}>
            <button type="button" onClick={() => toggleTeam(team.id)} aria-expanded={isOpen} className="grid min-h-[48px] w-full grid-cols-[31px_28px_minmax(0,1fr)_52px] items-center gap-1.5 p-1.5 text-left sm:min-h-[42px] sm:grid-cols-[40px_32px_minmax(0,1fr)_auto_auto] sm:gap-2 sm:px-1.5 sm:py-1">
              <div className={`font-rajdhani text-base font-bold leading-none sm:text-xl ${rankColor(index)}`}>#{index + 1}</div>
              <div
                className="grid h-7 w-7 place-items-center overflow-hidden rounded-md border border-white/10 bg-cover bg-center text-[8px] font-bold sm:h-7 sm:w-7 sm:rounded-md sm:text-[10px]"
                style={team.logo_url ? { backgroundImage: `url(${team.logo_url})` } : { background: `${team.color}22`, color: team.color }}
              >
                {team.logo_url ? null : team.name.split(/\s+/).map((word) => word[0]).join("").slice(0, 3)}
              </div>
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-1.5 sm:flex-wrap sm:gap-2">
                  <h3 className="min-w-0 truncate font-rajdhani text-base font-bold leading-none sm:text-lg">{team.name}</h3>
                </div>
                <div className="mt-0.5 truncate text-[9px] leading-none text-slate-500 sm:text-[11px]">{rosterLine}</div>
              </div>
              <div className={`hidden text-xs font-bold sm:block ${team.trend > 0 ? "text-emerald-300" : team.trend < 0 ? "text-red-300" : "text-slate-500"}`}>{team.trend === 0 ? "" : trendLabel}</div>
              <div className="text-right">
                <div className="font-rajdhani text-base font-bold leading-none sm:text-lg">{team.points}</div>
                <div className="text-[7px] uppercase leading-none tracking-[0.12em] text-slate-500 sm:text-[10px] sm:tracking-widest">points</div>
              </div>
            </button>

            {isOpen ? (
              <div className="border-t border-line bg-bg/20 p-1.5 sm:p-2">
                <RosterShowcase players={team.players || []} compact />
                <Link href={`/teams/${team.slug}`} className="mt-1.5 block rounded-md border border-line bg-surface/70 px-2 py-1.5 text-center text-[10px] font-bold text-accent transition hover:border-accent/50 hover:text-white sm:hidden">
                  Профіль команди
                </Link>
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
