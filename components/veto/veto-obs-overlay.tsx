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
  type VetoAction,
  type VetoSessionState,
  type VetoTeamKey
} from "@/lib/veto/types";

type VetoObsOverlayProps = {
  sessionId: string;
  layout?: "cards" | "compact";
};

type ApiResponse = {
  ok: boolean;
  session?: VetoSessionState;
};

type VetoCardItem = {
  map: string;
  action: VetoAction;
  team: VetoTeamKey;
  order: number;
};

function actionTheme(action: VetoCardItem["action"]) {
  if (action === "ban") {
    return {
      border: "border-red-500/80",
      wash: "from-black/88 via-black/45 to-red-950/72",
      label: "bg-red-700/86 text-white",
      compact: "border-red-500/80 bg-red-800/82",
      glow: "shadow-red-500/30",
      footer: "from-red-600/92 via-red-700/80 to-red-950/88"
    };
  }

  if (action === "pick") {
    return {
      border: "border-indigo-400/80",
      wash: "from-black/36 via-indigo-950/12 to-indigo-950/38",
      label: "bg-indigo-700/88 text-white",
      compact: "border-indigo-400/80 bg-indigo-800/74",
      glow: "shadow-indigo-400/30",
      footer: "from-indigo-500/86 via-indigo-700/72 to-indigo-950/84"
    };
  }

  if (action === "decider") {
    return {
      border: "border-yellow-300/85",
      wash: "from-black/36 via-yellow-950/16 to-yellow-500/52",
      label: "bg-yellow-400/88 text-slate-950",
      compact: "border-yellow-300/85 bg-yellow-500/82",
      glow: "shadow-yellow-300/30",
      footer: "from-yellow-300/92 via-yellow-500/76 to-yellow-800/80"
    };
  }

  return actionTheme("pick");
}

function displayItems(state: VetoSessionState): VetoCardItem[] {
  const remaining = remainingMaps(state.mapPool, state.steps);
  const deciderMap = state.status === "complete" ? remaining[0] : null;

  const items = state.steps.map((step, index) => ({
    map: step.map,
    action: step.action,
    team: step.team,
    order: index + 1
  }));

  if (deciderMap) {
    items.push({
      map: deciderMap,
      action: "decider",
      team: "system",
      order: state.steps.length + 1
    });
  }

  return items;
}

function TeamBadge({ state, team }: { state: VetoSessionState; team: VetoTeamKey }) {
  if (team === "system") {
    return (
      <div className="max-w-[92%] truncate rounded border border-yellow-200/30 bg-yellow-400/16 px-3 py-1 text-center font-rajdhani text-xl font-bold uppercase text-yellow-50 shadow-[0_10px_25px_rgba(0,0,0,0.45)] [text-shadow:0_2px_10px_rgba(0,0,0,0.9)]">
        Final map
      </div>
    );
  }

  return (
    <div className="max-w-[92%] truncate rounded border border-white/20 bg-black/54 px-3 py-1 text-center font-rajdhani text-xl font-bold uppercase text-white shadow-[0_10px_25px_rgba(0,0,0,0.45)] [text-shadow:0_2px_10px_rgba(0,0,0,0.9)]">
      {teamNameFor(state, team)}
    </div>
  );
}

