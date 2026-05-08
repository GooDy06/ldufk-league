import Link from "next/link";
import type { AdminRole } from "@/lib/types";

export function AdminNav({ role }: { role?: AdminRole | null }) {
  const links = [["Dashboard", "/admin"]];

  if (role === "main_admin" || role === "admin") {
    links.push(["Homepage", "/admin/homepage"], ["Teams", "/admin/teams"], ["News", "/admin/news"], ["Tournaments", "/admin/tournaments"], ["Players", "/admin/players"]);
  }

  if (role === "moderator") {
    links.push(["Teams", "/admin/teams"], ["Players", "/admin/players"]);
  }

  if (role === "reporter") {
    links.push(["News", "/admin/news"]);
  }

  if (role === "main_admin") {
    links.push(["Admins", "/admin/admins"]);
  }

  return (
    <nav className="mb-5 flex flex-wrap gap-2">
      {links.map(([label, href]) => (
        <Link key={href} href={href} className="rounded-lg border border-line bg-surface px-3 py-2 text-sm font-bold text-slate-300 hover:text-accent">
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
