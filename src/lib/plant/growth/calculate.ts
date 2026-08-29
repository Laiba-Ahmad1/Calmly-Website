// src/lib/plant/growth/calculate.ts
import type {
  BreathingPayload,
  MemoryMatchPayload,
  SoundPayload,
  GardenPayload,
} from "./types";

const MIN_SECONDS = 20; // sessions shorter than this earn nothing — stops accidental/abandoned sessions from scoring

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export function scoreBreathing(p: BreathingPayload) {
  if (p.sessionSeconds < MIN_SECONDS) return { growth: 0, completed: false };
  const ratio = clamp01(p.cycleCount / p.targetCycles);
  const completed = p.cycleCount >= p.targetCycles;
  const growth = Math.round((2 * ratio) + (completed ? 1 : 0));
  return { growth, completed };
}

export function scoreMemoryMatch(p: MemoryMatchPayload) {
  if (p.sessionSeconds < MIN_SECONDS) return { growth: 0, completed: false };
  const accuracy = p.attempts === 0 ? 0 : clamp01(p.matches / p.attempts);
  const growth = Math.round(1.8 * (p.matches / p.totalPairs))
    + Math.round(0.6 * accuracy)
    + (p.won ? 0.6 : 0);
  return { growth: Math.round(growth), completed: p.won };
}

export function scoreSound(p: SoundPayload) {
  // Passive/ambient — reward listening time only, capped low since there's no active engagement to measure
  if (p.sessionSeconds < MIN_SECONDS) return { growth: 0, completed: false };
  const growth = Math.min(3, Math.floor(p.sessionSeconds / 30) * 1.5);
  return { growth: Math.round(growth), completed: true };
}

export function scoreGarden(p: GardenPayload) {
  if (p.sessionSeconds < MIN_SECONDS) return { growth: 0, completed: false };
  const completed = p.sessionSeconds >= p.targetSeconds;
  const growth = Math.round(
    3 * clamp01(p.restoredPercent / 100) +
    Math.min(1, (p.seeds + p.stars * 2 + p.butterflies * 3) * 0.04) +
    (completed ? 1 : 0)
  );
  return { growth, completed };
}