// src/components/patient/calmly-garden/GardenSummary.tsx
"use client";

import { Sprout, Star, Sparkles, Leaf } from "lucide-react";
import type { GardenStats } from "./types";

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  if (minutes === 0) return `${seconds} sec`;
  if (seconds === 0) return `${minutes} min`;
  return `${minutes} min ${seconds} sec`;
}

function IconReplay({ className = "" }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 4v6h6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 13.5a8 8 0 1 0 2-8.4L4 10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
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
    <div className="relative flex flex-col items-center text-center py-5 px-4 sm:px-8 gap-6 overflow-hidden">

      {/* Decorative accents — mirrored left/right for balance */}
      <div className="pointer-events-none absolute -top-12 -left-12 w-40 h-40 rounded-full bg-greensoft/50 blur-2xl" />
      <div className="pointer-events-none absolute -top-12 -right-12 w-40 h-40 rounded-full bg-greensoft/50 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-12 w-48 h-48 rounded-full bg-lavendersoft/30 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-16 -right-12 w-48 h-48 rounded-full bg-greensoft/40 blur-2xl" />
      <div className="pointer-events-none absolute top-1/2 -translate-y-1/2 left-6 w-20 h-20 rounded-full bg-peachsoft/25 blur-2xl" />
      <div className="pointer-events-none absolute top-1/2 -translate-y-1/2 right-6 w-20 h-20 rounded-full bg-peachsoft/25 blur-2xl" />
      <Sparkles className="pointer-events-none absolute top-1/3 left-10 w-4 h-4 text-green/30" />
      <Sparkles className="pointer-events-none absolute top-1/3 right-10 w-4 h-4 text-green/30" />
      <Leaf className="pointer-events-none absolute bottom-16 left-14 w-5 h-5 text-green/20 -rotate-12" />
      <Leaf className="pointer-events-none absolute bottom-16 right-14 w-5 h-5 text-green/20 rotate-12" />

      {/* HEADER — title/subtitle top-left, Back top-right */}
      <div className="relative flex items-start justify-between w-full max-w-3xl mt-4 mb-2">
        <div>
          <h2 className="font-heading text-heading text-3xl md:text-4xl flex items-center gap-2">
            Scores
            <Leaf className="w-6 h-6 text-green" />
          </h2>
        </div>

        <button
          onClick={onBack}
          className="font-body text-sm text-heading underline underline-offset-4 shrink-0 mt-1"
        >
          Back
        </button>
      </div>

      {/* ICON BADGE */}
      <div className="relative w-16 h-16 rounded-full bg-green-soft flex items-center justify-center shadow-md ring-4 ring-white/70">
        <Leaf className="w-8 h-8 text-green" />
      </div>

      <div>
        <h3 className="font-body font-bold text-green text-2xl">Your garden is growing</h3>
        <p className="font-body text-text/60 text-sm mt-1">
          Thank you for taking this time for yourself.
        </p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-md">
        <SummaryStat icon={Sprout} value={stats.seeds} label="Seeds" />
        <SummaryStat icon={Star} value={stats.stars} label="Stars" />
        <SummaryStat icon={Sparkles} value={stats.butterflies} label="Butterflies" />
      </div>

      {/* SUMMARY PANEL */}
      <div className="relative w-full max-w-md rounded-3xl border border-green/15 bg-gradient-to-br from-green-soft/70 to-green-soft/30 shadow-lg p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="font-body text-green/80 text-sm font-medium">Garden restored</span>
          <span className="font-body font-bold text-green text-base">{Math.round(stats.restoredPercent)}%</span>
        </div>

        <div className="h-2.5 rounded-full bg-white/70 overflow-hidden mb-4 shadow-inner">
          <div
            className="h-full rounded-full bg-green transition-all duration-700"
            style={{ width: `${stats.restoredPercent}%` }}
          />
        </div>

        <div className="h-px w-full bg-green/15 mb-4" />

        <div className="flex items-center justify-between">
          <span className="font-body text-green/80 text-sm font-medium">Session</span>
          <span className="font-body font-bold text-green text-base">{formatDuration(stats.sessionSeconds)}</span>
        </div>
      </div>

      {/* VISIT GARDEN AGAIN — no box-shadow (it would render as a rectangle
          behind the curvy bg-button-shape image); use a shape-following
          drop-shadow filter instead, and widen the pill itself */}
      <button
        type="button"
        onClick={onPlayAgain}
        className="bg-button-shape bg-contain bg-no-repeat bg-center font-body font-semibold text-background w-96 py-3 flex items-center justify-center gap-1 mt-2 transition-all hover:brightness-105"
        style={{ filter: "drop-shadow(0 6px 10px rgba(140,163,126,0.35))" }}
      >
        <IconReplay className="w-4 h-4" />
        Visit garden again
      </button>
    </div>
  );
}

function SummaryStat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Sprout;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-2xl p-3.5 flex flex-col items-center gap-1.5 bg-white/70 border border-green/15 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-8 h-8 rounded-full bg-green-soft flex items-center justify-center">
        <Icon className="w-4 h-4 text-green" />
      </div>
      <span className="font-body font-bold text-green text-xl leading-none">{value}</span>
      <span className="font-body text-text/50 text-xs">{label}</span>
    </div>
  );
}