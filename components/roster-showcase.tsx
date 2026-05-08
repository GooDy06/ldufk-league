import type { Player } from "@/lib/types";

export const DEFAULT_PLAYER_AVATAR = "https://i.ibb.co/Ps7G5vnD/players.png";

export function RosterShowcase({ players }: { players: Player[] }) {
  const roster = [...players].sort((a, b) => b.rating - a.rating);

  if (!roster.length) {
    return <div className="rounded-xl border border-line bg-surface p-4 text-sm text-slate-500">Roster ще не доданий.</div>;
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
      {roster.map((player) => (
        <article key={player.id} className="group overflow-hidden rounded-lg border border-line bg-surface text-center transition hover:border-accent/35">
          <div className="aspect-[16/9] border-b border-line bg-gradient-to-b from-[#263545] to-[#111b29]">
            <img
              src={player.avatar_url || DEFAULT_PLAYER_AVATAR}
              alt={player.nick}
              className="h-full w-full object-contain object-bottom transition group-hover:brightness-110"
            />
          </div>
          <div className="px-2 py-1.5">
            <div className="font-rajdhani text-base font-bold leading-none">{player.nick}</div>
            <div className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500">{player.role}</div>
            <div className="font-rajdhani text-sm font-semibold text-slate-400">Rating 3.0 - {player.rating}</div>
          </div>
        </article>
      ))}
    </div>
  );
}
