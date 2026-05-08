import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Tournament } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TournamentsPage() {
  const supabase = createClient();
  const { data } = await supabase.from("tournaments").select("*, winner:teams(name, slug)").eq("published", true).order("created_at", { ascending: false });
  const tournaments = (data || []) as Tournament[];

  return (
    <div className="py-8">
      <h1 className="mb-5 font-rajdhani text-5xl font-bold">Турніри</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {tournaments.map((tournament) => (
          <Link key={tournament.id} href={`/tournaments/${tournament.slug}`} className="rounded-2xl border border-line bg-surface p-4 transition hover:border-accent/40">
            <div className="mb-3 h-32 rounded-xl bg-cover bg-center" style={{ backgroundImage: `url(${tournament.banner_url || "/assets/winners-hero.png"})` }} />
            <div className="text-[10px] font-bold uppercase tracking-widest text-accent">{tournament.division} · {tournament.type}</div>
            <h2 className="mt-1 font-rajdhani text-2xl font-bold">{tournament.name}</h2>
            <p className="mt-2 text-sm text-slate-400">{tournament.date_label} · {tournament.teams_count} команд · {tournament.status}</p>
            <p className="mt-2 text-sm text-slate-300">Переможець: <strong>{tournament.winner?.name || "буде визначено"}</strong></p>
          </Link>
        ))}
      </div>
    </div>
  );
}
