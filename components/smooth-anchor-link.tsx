"use client";

import type { MouseEvent, ReactNode } from "react";

export function SmoothAnchorLink({
  href,
  className,
  children
}: {
  href: `#${string}`;
  className: string;
  children: ReactNode;
}) {
  function scrollToSection(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();

    const target = document.querySelector(href);
    if (!target) return;

    window.history.replaceState(null, "", href);
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <a href={href} className={className} onClick={scrollToSection}>
      {children}
    </a>
  );
}
