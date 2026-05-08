import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { NewsItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function NewsDetailPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data } = await supabase.from("news").select("*").eq("slug", params.slug).eq("published", true).single();
  if (!data) notFound();
  const item = data as NewsItem;

  return (
    <article className="mx-auto max-w-3xl py-8">
      <div className="mb-4 h-64 rounded-2xl border border-line bg-cover bg-center" style={{ backgroundImage: `url(${item.image_url || "/assets/winners-hero.png"})` }} />
      <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-accent">{item.tag}</div>
      <h1 className="mt-2 font-rajdhani text-5xl font-bold leading-tight">{item.title}</h1>
      <p className="mt-4 text-lg leading-8 text-slate-300">{item.body}</p>
    </article>
  );
}
