"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  ["Головна", "/"],
  ["Рейтинг", "/ranking"],
  ["Турніри", "/tournaments"],
  ["Матчі", "/matches"],
  ["Новини", "/news"]
] as const;

export function SiteNav({ hasLiveMatch, hasRegistration }: { hasLiveMatch: boolean; hasRegistration: boolean }) {
  const pathname = usePathname() || "/";

  return (
    <nav className="flex w-full flex-wrap gap-1.5 sm:w-auto sm:gap-2">
      {links.map(([label, href]) => {
        const isActive = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={`relative rounded-md border px-2 py-1.5 text-xs font-semibold transition sm:px-3 sm:py-2 sm:text-sm ${
              isActive
                ? "border-accent/35 bg-accent/10 text-accent shadow-[0_0_18px_rgba(0,213,255,0.08)]"
                : "border-transparent text-slate-400 hover:border-accent/20 hover:bg-accent/10 hover:text-accent"
            }`}
          >
            {label}
            {href === "/matches" && hasLiveMatch ? (
              <span aria-hidden="true" className="live-pulse absolute -right-1 -top-2 rounded-full border border-red-300/40 bg-red-500 px-1.5 py-0.5 text-[8px] font-extrabold uppercase leading-none tracking-[0.08em] text-white shadow-[0_0_16px_rgba(248,113,113,0.35)]">
                Live
              </span>
            ) : null}
            {href === "/tournaments" && hasRegistration ? (
              <span aria-hidden="true" className="pointer-events-none absolute -right-2 -top-2 inline-flex items-center gap-1 text-[6px] font-extrabold uppercase leading-none tracking-[0.06em] text-school sm:-right-3 sm:text-[7px]">
                <span className="h-1.5 w-1.5 rounded-full bg-school shadow-[0_0_9px_rgba(110,231,183,0.85)]" />
                Реєстрація
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
