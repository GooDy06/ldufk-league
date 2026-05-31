"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton({ fallbackHref, label }: { fallbackHref: string; label: string }) {
  const router = useRouter();

  function goBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className="focus-ring inline-flex items-center gap-2 rounded-lg border border-line bg-surface2 px-3 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-slate-400 transition hover:border-accent/40 hover:bg-accent/10 hover:text-accent"
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={2.2} />
      {label}
    </button>
  );
}
