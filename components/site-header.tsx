import Link from "next/link";

const links = [
  ["Загальна", "/"],
  ["Рейтинг", "/ranking"],
  ["Матчі", "/matches"],
  ["Турніри", "/tournaments"],
  ["Новини", "/news"]
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-20 max-w-6xl flex-wrap items-center justify-between gap-3 px-3 py-2 sm:px-4 sm:py-3">
        <Link href="/" className="flex items-center gap-0">
          <img src="/assets/logo.png" alt="LDUFK League" className="h-12 w-12 rounded-lg object-contain sm:h-[75px] sm:w-[75px]" />
          <div className="-ml-1">
            <div className="font-rajdhani text-base font-bold tracking-wider sm:text-xl">LDUFK LEAGUE</div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-slate-500 sm:text-[10px] sm:tracking-[0.24em]">CS2 · Season 2026</div>
          </div>
        </Link>
        <nav className="flex w-full flex-wrap gap-1.5 sm:w-auto sm:gap-2">
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="rounded-md border border-transparent px-2 py-1.5 text-xs font-semibold text-slate-400 transition hover:border-accent/20 hover:bg-accent/10 hover:text-accent sm:px-3 sm:py-2 sm:text-sm"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
