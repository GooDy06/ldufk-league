"use client";

import { useState } from "react";
import type { PlayerComputedStats } from "@/lib/player-stats";

type PlayerSide = "both" | "ct" | "t";

function grade(value: number, good = 66, okay = 42) {
  if (value >= good) return { label: "ДОБРЕ", color: "text-emerald-300", bar: "bg-emerald-300", glow: "shadow-[0_0_18px_rgba(110,231,183,0.35)]" };
  if (value >= okay) return { label: "НОРМА", color: "text-amber-300", bar: "bg-amber-300", glow: "shadow-[0_0_18px_rgba(252,211,77,0.28)]" };
  return { label: "СЛАБКО", color: "text-red-300", bar: "bg-red-300", glow: "shadow-[0_0_18px_rgba(252,165,165,0.26)]" };
}

function score(value: number, target: number) {
  if (!Number.isFinite(value) || target <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((value / target) * 100)));
}

function sideValue(stats: PlayerComputedStats | null, selectedSide: PlayerSide) {
  if (!stats || selectedSide === "both") {
    return { rating: stats?.rating || 0, rounds: stats?.rounds || 0 };
  }

  const side = selectedSide === "ct" ? stats.sides.CT : stats.sides.T;
  return { rating: side.rating, rounds: side.rounds };
}

function sideBarStats(stats: PlayerComputedStats | null, selectedSide: PlayerSide) {
  if (!stats || selectedSide === "both") {
    return [
      ["Вогнева міць", stats?.firepower || 0, "Вплив KPR та ADR"],
      ["Перші дуелі", stats?.entrying || 0, "Відсоток перемог у перших дуелях"],
      ["Розміни", stats?.trading || 0, "Розміни, асисти та розміняні смерті"],
      ["Відкриття", stats?.opening || 0, "Перші вбивства за раунд"],
      ["Клатчі", stats?.clutching || 0, "Вплив K/D у складних ситуаціях"],
      ["Мультикіл", stats?.multiKill || 0, "Раунди з 2+ вбивствами за карту"],
      ["Снайперська гра", stats?.sniping || 0, "Вбивства з AWP, Scout та autosniper"],
      ["Гранати", stats?.utility || 0, "Флеш-асисти з демо"],
    ] as const;
  }

  const side = selectedSide === "ct" ? stats.sides.CT : stats.sides.T;
  const rounds = Math.max(1, side.rounds);
  const kd = side.deaths > 0 ? side.kills / side.deaths : side.kills;
  const entryRate = side.firstKills / Math.max(1, side.firstKills + side.firstDeaths);

  return [
    ["Вогнева міць", score(side.kpr, 0.9), "Вплив KPR за сторону"],
    ["Перші дуелі", score(entryRate, 0.65), "Перемоги у перших дуелях за сторону"],
    ["Розміни", score(side.assists / rounds, 0.25), "Асисти за раунд за сторону"],
    ["Відкриття", score(side.firstKills / rounds, 0.16), "Перші вбивства за раунд за сторону"],
    ["Клатчі", score(kd, 1.5), "Вплив K/D за сторону"],
    ["Мультикіл", score(side.kpr, 1.1), "Мультикіл-тиск за сторону"],
    ["Снайперська гра", stats.sniping || 0, "Загальний показник зі зброї"],
    ["Гранати", stats.utility || 0, "Загальний показник флеш-асистів"],
  ] as const;
}

function StatBar({ label, value, hint }: { label: string; value: number; hint: string }) {
  const state = grade(value);

  return (
    <div className="rounded bg-slate-700/45 px-2 py-1 sm:px-3 sm:py-2">
      <div className="mb-1 flex items-center justify-between gap-2 sm:mb-1.5 sm:gap-3">
        <div>
          <div className="font-rajdhani text-sm font-bold leading-none text-slate-300 sm:text-lg">{label}</div>
          <div className="hidden text-[10px] font-semibold text-slate-600 sm:block">{hint}</div>
        </div>
        <div className="text-right font-rajdhani text-sm font-bold leading-none text-slate-300 sm:text-lg">{value}<span className="text-[9px] text-slate-500 sm:text-xs">/100</span></div>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-slate-700/40 sm:h-1.5">
        <div className={`stat-bar stat-bar-enter h-full rounded-full ${state.bar} ${state.glow}`} style={{ width: `${Math.max(2, Math.min(100, value))}%` }} />
      </div>
      <div className={`mt-0.5 hidden text-right text-[9px] font-extrabold uppercase tracking-[0.16em] sm:block ${state.color}`}>{state.label}</div>
    </div>
  );
}

export function PlayerSideStats({
  stats,
  initialSide = "both"
}: {
  stats: PlayerComputedStats | null;
  initialSide?: PlayerSide;
}) {
  const [selectedSide, setSelectedSide] = useState<PlayerSide>(initialSide);
  const current = sideValue(stats, selectedSide);
  const sideTabs = [
    ["both", "Загалом"],
    ["ct", "CT"],
    ["t", "T"],
  ] as const;

  function selectSide(side: PlayerSide) {
    setSelectedSide(side);
    const url = new URL(window.location.href);
    if (side === "both") url.searchParams.delete("side");
    else url.searchParams.set("side", side);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  return (
    <div className="rounded-md border border-line bg-surface2 p-2 sm:p-3">
      <div className="mb-2 grid grid-cols-[1fr_auto] items-center gap-2 border-b border-line pb-2 sm:mb-3 lg:grid-cols-[210px_240px_64px] lg:gap-3">
        <div className="min-w-0">
          <strong className="font-rajdhani text-base leading-none text-slate-300 sm:text-xl">Рейтинг 3.0</strong>
          <div className="text-[10px] font-bold leading-none text-slate-600 sm:text-xs">
            {selectedSide === "both" ? "Усі сторони" : selectedSide === "ct" ? "Сторона CT" : "Сторона T"} · {current.rounds} раундів
          </div>
        </div>
        <div className="order-3 col-span-2 grid h-8 w-full grid-cols-3 overflow-hidden rounded-md border border-slate-500/30 bg-bg/60 p-0.5 sm:h-8 lg:order-none lg:col-span-1 lg:w-[240px]">
          {sideTabs.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => selectSide(key)}
              className={`flex h-7 min-w-0 items-center justify-center rounded px-1 text-center text-[10px] font-bold leading-none transition sm:h-7 sm:px-2 sm:text-xs ${selectedSide === key ? "bg-accent text-bg" : "text-slate-400 hover:bg-accent/10 hover:text-accent"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="text-right font-rajdhani text-xl font-bold leading-none text-slate-200">{current.rating.toFixed(2)}</span>
      </div>
      <div className="grid grid-cols-2 gap-1 sm:gap-2">
        {sideBarStats(stats, selectedSide).map(([label, value, hint]) => <StatBar key={label} label={label} value={value} hint={hint} />)}
      </div>
    </div>
  );
}
