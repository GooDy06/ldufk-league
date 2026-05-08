import Link from "next/link";
import { AdminNav } from "@/components/admin";
import { requireAdmin } from "@/lib/supabase/server";
import { signIn, signOut } from "@/lib/admin-actions";

export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: { searchParams: { error?: string } }) {
  const { user, email } = await requireAdmin();

  if (!user) {
    return (
      <div className="mx-auto max-w-md py-12">
        <h1 className="font-rajdhani text-4xl font-bold">Admin login</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Доступ дозволений тільки для email з <code>ADMIN_EMAIL</code>. Поточний email: {email || "не залогінено"}.
        </p>
        {searchParams.error === "credentials" ? (
          <p className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">
            Не вдалося увійти. Перевір email і пароль.
          </p>
        ) : null}
        {searchParams.error === "email" ? (
          <p className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">
            Вхід виконано, але цей email не має доступу до адмінки.
          </p>
        ) : null}
        <form action={signIn} className="mt-5 grid gap-3 rounded-2xl border border-line bg-surface p-4">
          <input name="email" type="email" placeholder="admin@email.com" required className="rounded-lg border border-line bg-surface2 px-3 py-2 outline-none focus:border-accent" />
          <input name="password" type="password" placeholder="password" required className="rounded-lg border border-line bg-surface2 px-3 py-2 outline-none focus:border-accent" />
          <button className="rounded-lg bg-accent px-4 py-2 font-bold text-bg">Увійти</button>
        </form>
      </div>
    );
  }

  return (
    <div className="py-8">
      <AdminNav />
      <div className="rounded-2xl border border-line bg-surface p-5">
        <h1 className="font-rajdhani text-4xl font-bold">Admin dashboard</h1>
        <p className="mt-2 text-slate-400">Увійшов як {user.email}</p>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <Link href="/admin/teams" className="rounded-xl border border-line bg-surface2 p-4 font-bold hover:text-accent">Teams</Link>
          <Link href="/admin/news" className="rounded-xl border border-line bg-surface2 p-4 font-bold hover:text-accent">News</Link>
          <Link href="/admin/tournaments" className="rounded-xl border border-line bg-surface2 p-4 font-bold hover:text-accent">Tournaments</Link>
          <Link href="/admin/players" className="rounded-xl border border-line bg-surface2 p-4 font-bold hover:text-accent">Players</Link>
        </div>
        <form action={signOut} className="mt-5">
          <button className="rounded-lg border border-line px-4 py-2 text-sm font-bold text-slate-300 hover:text-accent">Вийти</button>
        </form>
      </div>
    </div>
  );
}