function PortraitCard({ item, state, index }: { item: VetoCardItem; state: VetoSessionState; index: number }) {
  const image = mapImageFor(mapSlug(item.map));
  const theme = actionTheme(item.action);
  const label = actionLabel(item.action).toUpperCase();

  return (
    <div
      className={`relative h-full min-h-[520px] min-w-0 overflow-hidden rounded border ${theme.border} shadow-[0_28px_60px_rgba(0,0,0,0.42)] ${theme.glow} animate-[vetoCardIn_0.5s_ease-out_both]`}
      style={{ animationDelay: `${index * 85}ms` }}
    >
      {image ? <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${image})`, opacity: 0.86 }} /> : null}
      <div className={`absolute inset-0 bg-gradient-to-b ${theme.wash} opacity-80`} />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/88 via-black/34 to-transparent" />
      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-4 px-3">
        <TeamBadge state={state} team={item.team} />
      </div>
      <div className={`absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t ${theme.footer} px-3 pb-6 pt-16 text-center`}>
        <div className="mx-auto inline-block rounded border border-white/20 bg-black/35 px-3 py-1 font-rajdhani text-xl font-bold uppercase text-white [text-shadow:0_3px_14px_rgba(0,0,0,0.95)]">{label}</div>
        <div className="mx-auto mt-3 max-w-[92%] truncate font-rajdhani text-3xl font-bold uppercase text-white [text-shadow:0_3px_16px_rgba(0,0,0,1)]">{item.map}</div>
      </div>
    </div>
  );
}

function CompactCard({ item, state, index }: { item: VetoCardItem; state: VetoSessionState; index: number }) {
  const image = mapImageFor(mapSlug(item.map));
  const theme = actionTheme(item.action);
  const label = actionLabel(item.action).toUpperCase();
  const teamText = item.team === "system" ? "" : teamNameFor(state, item.team);

  return (
    <div
      className={`relative h-[96px] w-[154px] overflow-hidden rounded border ${theme.compact} shadow-[0_14px_35px_rgba(0,0,0,0.36)] ${theme.glow} animate-[vetoPopIn_0.38s_ease-out_both]`}
      style={{ animationDelay: `${index * 55}ms` }}
    >
      {image ? <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${image})`, opacity: item.action === "pick" ? 0.88 : 0.68 }} /> : null}
      <div className="absolute inset-0 bg-gradient-to-b from-black/12 via-black/18 to-black/82" />
      <div className={`absolute inset-x-0 top-0 h-8 bg-gradient-to-r ${theme.footer}`} />
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="grid grid-cols-[1fr_auto] items-center gap-1 px-2 py-1.5">
          <span className="min-w-0 truncate font-rajdhani text-[15px] font-bold uppercase leading-none text-white [text-shadow:0_2px_8px_rgba(0,0,0,1)]">
            {teamText}
          </span>
          <span className={`rounded px-1.5 py-0.5 font-rajdhani text-[13px] font-bold uppercase leading-none ${theme.label}`}>{label}</span>
        </div>
        <div className="bg-black/42 px-2 py-2 text-center">
          <div className="truncate font-rajdhani text-[20px] font-bold uppercase leading-none text-white [text-shadow:0_3px_12px_rgba(0,0,0,1)]">{item.map}</div>
        </div>
      </div>
    </div>
  );
}

function TeamTurnRow({ label, name, active }: { label: string; name: string; active: boolean }) {
  return (
    <div className={`rounded border px-3 py-1.5 text-center transition ${active ? "border-cyan-300/70 bg-cyan-300/14 text-white shadow-[0_0_22px_rgba(103,232,249,0.22)]" : "border-white/10 bg-white/[0.04] text-white/38"}`}>
      <div className={`text-[9px] font-extrabold uppercase tracking-[0.18em] ${active ? "text-cyan-100" : "text-white/30"}`}>{label}</div>
      <div className="truncate font-rajdhani text-[26px] font-bold uppercase leading-none">{name}</div>
    </div>
  );
}

function Waiting() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-transparent">
      <div className="rounded border border-cyan-300/25 bg-black/60 px-6 py-4 font-rajdhani text-3xl font-bold text-cyan-100">Waiting for veto...</div>
    </div>
  );
}

function OverlayStyles() {
  return (
    <style jsx global>{`
      @keyframes vetoCardIn {
        from {
          opacity: 0;
          transform: translateY(22px) scale(0.96);
          filter: blur(8px);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
          filter: blur(0);
        }
      }
      @keyframes vetoPopIn {
        from {
          opacity: 0;
          transform: translateY(14px) scale(0.92);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      @keyframes livePulse {
        0%, 100% { opacity: 0.55; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.2); }
      }
    `}</style>
  );
}

