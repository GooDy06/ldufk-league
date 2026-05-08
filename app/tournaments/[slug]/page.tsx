import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Tournament } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TournamentDetailPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data } = await supabase.from("tournaments").select("*, winner:teams(name, slug)").eq("slug", params.slug).eq("published", true).single();
  if (!data) notFound();
  const tournament = data as Tournament;

  return (
    <article className="mx-auto max-w-4xl py-8">
      <div className="mb-4 h-72 rounded-2xl border border-line bg-cover bg-center" style={{ backgroundImage: `url(${tournament.banner_url || "/assets/winners-hero.png"})` }} />
      <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-accent">{tournament.division} · {tournament.type}</div>
      <h1 className="mt-2 font-rajdhani text-5xl font-bold">{tournament.name}</h1>
      <p className="mt-4 text-lg leading-8 text-slate-300">{tournament.description}</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <Info label="Дата" value={tournament.date_label} />
        <Info label="Статус" value={tournament.status} />
        <Info label="Переможець" value={tournament.winner?.name || "Буде визначено"} />
        <Info label="Формат" value={tournament.format || "TBA"} />
        <Info label="Очки" value={tournament.points || "TBA"} />
        <Info label="Приз" value={tournament.prize || "TBA"} />
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {tournament.participants.map((participant) => (
          <span key={participant} className="rounded-full border border-line bg-surface2 px-3 py-1 text-sm text-slate-300">{participant}</span>
        ))}
      </div>
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <span className="block text-[10px] uppercase tracking-widest text-slate-500">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
