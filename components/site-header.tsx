import Link from "next/link";

const links = [
  ["Загальна", "/"],
  ["Рейтинг", "/ranking"],
  ["Турніри", "/tournaments"],
  ["Новини", "/news"]
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-20 max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-0">
          <img src="/assets/logo.png" alt="LDUFK League" className="h-[75px] w-[75px] rounded-lg object-contain" />
          <div className="-ml-1">
            <div className="font-rajdhani text-xl font-bold tracking-wider">LDUFK LEAGUE</div>
            <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">CS2 · Season 2026</div>
          </div>
        </Link>
        <nav className="flex flex-wrap gap-2">
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="rounded-md border border-transparent px-3 py-2 text-sm font-semibold text-slate-400 transition hover:border-accent/20 hover:bg-accent/10 hover:text-accent"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
