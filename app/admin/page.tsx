import Link from "next/link";
import { adminLinks, canUseAdminLink, roleLabels } from "@/components/admin";
import { requireAdmin } from "@/lib/supabase/server";
import { signIn, signOut } from "@/lib/admin-actions";

export const dynamic = "force-dynamic";

const sectionDescriptions: Record<string, string> = {
  "/admin/homepage": "Переможці, блоки головної сторінки та важливі промо-матеріали.",
  "/admin/teams": "Команди, навчальні заклади, логотипи, очки та публікація.",
  "/admin/news": "Новини, анонси, картинки, дата публікації та чернетки.",
  "/admin/tournaments": "Турніри, формат, учасники, переможці та відображення на сайті.",
  "/admin/players": "Гравці, склади команд, аватарки, соцмережі та хайлайти.",
  "/admin/veto": "Окремий інструмент для veto-сесій і трансляцій.",
  "/cams/admin": "Керування кімнатами, посиланнями гравців і live-статусом камер.",
  "/admin/admins": "Додавання адмінів, зміна ролей і швидка перевірка доступів."
};

export default async function AdminPage({ searchParams }: { searchParams: { error?: string } }) {
  const { user, email, role } = await requireAdmin();

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
      <div className="grid gap-5">
        <section className="rounded-2xl border border-line bg-surface p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-accent">Адмін-панель LDUFK</p>
              <h1 className="mt-1 font-rajdhani text-3xl font-bold">Доступні розділи</h1>
            </div>
            <div className="rounded-xl border border-line bg-surface2 px-3 py-2 text-sm text-slate-300 md:min-w-[260px]">
              <div className="truncate font-bold text-white">{user.email}</div>
              {role ? <div className="mt-0.5 text-xs font-bold text-accent">{roleLabels[role]}</div> : null}
            </div>
          </div>
        </section>

        <section className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {adminLinks.filter((link) => link.href !== "/admin" && canUseAdminLink(link, role)).map((link) => (
            <Link key={link.href} href={link.href} className="min-h-[104px] rounded-lg border border-line bg-surface p-3 transition hover:border-accent/45 hover:bg-surface2">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-rajdhani text-xl font-bold leading-none">{link.label}</h2>
                <span className="rounded-full border border-line bg-surface2 px-2 py-0.5 text-[10px] font-bold text-slate-400">Відкрити</span>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-400">{sectionDescriptions[link.href]}</p>
            </Link>
          ))}
        </section>

        <form action={signOut} className="mt-5">
          <button className="rounded-lg border border-line px-4 py-2 text-sm font-bold text-slate-300 hover:text-accent">Вийти</button>
        </form>
      </div>
    </div>
  );
}
