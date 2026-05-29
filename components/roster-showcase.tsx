import type { Player } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { slugifyPlayerNick } from "@/lib/school-rosters";

export const DEFAULT_PLAYER_AVATAR = "https://i.ibb.co/Ps7G5vnD/players.png";

export function RosterShowcase({ players, compact = false }: { players: Player[]; compact?: boolean }) {
  const roster = [...players].sort((a, b) => b.rating - a.rating);

  if (!roster.length) {
    return <div className={`${compact ? "rounded-lg p-2 text-xs" : "rounded-xl p-4 text-sm"} border border-line bg-surface text-slate-500`}>Roster ще не доданий.</div>;
  }

  if (compact) {
    const compactRoster = roster.slice(0, 5);

    return (
      <div className="grid gap-1 sm:gap-2" style={{ gridTemplateColumns: `repeat(${compactRoster.length}, minmax(0, 1fr))` }}>
        {compactRoster.map((player) => (
          <Link key={player.id} href={`/players/${slugifyPlayerNick(player.nick)}`} className="interactive-card group min-w-0 overflow-hidden rounded-md border border-line bg-[#202c3a] text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:rounded-lg lg:rounded-md">
            <div className="relative h-14 overflow-hidden border-b border-line bg-gradient-to-b from-[#374656] via-[#293746] to-[#172232] sm:h-[72px] lg:h-[72px] xl:h-[80px]">
              <Image
                src={player.avatar_url || DEFAULT_PLAYER_AVATAR}
                alt={player.nick}
                fill
                sizes="(max-width: 640px) 72px, (max-width: 1024px) 180px, 220px"
                className="object-contain object-bottom transition duration-300 group-hover:brightness-110 sm:scale-105 lg:scale-[1.06] lg:group-hover:scale-110"
              />
            </div>
            <div className="min-w-0 bg-[#111925] px-1 py-1 sm:px-2 sm:py-1 lg:flex lg:h-10 lg:flex-col lg:items-center lg:justify-center lg:px-1.5 lg:py-0">
              <div className="truncate font-rajdhani text-[10px] font-bold leading-none text-slate-100 sm:text-sm lg:text-[13px]">{player.nick}</div>
              <div className="mt-0.5 flex items-center justify-center gap-1 font-rajdhani text-[9px] font-semibold leading-none text-accent sm:text-xs lg:text-[11px]">
                <span className="hidden text-[7px] uppercase tracking-wider text-slate-500 lg:inline">Rating</span>
                {Number(player.rating || 0).toFixed(2)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {roster.map((player) => (
        <Link key={player.id} href={`/players/${slugifyPlayerNick(player.nick)}`} className="interactive-card group overflow-hidden rounded-lg border border-line bg-surface text-center">
          <div className="relative aspect-[16/9] border-b border-line bg-gradient-to-b from-[#263545] to-[#111b29] sm:aspect-[16/10]">
            <Image
              src={player.avatar_url || DEFAULT_PLAYER_AVATAR}
              alt={player.nick}
              fill
              sizes="(max-width: 640px) 42vw, (max-width: 1024px) 28vw, 180px"
              className="object-contain object-bottom transition group-hover:brightness-110"
            />
          </div>
          <div className="px-2 py-1.5 sm:py-2">
            <div className="truncate font-rajdhani text-sm font-bold leading-none sm:text-base">{player.nick}</div>
            <div className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500">{player.role}</div>
            <div className="font-rajdhani text-xs font-semibold text-slate-400 sm:text-sm">Rating 3.0 - {Number(player.rating || 0).toFixed(2)}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
