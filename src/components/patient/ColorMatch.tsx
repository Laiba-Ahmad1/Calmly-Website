// src/components/patient/ColorMatch.tsx
"use client";

import { useEffect, useState } from "react";

const PALETTE = [
  "#BAFFC9", // green
  "#FFCCE5", // pink
  "#BAE1FF", // blue
  "#FFFFBA", // butter
  "#DABAFF", // lavender
  "#C8F0D2", // mint
  "#F5DCFF", // soft pink
  "#DCEBFF", // sky
];

const CARD_DOWN = "#D6E6D2";
const CONFETTI_COLORS = ["bg-green", "bg-lavender", "bg-peach"];

type Card = { id: number; color: string; matched: boolean };

function buildDeck(): Card[] {
  const doubled = [...PALETTE, ...PALETTE];
  const shuffled = doubled
    .map((color) => ({ color, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map((c, id) => ({ id, color: c.color, matched: false }));
  return shuffled;
}

export default function ColorMatch({ onBack }: { onBack?: () => void }) {
  const [deck, setDeck] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [won, setWon] = useState(false);

  useEffect(() => {
    startGame();
  }, []);

  const startGame = () => {
    setDeck(buildDeck());
    setFlipped([]);
    setMatches(0);
    setAttempts(0);
    setWon(false);
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
        }
      } else {
        setTimeout(() => setFlipped([]), 700);
      }
    }
  };

  const accuracy = attempts === 0 ? 0 : Math.round((matches / attempts) * 100);
  const progressPct = Math.round((matches / PALETTE.length) * 100);

  return (
    <div className="flex flex-col items-center gap-7 bg-background rounded-3xl p-6 md:p-10">
      <div className="flex items-start justify-between w-full max-w-md">
        <div>
          <h2 className="font-logo text-heading text-3xl md:text-4xl">Color Match</h2>
          <p className="font-body text-text/55 text-sm mt-1">Find every pair, calmly.</p>
        </div>
        {onBack && (
          <button onClick={onBack} className="font-body text-sm text-heading underline underline-offset-4 shrink-0 mt-1">
            Back
          </button>
        )}
      </div>

      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-body text-xs text-text/60">
            {matches} of {PALETTE.length} pairs
          </span>
          <span className="font-body text-xs text-text/60">{attempts} attempts</span>
        </div>
        <div className="h-2 rounded-full bg-white/70 overflow-hidden">
          <div
            className="h-full bg-green rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="absolute -top-6 -left-8 w-24 h-24 rounded-full bg-lavendersoft/40 blur-md pointer-events-none" />
        <div className="absolute -bottom-6 -right-8 w-24 h-24 rounded-full bg-peachsoft/40 blur-md pointer-events-none" />

        <div className="relative grid grid-cols-4 gap-3 w-full">
          {deck.map((card) => {
            const isFaceUp = card.matched || flipped.includes(card.id);
            return (
              <button
                key={card.id}
                onClick={() => handleTileClick(card.id)}
                disabled={card.matched}
                className={`aspect-square rounded-2xl transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-green/50 [-webkit-tap-highlight-color:transparent] ${
                  isFaceUp ? "shadow-md tile-pop" : "shadow-sm border border-text/10 hover:border-text/25 hover:-translate-y-0.5"
                } ${card.matched ? "opacity-70 ring-2 ring-white" : ""}`}
                style={{ backgroundColor: isFaceUp ? card.color : CARD_DOWN }}
                aria-label={isFaceUp ? "revealed tile" : "hidden tile"}
              />
            );
          })}
        </div>
      </div>

      {won && (
        <div className="relative flex flex-col items-center gap-3 bg-white/85 border border-green/15 rounded-2xl p-6 max-w-md text-center shadow-sm overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 10 }).map((_, i) => (
              <span
                key={i}
                className={`absolute top-0 w-1.5 h-1.5 rounded-full confetti-fall ${CONFETTI_COLORS[i % 3]}`}
                style={{
                  left: `${(i * 97) % 100}%`,
                  animationDelay: `${(i % 5) * 0.15}s`,
                }}
              />
            ))}
          </div>
          <p className="font-logo text-heading text-2xl">All pairs matched!</p>
          <p className="font-body text-text/70 text-sm">
            Attempts: {attempts} · Accuracy: {accuracy}%
          </p>
          <button
            onClick={startGame}
            className="bg-button-shape bg-contain bg-no-repeat bg-center font-body font-semibold text-background w-36 py-3 mt-1 outline-none [-webkit-tap-highlight-color:transparent]"
          >
            Play Again
          </button>
        </div>
      )}

      {!won && (
        <button
          onClick={startGame}
          className="font-body text-sm text-heading underline underline-offset-4 outline-none [-webkit-tap-highlight-color:transparent]"
        >
          Restart
        </button>
      )}

      <style>{`
        .tile-pop {
          animation: tile-pop 260ms cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes tile-pop {
          0%   { transform: scale(0.85); }
          60%  { transform: scale(1.06); }
          100% { transform: scale(1); }
        }
        .confetti-fall {
          animation: confetti-fall 1.4s ease-in forwards;
        }
        @keyframes confetti-fall {
          0%   { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(140px) rotate(200deg); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .tile-pop, .confetti-fall { animation: none; }
        }
      `}</style>
    </div>
  );
}