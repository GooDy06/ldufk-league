"use client";

import { useState } from "react";

export function LiteYoutubePlayer({ videoId, title }: { videoId: string | null; title: string }) {
  const [active, setActive] = useState(false);

  if (!videoId) {
    return (
      <div className="grid aspect-video place-items-center rounded-lg border border-line bg-black px-4 text-center text-xs font-bold uppercase tracking-[0.18em] text-slate-600">
        Додай YouTube highlight URL в адмінці гравця
      </div>
    );
  }

  const thumbnail = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
  const iframeUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&color=white`;

  return (
    <div className="group relative aspect-video overflow-hidden rounded-lg border border-line bg-black">
      {active ? (
        <iframe
          className="h-full w-full"
          src={iframeUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setActive(true)}
          className="relative h-full w-full overflow-hidden text-left outline-none"
          aria-label={`Play ${title}`}
        >
          <img src={thumbnail} alt="" className="h-full w-full object-cover opacity-80 transition duration-300 group-hover:scale-[1.03] group-hover:opacity-95" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />
          <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/80 backdrop-blur-md">
            LDUFK Highlight
          </div>
          <div className="absolute inset-0 grid place-items-center">
            <span className="grid h-16 w-16 place-items-center rounded-full border border-accent/50 bg-accent/15 text-accent shadow-[0_0_40px_rgba(34,211,238,0.28)] backdrop-blur-md transition group-hover:scale-105 group-hover:bg-accent group-hover:text-bg">
              <span className="ml-1 h-0 w-0 border-y-[12px] border-l-[18px] border-y-transparent border-l-current" />
            </span>
          </div>
        </button>
      )}
    </div>
  );
}
