"use client";

import { useState } from "react";

export function HomeLeagueTabs({ school, university }: { school: React.ReactNode; university: React.ReactNode }) {
  const [activeLeague, setActiveLeague] = useState<"school" | "university">("school");

  return (
    <div className="md:hidden">
      <div className="mb-2 grid grid-cols-2 rounded-lg border border-line bg-surface p-1">
        <button
          type="button"
          onClick={() => setActiveLeague("school")}
          className={`rounded-md px-2 py-2 text-[10px] font-extrabold uppercase tracking-[0.1em] transition ${
            activeLeague === "school" ? "bg-school/15 text-school shadow-[0_0_16px_rgba(110,231,183,0.08)]" : "text-slate-500"
          }`}
        >
          School League
        </button>
        <button
          type="button"
          onClick={() => setActiveLeague("university")}
          className={`rounded-md px-2 py-2 text-[10px] font-extrabold uppercase tracking-[0.1em] transition ${
            activeLeague === "university" ? "bg-accent/15 text-accent shadow-[0_0_16px_rgba(0,213,255,0.08)]" : "text-slate-500"
          }`}
        >
          University League
        </button>
      </div>
      <div key={activeLeague} className="soft-enter">
        {activeLeague === "school" ? school : university}
      </div>
    </div>
  );
}
