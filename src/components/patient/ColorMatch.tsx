// src/components/patient/ColorMatch.tsx
"use client";

import { useEffect, useState } from "react";
import { Leaf, Sparkles, Clock, CheckCircle2, Repeat } from "lucide-react";

const PALETTE = [
  "#BAFFC9", "#FFCCE5", "#BAE1FF", "#FFFFBA",
  "#DABAFF", "#C8F0D2", "#F5DCFF", "#DCEBFF",
];

const CARD_DOWN = "bg-green";
const CONFETTI_COLORS = ["bg-green", "bg-lavender", "bg-peach"];

type Card = { id: number; color: string; matched: boolean };

function buildDeck(): Card[] {
  const doubled = [...PALETTE, ...PALETTE];
  return doubled
    .map((color) => ({ color, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map((c, id) => ({ id, color: c.color, matched: false }));
}

function SproutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/80">
      <path d="M12 21V11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 13c0-4 3-6 6-6-.5 4-2.5 6-6 6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 15c0-3.2-2.4-4.8-4.8-4.8.4 3.2 2 4.8 4.8 4.8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

export default function ColorMatch({ onBack }: { onBack?: () => void }) {
  const [deck, setDeck] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [won, setWon] = useState(false);
  const [sessionMs, setSessionMs] = useState(0);

  useEffect(() => {
    startGame();
  }, []);

  useEffect(() => {
    if (won) return;
    const t = setInterval(() => setSessionMs((s) => s + 1000), 1000);
    return () => clearInterval(t);
  }, [won]);

  const startGame = () => {
    setDeck(buildDeck());
    setFlipped([]);
    setMatches(0);
    setAttempts(0);
    setWon(false);
    setSessionMs(0);
  };

  const handleTileClick = (id: number) => {
    if (flipped.length === 2) return;
    if (flipped.includes(id)) return;
    const card = deck.find((c) => c.id === id);
    if (!card || card.matched) return;

    const nextFlipped = [...flipped, id];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      const [firstId, secondId] = nextFlipped;
      const first = deck.find((c) => c.id === firstId)!;
      const second = deck.find((c) => c.id === secondId)!;
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (first.color === second.color) {
        const updated = deck.map((c) =>
          c.id === firstId || c.id === secondId ? { ...c, matched: true } : c
        );
        setDeck(updated);
        setFlipped([]);
        const newMatches = matches + 1;
        setMatches(newMatches);

        if (newMatches === PALETTE.length) {
          setWon(true);
          fetch("/api/exercises/submit", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    type: "memory_match",
    payload: {
      matches: newMatches, attempts, totalPairs: PALETTE.length,
      won: true, sessionSeconds: sessionMs / 1000,
    },
  }),
});
        }
      } else {
        setTimeout(() => setFlipped([]), 700);
      }
    }
  };

  const accuracy = attempts === 0 ? 0 : Math.round((matches / attempts) * 100);

  return (
    <div className="relative flex flex-col items-center gap-2 px-6 py-3">
      <Sparkles className="pointer-events-none absolute top-2 right-6 w-4 h-4 text-green/40" />
      <Sparkles className="pointer-events-none absolute bottom-6 left-6 w-3 h-3 text-lavender/40" />

      <div className="relative flex items-start justify-between w-full">
        <div>
          <h2 className="font-heading text-heading text-2xl md:text-3xl flex items-center gap-2">
            Color Match
            <Leaf className="w-5 h-5 text-green" />
          </h2>
          <p className="font-body text-text/55 text-xs mt-0.5">Find every pair, calmly.</p>
        </div>
        {onBack && (
          <button onClick={onBack} className="font-body text-sm text-heading underline underline-offset-4 shrink-0 mt-1">
            Back
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <div className="flex items-center gap-2 rounded-2xl bg-greensoft/60 border border-white/80 px-4 py-2 shadow-sm">
          <span className="w-7 h-7 rounded-full bg-green/80 text-white flex items-center justify-center shrink-0">
            <Clock className="w-3.5 h-3.5" />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="font-body text-[10px] text-text/60">Time</span>
            <span className="font-body font-bold text-heading text-base tabular-nums">{sessionMs / 1000}s</span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-2xl bg-lavendersoft/60 border border-white/80 px-4 py-2 shadow-sm">
          <span className="w-7 h-7 rounded-full bg-lavender/80 text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="font-body text-[10px] text-text/60">Pairs</span>
            <span className="font-body font-bold text-heading text-base tabular-nums">{matches}/{PALETTE.length}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-2xl bg-peachsoft/60 border border-white/80 px-4 py-2 shadow-sm">
          <span className="w-7 h-7 rounded-full bg-peach/80 text-white flex items-center justify-center shrink-0">
            <Repeat className="w-3.5 h-3.5" />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="font-body text-[10px] text-text/60">Attempts</span>
            <span className="font-body font-bold text-heading text-base tabular-nums">{attempts}</span>
          </div>
        </div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="absolute -top-4 -left-6 w-16 h-16 rounded-full bg-lavendersoft/40 blur-md pointer-events-none" />
        <div className="absolute -bottom-4 -right-6 w-16 h-16 rounded-full bg-peachsoft/40 blur-md pointer-events-none" />

        <div className="relative grid grid-cols-4 gap-2 w-full">
          {deck.map((card) => {
            const isFaceUp = card.matched || flipped.includes(card.id);
            return (
              <button
                key={card.id}
                onClick={() => handleTileClick(card.id)}
                disabled={card.matched}
                className={`aspect-square rounded-xl transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-green/50 [-webkit-tap-highlight-color:transparent] flex items-center justify-center ${
                  isFaceUp
                    ? "shadow-md tile-pop"
                    : `${CARD_DOWN} shadow-sm border border-text/10 hover:border-text/25 hover:-translate-y-0.5`
                } ${card.matched ? "opacity-70 ring-2 ring-white" : ""}`}
                style={isFaceUp ? { backgroundColor: card.color } : undefined}
                aria-label={isFaceUp ? "revealed tile" : "hidden tile"}
              >
                {!isFaceUp && <SproutIcon />}
              </button>
            );
          })}
        </div>
      </div>

      {won && (
        <div className="relative flex flex-col items-center gap-2 bg-white/85 border border-green/15 rounded-2xl p-4 max-w-md text-center shadow-sm overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 10 }).map((_, i) => (
              <span
                key={i}
                className={`absolute top-0 w-1.5 h-1.5 rounded-full confetti-fall ${CONFETTI_COLORS[i % 3]}`}
                style={{ left: `${(i * 97) % 100}%`, animationDelay: `${(i % 5) * 0.15}s` }}
              />
            ))}
          </div>
          <p className="font-heading text-heading text-xl">All pairs matched!</p>
          <p className="font-body text-text/70 text-sm">Attempts: {attempts} · Accuracy: {accuracy}%</p>
          <button
            onClick={startGame}
            className="bg-button-shape bg-contain bg-no-repeat bg-center font-body font-semibold text-background w-32 py-2.5 outline-none [-webkit-tap-highlight-color:transparent]"
          >
            Play Again
          </button>
        </div>
      )}

      {!won && (
        <button
          onClick={startGame}
          className="bg-button-shape bg-contain bg-no-repeat bg-center font-body font-semibold text-background w-32 py-2.5 outline-none [-webkit-tap-highlight-color:transparent]"
        >
          Restart
        </button>
      )}

      <style>{`
        .tile-pop { animation: tile-pop 260ms cubic-bezier(0.34, 1.56, 0.64, 1); }
        @keyframes tile-pop { 0% { transform: scale(0.85); } 60% { transform: scale(1.06); } 100% { transform: scale(1); } }
        .confetti-fall { animation: confetti-fall 1.4s ease-in forwards; }
        @keyframes confetti-fall { 0% { transform: translateY(-10px) rotate(0deg); opacity: 1; } 100% { transform: translateY(140px) rotate(200deg); opacity: 0; } }
        @media (prefers-reduced-motion: reduce) { .tile-pop, .confetti-fall { animation: none; } }
      `}</style>
    </div>
  );
}