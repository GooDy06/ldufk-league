import { AdminNav, Field, inputClass } from "@/components/admin";
import { SubmitButton } from "@/components/submit-button";
import { deleteNews, saveNews } from "@/lib/admin-actions";
import { requireAdmin } from "@/lib/supabase/server";
import type { NewsItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminNewsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("news").select("*").order("created_at", { ascending: false });
  const items = (data || []) as NewsItem[];

  return (
    <div className="py-8">
      <AdminNav />
      <h1 className="mb-4 font-rajdhani text-4xl font-bold">News CRUD</h1>
      <NewsForm />
      <div className="mt-6 grid gap-4">{items.map((item) => <NewsForm key={item.id} item={item} />)}</div>
    </div>
  );
}

function NewsForm({ item }: { item?: NewsItem }) {
  return (
    <form action={saveNews} className="grid gap-3 rounded-2xl border border-line bg-surface p-4">
      <input type="hidden" name="id" defaultValue={item?.id} />
      <div className="grid gap-3 md:grid-cols-3">
        <Field label="Title"><input className={inputClass} name="title" defaultValue={item?.title} required /></Field>
        <Field label="Slug"><input className={inputClass} name="slug" defaultValue={item?.slug} required /></Field>
        <Field label="Tag"><input className={inputClass} name="tag" defaultValue={item?.tag || "ann"} /></Field>
        <Field label="Image URL"><input className={inputClass} name="image_url" defaultValue={item?.image_url || ""} /></Field>
        <Field label="Published"><input name="published" type="checkbox" defaultChecked={item?.published} className="h-5 w-5" /></Field>
      </div>
      <Field label="Excerpt"><textarea className={inputClass} name="excerpt" defaultValue={item?.excerpt || ""} /></Field>
      <Field label="Body"><textarea className={inputClass} name="body" defaultValue={item?.body || ""} rows={6} /></Field>
      <SubmitButton pendingText={item ? "Зберігаю..." : "Створюю..."} className="w-fit rounded-lg bg-accent px-4 py-2 font-bold text-bg">
        {item ? "Зберегти" : "Створити"}
      </SubmitButton>
      {item ? (
        <SubmitButton formAction={deleteNews} name="id" value={item.id} pendingText="Видаляю..." className="w-fit rounded-lg border border-red-500/30 px-3 py-2 text-sm font-bold text-red-300">
          Видалити
        </SubmitButton>
      ) : null}
    </form>
  );
}
