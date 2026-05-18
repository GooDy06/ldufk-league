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
    <div className="grid gap-3">
      {teams.map((team, index) => {
        const isOpen = openIds.includes(team.id);
        const trendLabel = team.trend > 0 ? `+${team.trend}` : String(team.trend);

        return (
          <article key={team.id} className={`overflow-hidden rounded-2xl border bg-surface2 transition ${isOpen ? "border-accent/45 shadow-[0_0_30px_rgba(0,213,255,0.08)]" : "border-line hover:border-accent/25"}`}>
            <button type="button" onClick={() => toggleTeam(team.id)} className="grid w-full grid-cols-[42px_40px_minmax(0,1fr)_auto] items-center gap-2 p-3 text-left sm:grid-cols-[52px_46px_minmax(0,1fr)_auto_auto] sm:gap-3">
              <div className={`font-rajdhani text-xl font-bold sm:text-2xl ${rankColor(index)}`}>#{index + 1}</div>
              <div
                className="grid h-9 w-9 place-items-center overflow-hidden rounded-lg border border-white/10 bg-cover bg-center text-xs font-bold sm:h-10 sm:w-10"
                style={team.logo_url ? { backgroundImage: `url(${team.logo_url})` } : { background: `${team.color}22`, color: team.color }}
              >
                {team.logo_url ? null : team.name.split(/\s+/).map((word) => word[0]).join("").slice(0, 3)}
              </div>
              <div className="min-w-0">
                <div className="flex min-w-0 flex-wrap items-center gap-1.5 sm:gap-2">
                  <h3 className="truncate font-rajdhani text-lg font-bold leading-none sm:text-xl">{team.name}</h3>
                  {index < 4 ? <span className="rounded-full border border-gold/30 bg-gold/10 px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-widest text-gold sm:px-2 sm:py-1 sm:text-[10px]">LAN Invite</span> : null}
                  {index === 0 ? <span className="hidden rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-[10px] font-extrabold uppercase tracking-widest text-emerald-300 sm:inline-flex">Champion Form</span> : null}
                </div>
                <div className="mt-0.5 truncate text-[11px] text-slate-500 sm:text-xs">{team.org}</div>
              </div>
              <div className={`hidden text-sm font-bold sm:block ${team.trend > 0 ? "text-emerald-300" : team.trend < 0 ? "text-red-300" : "text-slate-500"}`}>{team.trend === 0 ? "" : trendLabel}</div>
              <div className="text-right">
                <div className="font-rajdhani text-lg font-bold sm:text-xl">{team.points}</div>
                <div className="text-[8px] uppercase tracking-widest text-slate-500 sm:text-[10px]">points</div>
              </div>
            </button>

            {isOpen ? (
              <div className="border-t border-line bg-bg/20 p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">Roster</div>
                  <Link href={`/teams/${team.slug}`} className="text-sm font-bold text-accent hover:text-white">Профіль команди</Link>
                </div>
                <RosterShowcase players={team.players || []} />
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
