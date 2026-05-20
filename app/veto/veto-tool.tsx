"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ACTIVE_MAPS,
  actionColor,
  actionLabel,
  formatLabel,
  normalizeMaps,
  planFor,
  publicObsUrl,
  type VetoFormat,
  type VetoSessionState,
  type VetoStep,
  type VetoTeamKey
} from "@/lib/veto/types";

export function VetoTool() {
  const [team1, setTeam1] = useState("Team 1");
  const [team2, setTeam2] = useState("Team 2");
  const [format, setFormat] = useState<VetoFormat>("bo3");
  const [first, setFirst] = useState<VetoTeamKey>("team1");
  const [mapText, setMapText] = useState(ACTIVE_MAPS.join("\n"));
  const [steps, setSteps] = useState<VetoStep[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [flipState, setFlipState] = useState<{ active: boolean; winner: VetoTeamKey | null; count: number }>({ active: false, winner: null, count: 0 });
  const createInFlightRef = useRef(false);
  const hasCreatedRef = useRef(false);

  const maps = useMemo(() => normalizeMaps(mapText), [mapText]);
  const remaining = maps.filter((map) => !steps.some((step) => step.map.toLowerCase() === map.toLowerCase()));
  const plan = planFor(format, first, maps.length);
  const next = plan[steps.length];
  const isDone = !next;

  const teamName = (team: VetoTeamKey) => {
    if (team === "team1") return team1 || "Team 1";
    if (team === "team2") return team2 || "Team 2";
    return "System";
  };
  const actionText = flipState.active ? "??? starts" : isDone ? "Veto complete" : `${teamName(next.team)} ${next.action}s`;
  const obsLink = sessionId ? publicObsUrl(sessionId) : "";

  useEffect(() => {
    if (hasCreatedRef.current || createInFlightRef.current) return;

    createInFlightRef.current = true;
    fetch("/api/veto/sessions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ team1, team2, format, firstTeam: first, mapPool: maps })
    })
      .then((response) => response.json())
      .then((data: { session?: VetoSessionState }) => {
        if (data.session?.id) {
          hasCreatedRef.current = true;
          setSessionId(data.session.id);
          setSaveStatus("saved");
        } else {
          setSaveStatus("error");
        }
      })
      .catch(() => setSaveStatus("error"))
      .finally(() => {
        createInFlightRef.current = false;
      });
  }, [first, format, maps, team1, team2]);

  useEffect(() => {
    if (!sessionId) return;

    setSaveStatus("saving");
    const timer = window.setTimeout(() => {
      fetch(`/api/veto/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          team1,
          team2,
          format,
          firstTeam: first,
          mapPool: maps,
          steps,
          status: isDone ? "complete" : steps.length ? "live" : "draft"
        })
      })
        .then((response) => {
          setSaveStatus(response.ok ? "saved" : "error");
        })
        .catch(() => setSaveStatus("error"));
    }, 250);

    return () => window.clearTimeout(timer);
  }, [first, format, isDone, maps, sessionId, steps, team1, team2]);

  function reset() {
    setSteps([]);
  }

  function chooseMap(map: string) {
    if (!next || isDone) return;
    setSteps((current) => [...current, { ...next, map }]);
  }

  function coinFlip() {
    const winner: VetoTeamKey = Math.random() >= 0.5 ? "team1" : "team2";
    setFlipState((current) => ({ active: true, winner: null, count: current.count + 1 }));
    window.setTimeout(() => {
      setFirst(winner);
      setFlipState((current) => ({ ...current, active: false, winner }));
    }, 760);
    setSteps([]);
  }

  function swapFirst() {
    setFirst((current) => current === "team1" ? "team2" : "team1");
    setSteps([]);
  }

  function applyDefaultMaps() {
    setMapText(ACTIVE_MAPS.join("\n"));
    setSteps([]);
  }

  return (
    <section className="grid gap-3 lg:grid-cols-[300px_1fr]">
      <div className="rounded-xl border border-line bg-surface p-3">
        <div className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-500">Setup</div>
        <div className="mt-3 grid gap-2.5">
          <label className="grid gap-1 text-xs font-bold text-slate-300">
            Team 1
            <input value={team1} onChange={(event) => setTeam1(event.target.value)} className="rounded-lg border border-line bg-surface2 px-3 py-1.5 text-sm outline-none focus:border-accent" />
          </label>
          <label className="grid gap-1 text-xs font-bold text-slate-300">
            Team 2
            <input value={team2} onChange={(event) => setTeam2(event.target.value)} className="rounded-lg border border-line bg-surface2 px-3 py-1.5 text-sm outline-none focus:border-accent" />
          </label>

          <div>
            <div className="mb-1 text-xs font-bold text-slate-300">Format</div>
            <div className="grid grid-cols-3 gap-2">
              {(["bo1", "bo3", "bo5"] as const).map((item) => (
                <button key={item} type="button" onClick={() => { setFormat(item); reset(); }} className={`h-9 rounded-lg border px-2 font-rajdhani text-base font-bold uppercase transition ${format === item ? "border-accent bg-accent text-bg" : "border-line bg-surface2 text-slate-300 hover:text-accent"}`}>
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={swapFirst} disabled={flipState.active} className="rounded-lg border border-line bg-surface2 px-2 py-1.5 text-xs font-bold text-slate-300 transition hover:border-accent hover:text-accent disabled:cursor-wait disabled:text-slate-500">
              First: {flipState.active ? "???" : teamName(first)}
            </button>
            <button type="button" onClick={coinFlip} className={`relative overflow-hidden rounded-lg border border-gold/40 bg-gold/10 px-2 py-1.5 text-xs font-bold text-gold transition hover:bg-gold/20 ${flipState.active ? "scale-[1.02] ring-2 ring-gold/45" : ""}`}>
              <span key={flipState.count} className={`inline-flex items-center gap-1 ${flipState.active ? "animate-[coinFlip_0.76s_ease-in-out]" : ""}`}>
                COIN FLIP
              </span>
            </button>
          </div>
          <div className={`rounded-lg border px-3 py-2 text-center font-rajdhani text-lg font-bold transition ${flipState.winner ? "border-gold/35 bg-gold/10 text-gold" : "border-line bg-bg/30 text-slate-500"}`}>
            {flipState.active ? "Who starts? ???" : flipState.winner ? `${teamName(flipState.winner)} starts` : "Coin flip result"}
          </div>

          <label className="grid gap-1 text-xs font-bold text-slate-300">
            Map pool
            <textarea
              value={mapText}
              onChange={(event) => { setMapText(event.target.value); reset(); }}
              rows={5}
              className="resize-y rounded-lg border border-line bg-surface2 px-3 py-2 text-xs leading-5 outline-none focus:border-accent"
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={applyDefaultMaps} className="rounded-lg border border-line bg-surface2 px-2 py-1.5 text-xs font-bold text-slate-300 transition hover:text-accent">
              Default pool
            </button>
            <button type="button" onClick={reset} className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-2 py-1.5 text-xs font-bold text-rose-200 transition hover:bg-rose-500/20">
              Reset veto
            </button>
          </div>

          <div className="rounded-lg border border-accent/25 bg-accent/10 p-2">
            <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-accent">OBS live overlay</div>
            <input readOnly value={obsLink || "Creating OBS link..."} className="mt-2 w-full rounded-md border border-line bg-bg/60 px-2 py-1.5 font-mono text-[10px] text-slate-300 outline-none" />
            <div className="mt-2 grid grid-cols-[1fr_auto] items-center gap-2">
              <div className={`text-[10px] font-bold uppercase tracking-[0.12em] ${saveStatus === "error" ? "text-rose-300" : "text-slate-500"}`}>
                {saveStatus === "saving" ? "saving" : saveStatus === "error" ? "sync error" : "live sync"}
              </div>
              <button
                type="button"
                disabled={!obsLink}
                onClick={() => void navigator.clipboard.writeText(obsLink)}
                className="rounded-md border border-accent/35 bg-accent/15 px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-accent transition hover:bg-accent hover:text-bg disabled:cursor-not-allowed disabled:opacity-50"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <div className="grid gap-2 border-b border-line bg-surface2/70 p-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <div className="font-rajdhani text-2xl font-bold leading-none sm:text-3xl">{team1 || "Team 1"} <span className="text-slate-500">vs</span> {team2 || "Team 2"}</div>
            <div className="mt-0.5 text-xs font-bold text-slate-500">{formatLabel(format)} · {maps.length} maps in pool</div>
          </div>
          <div className="rounded-full border border-accent/25 bg-accent/10 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.14em] text-accent">
            {actionText}
          </div>
        </div>

        <div className="border-b border-line p-3">
          <div className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-500">
            {isDone ? "Final maps" : "Choose next map"}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {remaining.length ? remaining.map((map) => (
              <button
                key={map}
                type="button"
                onClick={() => chooseMap(map)}
                disabled={isDone}
                className={`rounded-full border px-3 py-1.5 font-rajdhani text-base font-bold transition sm:px-3.5 ${isDone ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" : next?.action === "ban" ? "border-rose-400/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20" : "border-emerald-400/30 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/20"}`}
              >
                {map}
              </button>
            )) : (
              <div className="rounded-lg border border-line bg-bg/40 px-3 py-2 text-xs text-slate-500">Карт більше немає.</div>
            )}
          </div>
        </div>

        <div className="p-3">
          <div className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-500">Veto log</div>
          <div className="grid gap-2">
            {steps.map((step, index) => (
              <div key={`${step.map}-${index}`} className={`rounded-lg border border-line bg-bg/30 px-3 py-2 font-rajdhani text-xl font-bold sm:text-2xl ${actionColor(step.action)}`}>
                {index + 1}. {teamName(step.team)} {actionLabel(step.action)} {step.map}
              </div>
            ))}
            {isDone && remaining[0] ? (
              <div className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 font-rajdhani text-xl font-bold text-emerald-300 sm:text-2xl">
                {steps.length + 1}. System picked {remaining[0]}
              </div>
            ) : null}
            {!steps.length ? <div className="rounded-lg border border-line bg-bg/30 px-3 py-3 text-xs text-slate-500">Veto ще не почався.</div> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
