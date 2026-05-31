"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export function PageScrollControls() {
  const [isLongPage, setIsLongPage] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    function update() {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setIsLongPage(maxScroll > 420);
      setIsAtTop(window.scrollY < 2);
      setIsAtBottom(maxScroll - window.scrollY < 2);
    }

    update();
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(document.body);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  if (!isLongPage) return null;

  return (
    <div className="fixed bottom-4 right-3 z-40 grid gap-1.5 sm:bottom-6 sm:right-5 sm:gap-2">
      <button
        type="button"
        aria-label="Прокрутити на початок сторінки"
        disabled={isAtTop}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="focus-ring grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-slate-900/80 text-slate-200 shadow-[0_8px_24px_rgba(0,0,0,0.28)] backdrop-blur-md transition hover:border-accent/45 hover:bg-slate-800 hover:text-accent disabled:pointer-events-none disabled:opacity-25 sm:h-11 sm:w-11"
      >
        <ChevronUp className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.4} />
      </button>
      <button
        type="button"
        aria-label="Прокрутити в кінець сторінки"
        disabled={isAtBottom}
        onClick={() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" })}
        className="focus-ring grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-slate-900/80 text-slate-200 shadow-[0_8px_24px_rgba(0,0,0,0.28)] backdrop-blur-md transition hover:border-accent/45 hover:bg-slate-800 hover:text-accent disabled:pointer-events-none disabled:opacity-25 sm:h-11 sm:w-11"
      >
        <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.4} />
      </button>
    </div>
  );
}
