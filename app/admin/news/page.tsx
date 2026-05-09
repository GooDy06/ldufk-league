import { AdminNav, Field, inputClass } from "@/components/admin";
import { SubmitButton } from "@/components/submit-button";
import { deleteNews, saveNews } from "@/lib/admin-actions";
import { requireAdmin } from "@/lib/supabase/server";
import type { NewsItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminNewsPage({ searchParams }: { searchParams: { saved?: string; deleted?: string } }) {
  const { supabase, role, user } = await requireAdmin();
  const { data } = await supabase.from("news").select("*").order("created_at", { ascending: false });
  const items = (data || []) as NewsItem[];

  return (
    <div className="py-8">
      <AdminNav role={role} />
      <h1 className="mb-4 font-rajdhani text-4xl font-bold">News CRUD</h1>
      {searchParams.saved ? <StatusMessage text="Пост збережено." /> : null}
      {searchParams.deleted ? <StatusMessage text="Пост видалено." /> : null}
      <NewsForm />
      <div className="mt-6 grid gap-4">{items.map((item) => <NewsForm key={item.id} item={item} role={role} userId={user?.id} />)}</div>
    </div>
  );
}

function StatusMessage({ text }: { text: string }) {
  return <div className="mb-4 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm font-bold text-emerald-200">{text}</div>;
}

function dateTimeLocalValue(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function NewsForm({ item, role, userId }: { item?: NewsItem; role?: string | null; userId?: string }) {
  const canDelete = role === "main_admin" || role === "admin" || (role === "reporter" && item?.created_by === userId);

  return (
    <form action={saveNews} className="grid gap-3 rounded-2xl border border-line bg-surface p-4">
      <input type="hidden" name="id" defaultValue={item?.id} />
      <div className="grid gap-3 md:grid-cols-3">
        <Field label="Title"><input className={inputClass} name="title" defaultValue={item?.title} required /></Field>
        <Field label="Slug"><input className={inputClass} name="slug" defaultValue={item?.slug} required /></Field>
        <Field label="Tag"><input className={inputClass} name="tag" defaultValue={item?.tag || "ann"} /></Field>
        <Field label="Image URL"><input className={inputClass} name="image_url" defaultValue={item?.image_url || ""} /></Field>
        <Field label="Post date"><input className={inputClass} name="published_at" type="datetime-local" defaultValue={dateTimeLocalValue(item?.published_at || item?.created_at || null)} /></Field>
        <Field label="Published"><input name="published" type="checkbox" defaultChecked={item?.published} className="h-5 w-5" /></Field>
      </div>
      <Field label="Excerpt"><textarea className={inputClass} name="excerpt" defaultValue={item?.excerpt || ""} /></Field>
      <Field label="Body">
        <textarea
          className={inputClass}
          name="body"
          defaultValue={item?.body || ""}
          rows={8}
          placeholder={"Текст новини...\n\nПосилання автоматично стане клікабельним: https://example.com\nГіперсилка: [реєстрація](https://example.com)\nФото в описі: ![назва фото](https://example.com/image.jpg)"}
        />
      </Field>
      <SubmitButton pendingText={item ? "Зберігаю..." : "Створюю..."} className="w-fit rounded-lg bg-accent px-4 py-2 font-bold text-bg">
        {item ? "Зберегти" : "Створити"}
      </SubmitButton>
      {item && canDelete ? (
        <SubmitButton formAction={deleteNews} name="id" value={item.id} pendingText="Видаляю..." className="w-fit rounded-lg border border-red-500/30 px-3 py-2 text-sm font-bold text-red-300">
          Видалити
        </SubmitButton>
      ) : null}
    </form>
  );
}
