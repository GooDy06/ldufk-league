"use client";

import { useState } from "react";

export function CopyLinkButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1400);
      }}
      className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-bold uppercase tracking-wide text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-300/15"
    >
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}
