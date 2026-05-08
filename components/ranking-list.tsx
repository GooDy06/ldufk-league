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
            <button type="button" onClick={() => toggleTeam(team.id)} className="grid w-full grid-cols-[42px_42px_1fr_auto] items-center gap-3 p-3 text-left md:grid-cols-[52px_46px_1fr_auto_auto]">
              <div className={`font-rajdhani text-2xl font-bold ${rankColor(index)}`}>#{index + 1}</div>
              <div
                className="grid h-10 w-10 place-items-center overflow-hidden rounded-lg border border-white/10 bg-cover bg-center text-xs font-bold"
                style={team.logo_url ? { backgroundImage: `url(${team.logo_url})` } : { background: `${team.color}22`, color: team.color }}
              >
                {team.logo_url ? null : team.name.split(/\s+/).map((word) => word[0]).join("").slice(0, 3)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-rajdhani text-xl font-bold leading-none">{team.name}</h3>
                  {index < 4 ? <span className="rounded-full border border-gold/30 bg-gold/10 px-2 py-1 text-[10px] font-extrabold uppercase tracking-widest text-gold">LAN Invite</span> : null}
                  {index === 0 ? <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-[10px] font-extrabold uppercase tracking-widest text-emerald-300">Champion Form</span> : null}
                </div>
                <div className="mt-0.5 text-xs text-slate-500">{team.org}</div>
              </div>
              <div className={`hidden text-sm font-bold md:block ${team.trend > 0 ? "text-emerald-300" : team.trend < 0 ? "text-red-300" : "text-slate-500"}`}>{trendLabel}</div>
              <div className="text-right">
                <div className="font-rajdhani text-xl font-bold">{team.points}</div>
                <div className="text-[10px] uppercase tracking-widest text-slate-500">points</div>
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
