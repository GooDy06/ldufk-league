"use client";

import { useEffect, useMemo, useState } from "react";
import { mapImageFor } from "@/lib/map-assets";
import {
  actionLabel,
  formatLabel,
  mapSlug,
  planFor,
  remainingMaps,
  teamNameFor,
  type VetoSessionState,
  type VetoStep
} from "@/lib/veto/types";

type VetoObsOverlayProps = {
  sessionId: string;
};

type ApiResponse = {
  ok: boolean;
  session?: VetoSessionState;
};

function actionTone(step: VetoStep) {
  if (step.action === "ban") return "border-rose-400/50 bg-rose-500/16 text-rose-100";
  if (step.action === "pick") return "border-emerald-300/55 bg-emerald-400/18 text-emerald-50";
  return "border-cyan-300/55 bg-cyan-400/18 text-cyan-50";
}

function MapCard({ step, state, index }: { step: VetoStep; state: VetoSessionState; index: number }) {
  const image = mapImageFor(mapSlug(step.map));

  return (
    <div
      className={`relative min-h-[112px] overflow-hidden rounded-lg border shadow-[0_18px_45px_rgba(0,0,0,0.32)] ${actionTone(step)} animate-[vetoIn_0.45s_ease-out_both]`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {image ? (
        <div className="absolute inset-0 bg-cover bg-center opacity-50" style={{ backgroundImage: `url(${image})` }} />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-r from-black/86 via-black/58 to-black/72" />
      <div className="relative z-10 grid h-full grid-cols-[1fr_auto] gap-3 p-3">
        <div className="min-w-0">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] opacity-75">{teamNameFor(state, step.team)}</div>
          <div className="mt-1 truncate font-rajdhani text-4xl font-bold leading-none text-white [text-shadow:0_4px_18px_rgba(0,0,0,0.9)]">{step.map}</div>
        </div>
        <div className="self-end rounded-md border border-white/15 bg-black/50 px-2 py-1 font-rajdhani text-xl font-bold uppercase tracking-[0.08em]">
          {actionLabel(step.action)}
        </div>
      </div>
    </div>
  );
}

export function VetoObsOverlay({ sessionId }: VetoObsOverlayProps) {
  const [state, setState] = useState<VetoSessionState | null>(null);
  const [isStale, setIsStale] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const response = await fetch(`/api/veto/sessions/${sessionId}`, { cache: "no-store" }).catch(() => null);
      if (!response?.ok) {
        if (!cancelled) setIsStale(true);
        return;
      }

      const data = (await response.json()) as ApiResponse;
      if (!cancelled && data.session) {
        setState(data.session);
        setIsStale(false);
      }
    }

    void load();
    const timer = window.setInterval(load, 1000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [sessionId]);

  const finalMaps = useMemo(() => {
    if (!state) return [];
    const remaining = remainingMaps(state.mapPool, state.steps);
    if (state.status !== "complete" || !remaining[0]) return state.steps;
    return [...state.steps, { team: "system" as const, action: "decider" as const, map: remaining[0] }];
  }, [state]);

  const nextStep = useMemo(() => {
    if (!state) return null;
    const plan = planFor(state.format, state.firstTeam, state.mapPool.length);
    return plan[state.steps.length] || null;
  }, [state]);

  if (!state) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-transparent">
        <div className="rounded-lg border border-cyan-300/25 bg-black/60 px-6 py-4 font-rajdhani text-3xl font-bold text-cyan-100">Waiting for veto...</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-transparent p-8 text-white">
      <style jsx global>{`
        @keyframes vetoIn {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.985);
            filter: blur(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }
        @keyframes livePulse {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>

      <div className="mx-auto grid h-full max-w-[1720px] grid-rows-[auto_1fr_auto] gap-5">
        <header className="overflow-hidden rounded-lg border border-cyan-300/25 bg-slate-950/78 shadow-[0_24px_70px_rgba(0,0,0,0.42)] backdrop-blur">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-5 px-7 py-5">
            <div className="min-w-0">
              <div className="text-[12px] font-extrabold uppercase tracking-[0.28em] text-cyan-200/80">Team 1</div>
              <div className="truncate font-rajdhani text-6xl font-bold leading-none">{state.team1}</div>
            </div>
            <div className="text-center">
              <div className="rounded-full border border-white/10 bg-black/45 px-5 py-2 text-[12px] font-extrabold uppercase tracking-[0.22em] text-cyan-100">{formatLabel(state.format)}</div>
              <div className="mt-2 font-rajdhani text-4xl font-bold text-white/60">VETO</div>
            </div>
            <div className="min-w-0 text-right">
              <div className="text-[12px] font-extrabold uppercase tracking-[0.28em] text-cyan-200/80">Team 2</div>
              <div className="truncate font-rajdhani text-6xl font-bold leading-none">{state.team2}</div>
            </div>
          </div>
        </header>

        <main className="grid grid-cols-[1fr_360px] gap-5">
          <section className="grid auto-rows-fr grid-cols-3 gap-4">
            {finalMaps.length ? finalMaps.map((step, index) => (
              <MapCard key={`${step.map}-${index}-${step.action}`} step={step} state={state} index={index} />
            )) : (
              <div className="col-span-3 flex items-center justify-center rounded-lg border border-cyan-300/20 bg-slate-950/70 font-rajdhani text-6xl font-bold text-white/75">
                Veto not started
              </div>
            )}
          </section>

          <aside className="rounded-lg border border-cyan-300/25 bg-slate-950/78 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.42)] backdrop-blur">
            <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.24em] text-cyan-200/80">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" style={{ animation: "livePulse 1.6s ease-in-out infinite" }} />
              Live veto
            </div>
            <div className="mt-5 border-t border-white/10 pt-5">
              <div className="text-[12px] font-extrabold uppercase tracking-[0.2em] text-white/45">Now</div>
              <div className="mt-2 font-rajdhani text-4xl font-bold leading-none">
                {state.status === "complete" ? "Veto complete" : nextStep ? `${teamNameFor(state, nextStep.team)} ${nextStep.action}s` : "Waiting"}
              </div>
            </div>
            <div className="mt-5 grid gap-2">
              {remainingMaps(state.mapPool, state.steps).map((map) => (
                <div key={map} className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 font-rajdhani text-2xl font-bold text-white/70">
                  {map}
                </div>
              ))}
            </div>
            {isStale ? <div className="mt-4 rounded-md border border-rose-400/35 bg-rose-500/12 px-3 py-2 text-xs font-bold text-rose-100">Sync reconnecting...</div> : null}
          </aside>
        </main>

        <footer className="rounded-lg border border-white/10 bg-black/45 px-5 py-3 text-center text-[12px] font-extrabold uppercase tracking-[0.28em] text-cyan-100/80">
          LDUFK School Cup 2026
        </footer>
      </div>
    </div>
  );
}
