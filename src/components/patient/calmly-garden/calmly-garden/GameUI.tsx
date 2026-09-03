// src/components/patient/calmly-garden/GameUI.tsx
"use client";

import { Sprout, Star, Sparkles, ArrowLeftRight, ArrowUp, ChevronDown, ChevronUp } from "lucide-react";
import type { GardenStats, InputMode } from "./types";

export default function GameUI({
  stats,
  mode,
  targetSeconds,
  onFinish,
}: {
  stats: GardenStats;
  mode: InputMode;
  targetSeconds: number;
  onFinish: () => void;
}) {
  const progress = Math.min(1, stats.sessionSeconds / targetSeconds);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <StatPill icon={Sprout} color="text-green" value={stats.seeds} label="seeds" />
          <StatPill icon={Star} color="text-peach" value={stats.stars} label="stars" />
          <StatPill icon={Sparkles} color="text-lavender" value={stats.butterflies} label="butterflies" />
        </div>
        <button
          onClick={onFinish}
          className="font-body text-xs text-text/60 hover:text-text underline underline-offset-2 shrink-0"
        >
          Finish for now
        </button>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="font-body text-xs text-text/60">Your garden is growing</span>
          <span className="font-body text-xs text-text/60">{Math.round(stats.restoredPercent)}%</span>
        </div>
        <div className="h-2 rounded-full bg-text/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-green transition-all duration-500"
            style={{ width: `${stats.restoredPercent}%` }}
          />
        </div>
      </div>

      {/* Soft session progress — a gentle indicator, not a countdown pressure clock */}
      <div className="h-1 rounded-full bg-text/5 overflow-hidden">
        <div className="h-full rounded-full bg-text/20 transition-all duration-700" style={{ width: `${progress * 100}%` }} />
      </div>

      <ControlsHint mode={mode} />
    </div>
  );
}

function StatPill({
  icon: Icon,
  color,
  value,
  label,
}: {
  icon: typeof Sprout;
  color: string;
  value: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5 bg-text/5 rounded-full px-3 py-1.5">
      <Icon className={`w-4 h-4 ${color}`} />
      <span className="font-body font-semibold text-text text-sm">{value}</span>
      <span className="font-body text-text/50 text-xs hidden sm:inline">{label}</span>
    </div>
  );
}

function ControlsHint({ mode }: { mode: InputMode }) {
  if (mode === "camera") {
    return (
      <p className="font-body text-text/50 text-xs text-center">
        Lean to move · squat for seeds · reach up for stars &amp; butterflies · rise up to jump · hold a pose to restore
      </p>
    );
  }
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-body text-text/50 text-xs">
      <span className="flex items-center gap-1">
        <ArrowLeftRight className="w-3.5 h-3.5" /> A/D or move  
      </span>
      <span className="flex items-center gap-1">
        <ChevronUp className="w-3.5 h-3.5" /> jump: space
      </span>
      <span className="flex items-center gap-1">
        <ArrowUp className="w-3.5 h-3.5" /> reach: W
      </span>
      <span className="flex items-center gap-1">
        <ChevronDown className="w-3.5 h-3.5" /> squat: S
      </span>
    </div>
  );
}