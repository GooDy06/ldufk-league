"use client";

import { useState } from "react";
import { CopyLinkButton } from "@/components/cams/copy-link-button";

type CustomDelayLinksProps = {
  baseLink: string;
  labels?: [string, string];
};

function normalizeDelay(value: string) {
  const parsed = Math.floor(Number(value || 0));
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.min(900, parsed));
}

function withDelay(baseLink: string, delay: number) {
  try {
    const url = new URL(baseLink);
    url.searchParams.set("delay", String(delay));
    return url.toString();
  } catch {
    const separator = baseLink.includes("?") ? "&" : "?";
    return `${baseLink}${separator}delay=${delay}`;
  }
}

export function CustomDelayLinks({ baseLink, labels = ["Delay 1", "Delay 2"] }: CustomDelayLinksProps) {
  const [firstDelay, setFirstDelay] = useState("30");
  const [secondDelay, setSecondDelay] = useState("120");
  const delayItems = [
    { label: labels[0], value: firstDelay, setValue: setFirstDelay },
    { label: labels[1], value: secondDelay, setValue: setSecondDelay }
  ];

  return (
    <div className="grid gap-2">
      {delayItems.map((item) => {
        const delay = normalizeDelay(item.value);
        const link = withDelay(baseLink, delay);

        return (
          <div key={item.label} className="flex items-center gap-2">
            <span className="w-12 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">{item.label}</span>
            <input
              type="number"
              min={0}
              max={900}
              value={item.value}
              onChange={(event) => item.setValue(event.target.value)}
              className="w-20 rounded-lg border border-white/10 bg-black/30 px-2 py-2 font-mono text-xs text-white outline-none focus:border-cyan-300"
              aria-label={`${item.label} seconds`}
            />
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">sec</span>
            <input readOnly value={link} className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-xs text-emerald-100 outline-none" />
            <CopyLinkButton value={link} />
          </div>
        );
      })}
    </div>
  );
}