function CardsLayout({ state, items, stale }: { state: VetoSessionState; items: VetoCardItem[]; stale: boolean }) {
  const nextStep = planFor(state.format, state.firstTeam, state.mapPool.length)[state.steps.length] || null;
  const currentAction = state.status === "complete" ? "Veto complete" : nextStep ? `${teamNameFor(state, nextStep.team)} ${nextStep.action}s next` : "Waiting";

  return (
    <div className="h-screen w-screen overflow-hidden bg-transparent text-white">
      <OverlayStyles />
      <div className="flex h-full w-full items-stretch justify-stretch">
        <section className="relative h-full w-full overflow-hidden bg-slate-950/72 px-14 py-12 shadow-[0_32px_90px_rgba(0,0,0,0.55)] backdrop-blur-md">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(56,189,248,0.16),transparent_34%),radial-gradient(circle_at_88%_90%,rgba(239,68,68,0.18),transparent_34%)]" />
          <div className="relative z-10 flex h-full flex-col">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6">
              <div className="truncate text-left font-rajdhani text-5xl font-bold uppercase text-white/88">{state.team1}</div>
              <div className="text-center">
                <div className="font-rajdhani text-4xl font-bold uppercase text-white [text-shadow:0_4px_22px_rgba(0,0,0,0.9)]">MAP VETO</div>
                <div className="mt-1 text-xs font-extrabold uppercase text-cyan-100/70">{formatLabel(state.format)}</div>
              </div>
              <div className="truncate text-right font-rajdhani text-5xl font-bold uppercase text-white/88">{state.team2}</div>
            </div>

            <div className="mt-12 grid min-h-0 flex-1 grid-cols-7 gap-3 overflow-hidden">
              {items.map((item, index) => (
                <PortraitCard key={`${item.map}-${item.action}-${item.order}`} item={item} state={state} index={index} />
              ))}
            </div>

            <div className="mt-8 flex items-center justify-center gap-3 text-xs font-extrabold uppercase text-white/58">
              <span className="h-2 w-2 rounded-full bg-emerald-300" style={{ animation: "livePulse 1.6s ease-in-out infinite" }} />
              <span>{currentAction}</span>
              {stale ? <span className="text-rose-300">Sync reconnecting</span> : null}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function CompactLayout({ state, items, stale }: { state: VetoSessionState; items: VetoCardItem[]; stale: boolean }) {
  const nextStep = planFor(state.format, state.firstTeam, state.mapPool.length)[state.steps.length] || null;
  const isTeam1Active = nextStep?.team === "team1";
  const isTeam2Active = nextStep?.team === "team2";
  const currentAction = state.status === "complete" ? "COMPLETE" : nextStep ? nextStep.action.toUpperCase() : "WAIT";

  return (
    <div className="h-screen w-screen overflow-hidden bg-transparent text-white">
      <OverlayStyles />
      <div className="absolute bottom-14 left-1/2 flex -translate-x-1/2 items-end gap-2 rounded bg-black/18 px-3 py-2 backdrop-blur-[2px]">
        <div className="mr-2 hidden w-[240px] rounded border border-white/18 bg-black/64 px-3 py-3 shadow-[0_12px_34px_rgba(0,0,0,0.42)] lg:block">
          <div className="grid grid-cols-[1fr_auto] items-center gap-2">
            <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-cyan-100/70">Map veto</div>
            <div className="rounded bg-white/10 px-2 py-0.5 font-rajdhani text-[15px] font-bold uppercase text-white">{currentAction}</div>
          </div>
          <div className="mt-2 grid gap-1.5">
            <TeamTurnRow label={isTeam1Active ? "Now" : "Waiting"} name={state.team1} active={isTeam1Active} />
            <div className="text-center font-rajdhani text-lg font-bold uppercase leading-none text-white/42">vs</div>
            <TeamTurnRow label={isTeam2Active ? "Now" : "Waiting"} name={state.team2} active={isTeam2Active} />
          </div>
        </div>
        {items.map((item, index) => <CompactCard key={`${item.map}-${item.action}-${item.order}`} item={item} state={state} index={index} />)}
        {stale ? <div className="ml-2 rounded border border-rose-400/35 bg-rose-500/18 px-2 py-1 text-[10px] font-bold uppercase text-rose-100">reconnect</div> : null}
      </div>
    </div>
  );
}

export function VetoObsOverlay({ sessionId, layout = "cards" }: VetoObsOverlayProps) {
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

  const items = useMemo(() => state ? displayItems(state) : [], [state]);

  if (!state) return <Waiting />;

  if (layout === "compact") {
    return <CompactLayout state={state} items={items} stale={isStale} />;
  }

  return <CardsLayout state={state} items={items} stale={isStale} />;
}
