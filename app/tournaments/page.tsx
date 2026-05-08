import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Tournament } from "@/lib/types";

export const dynamic = "force-dynamic";

function statusLabel(status: Tournament["status"]) {
  if (status === "done") return "Завершено";
  if (status === "live") return "Триває";
  return "Реєстрація";
}

function displayStatus(tournament: Tournament) {
  if (tournament.status === "soon" && tournament.type === "lan") return "later";
  return tournament.status;
}

function statusClasses(status: Tournament["status"] | "later") {
  if (status === "done") return "border-slate-500/30 text-slate-300";
  if (status === "live") return "live-pulse border-red-400/40 bg-red-500/10 text-red-300";
  if (status === "later") return "border-violet-400/30 text-violet-300";
  return "border-accent/30 text-accent";
}

function statusText(status: Tournament["status"] | "later") {
  if (status === "later") return "Згодом";
  return statusLabel(status);
}

function typeLabel(type: Tournament["type"]) {
  return type === "lan" ? "LAN" : "Faceit Online";
}

export default async function TournamentsPage() {
  const supabase = createClient();
  const { data } = await supabase.from("tournaments").select("*, winner:teams(name, slug)").eq("published", true).order("division").order("created_at", { ascending: false });
  const tournaments = (data || []) as Tournament[];
  const schoolTournaments = tournaments.filter((tournament) => tournament.division === "School");
  const universityTournaments = tournaments.filter((tournament) => tournament.division === "University");
  const globalTournaments = tournaments.filter((tournament) => tournament.division === "Global");

  return (
    <div className="py-8">
      <h1 className="mb-5 font-rajdhani text-5xl font-bold">Турніри</h1>
      <TournamentGroup title="School League" tournaments={schoolTournaments} />
      <TournamentGroup title="University League" tournaments={universityTournaments} />
      {globalTournaments.length ? <TournamentGroup title="Global Championship" tournaments={globalTournaments} /> : null}
    </div>
  );
}

function TournamentGroup({ title, tournaments }: { title: string; tournaments: Tournament[] }) {
  if (!tournaments.length) return null;

  return (
    <section className="mb-6">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-accent">LDUFK Points</div>
          <h2 className="font-rajdhani text-3xl font-bold">{title}</h2>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {tournaments.map((tournament) => (
          <TournamentCard key={tournament.id} tournament={tournament} />
        ))}
      </div>
    </section>
  );
}

function TournamentCard({ tournament }: { tournament: Tournament }) {
  const visibleStatus = displayStatus(tournament);

  return (
    <Link href={`/tournaments/${tournament.slug}`} className="rounded-xl border border-line bg-surface p-3 transition hover:border-accent/40">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{tournament.division} · {typeLabel(tournament.type)}</div>
                <h3 className="mt-1 font-rajdhani text-xl font-bold leading-tight">{tournament.name}</h3>
              </div>
              <span className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-extrabold uppercase tracking-widest ${statusClasses(visibleStatus)}`}>
                {statusText(visibleStatus)}
              </span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-slate-400">
              <span>{tournament.date_label}</span>
              <span>{tournament.teams_count} команд</span>
              <span>{tournament.points || "LDUFK Points"}</span>
            </div>
            <div className="mt-2 text-xs text-slate-300">
              {tournament.status === "done" ? <>Переможець: <strong>{tournament.winner?.name || "буде визначено"}</strong></> : <>Переможець: буде визначено</>}
            </div>
    </Link>
  );
}
