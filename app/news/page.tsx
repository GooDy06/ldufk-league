import { createClient } from "@/lib/supabase/server";
import type { NewsItem } from "@/lib/types";
import { NewsCard } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const supabase = createClient();
  const { data } = await supabase.from("news").select("*").eq("published", true).order("published_at", { ascending: false, nullsFirst: false }).limit(20);
  const news = (data || []) as NewsItem[];

  return (
    <div className="py-8">
      <h1 className="mb-5 font-rajdhani text-5xl font-bold">Новини</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{news.map((item) => <NewsCard key={item.id} item={item} />)}</div>
    </div>
  );
}
