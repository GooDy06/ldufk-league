import Link from "next/link";
import type { AdminRole } from "@/lib/types";

type AdminLink = {
  label: string;
  href: string;
  roles?: AdminRole[];
};

export const roleLabels: Record<AdminRole, string> = {
  main_admin: "Головний адмін",
  admin: "Адмін",
  moderator: "Модератор",
  reporter: "Репортер"
};

export const roleDescriptions: Record<AdminRole, string> = {
  main_admin: "Повний доступ: сайт, контент, команди, турніри, гравці, камери та адміни.",
  admin: "Може редагувати головну, команди, новини, турніри, гравців і камери.",
  moderator: "Для простих правок команд і гравців без доступу до турнірів та адмінів.",
  reporter: "Для новин: створення, редагування та публікація матеріалів."
};

export const adminLinks: AdminLink[] = [
  { label: "Панель", href: "/admin" },
  { label: "Головна", href: "/admin/homepage", roles: ["main_admin", "admin"] },
  { label: "Команди", href: "/admin/teams", roles: ["main_admin", "admin", "moderator"] },
  { label: "Новини", href: "/admin/news", roles: ["main_admin", "admin", "reporter"] },
  { label: "Турніри", href: "/admin/tournaments", roles: ["main_admin", "admin"] },
  { label: "Гравці", href: "/admin/players", roles: ["main_admin", "admin", "moderator"] },
  { label: "Камери", href: "/cams/admin", roles: ["main_admin", "admin"] },
  { label: "Veto", href: "/admin/veto" },
  { label: "Адміни", href: "/admin/admins", roles: ["main_admin"] }
];

export function canUseAdminLink(link: AdminLink, role?: AdminRole | null) {
  return !link.roles || (role ? link.roles.includes(role) : false);
}

export function AdminNav({ role }: { role?: AdminRole | null }) {
  const links = adminLinks.filter((link) => link.href !== "/admin" && canUseAdminLink(link, role));

  return (
    <nav className="mb-5 flex flex-wrap gap-2" aria-label="Адмін навігація">
      <Link href="/admin" className="rounded-lg border border-line bg-surface px-3 py-2 text-sm font-bold text-slate-300 transition hover:border-accent/40 hover:text-accent">
        Назад
      </Link>
      {links.map(({ label, href }) => (
        <Link key={href} href={href} className="rounded-lg border border-line bg-surface px-3 py-2 text-sm font-bold text-slate-300 transition hover:border-accent/40 hover:text-accent">
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-slate-300">
      <span>{label}</span>
      {children}
    </label>
  );
}

export const inputClass = "rounded-lg border border-line bg-surface2 px-3 py-2 text-sm text-white outline-none focus:border-accent";
