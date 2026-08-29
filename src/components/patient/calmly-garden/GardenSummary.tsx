// src/components/patient/calmly-garden/GardenSummary.tsx
"use client";

import { Sprout, Star, Sparkles, Leaf, ArrowLeft, RotateCcw } from "lucide-react";
import type { GardenStats } from "./types";

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  if (minutes === 0) return `${seconds} sec`;
  if (seconds === 0) return `${minutes} min`;
  return `${minutes} min ${seconds} sec`;
}

export default function GardenSummary({
  stats,
  onPlayAgain,
  onBack,
}: {
  stats: GardenStats;
  onPlayAgain: () => void;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col items-center text-center py-8 px-4 gap-6">
      <div className="w-16 h-16 rounded-full bg-green-soft flex items-center justify-center">
        <Leaf className="w-8 h-8 text-green" />
      </div>

      <div>
        <h3 className="font-body font-bold text-text text-2xl">Your garden is growing 🌱</h3>
        <p className="font-body text-text/60 text-sm mt-1">
          Thank you for taking this time for yourself.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
        <SummaryStat icon={Sprout} color="text-green" bg="bg-green-soft" value={stats.seeds} label="Seeds" />
        <SummaryStat icon={Star} color="text-peach" bg="bg-peach-soft" value={stats.stars} label="Stars" />
        <SummaryStat
          icon={Sparkles}
          color="text-lavender"
          bg="bg-lavender-soft"
          value={stats.butterflies}
          label="Butterflies"
        />
      </div>

      <div className="w-full max-w-sm bg-text/5 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="font-body text-text/60 text-sm">Garden restored</span>
          <span className="font-body font-semibold text-text text-sm">{Math.round(stats.restoredPercent)}%</span>
        </div>
        <div className="h-2 rounded-full bg-text/10 overflow-hidden mb-3">
          <div
            className="h-full rounded-full bg-green transition-all duration-700"
            style={{ width: `${stats.restoredPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="font-body text-text/60 text-sm">Session</span>
          <span className="font-body font-semibold text-text text-sm">{formatDuration(stats.sessionSeconds)}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 font-body text-text/70 text-sm px-4 py-2 rounded-full hover:bg-text/5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to exercises
        </button>
        <button
          onClick={onPlayAgain}
          className="flex items-center gap-1.5 font-body font-semibold text-background text-sm px-5 py-2 rounded-full bg-green hover:brightness-95"
        >
          <RotateCcw className="w-4 h-4" /> Visit garden again
        </button>
      </div>
    </div>
  );
}

function SummaryStat({
  icon: Icon,
  color,
  bg,
  value,
  label,
}: {
  icon: typeof Sprout;
  color: string;
  bg: string;
  value: number;
  label: string;
}) {
  return (
    <div className={`rounded-2xl p-3 flex flex-col items-center gap-1 ${bg}`}>
      <Icon className={`w-5 h-5 ${color}`} />
      <span className="font-body font-bold text-text text-lg">{value}</span>
      <span className="font-body text-text/50 text-xs">{label}</span>
    </div>
  );
}