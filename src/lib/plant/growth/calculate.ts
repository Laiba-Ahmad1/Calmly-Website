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
  const growth = Math.round(10 * ratio) + (completed ? 5 : 0);
  return { growth, completed };
}

export function scoreMemoryMatch(p: MemoryMatchPayload) {
  if (p.sessionSeconds < MIN_SECONDS) return { growth: 0, completed: false };
  const accuracy = p.attempts === 0 ? 0 : clamp01(p.matches / p.attempts);
  const growth = Math.round(15 * (p.matches / p.totalPairs)) 
    + Math.round(5 * accuracy) 
    + (p.won ? 5 : 0);
  return { growth, completed: p.won };
}

export function scoreSound(p: SoundPayload) {
  // Passive/ambient — reward listening time only, capped low since there's no active engagement to measure
  if (p.sessionSeconds < MIN_SECONDS) return { growth: 0, completed: false };
  const growth = Math.min(10, Math.floor(p.sessionSeconds / 30));
  return { growth, completed: true };
}

export function scoreGarden(p: GardenPayload) {
  if (p.sessionSeconds < MIN_SECONDS) return { growth: 0, completed: false };
  const completed = p.sessionSeconds >= p.targetSeconds;
  const restoreScore = Math.round(15 * clamp01(p.restoredPercent / 100));
  const collectibleBonus = Math.min(5, (p.seeds + p.stars * 2 + p.butterflies * 3) * 0.2);
  const growth = restoreScore + Math.round(collectibleBonus) + (completed ? 5 : 0);
  return { growth, completed };
}