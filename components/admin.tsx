import Link from "next/link";

export function AdminNav() {
  const links = [
    ["Dashboard", "/admin"],
    ["Teams", "/admin/teams"],
    ["News", "/admin/news"],
    ["Tournaments", "/admin/tournaments"],
    ["Players", "/admin/players"]
  ];

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
