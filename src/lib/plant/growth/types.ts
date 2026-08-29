// src/lib/plant/growth/types.ts
export type BreathingPayload = {
  pattern: string;
  targetCycles: number;
  cycleCount: number;
  sessionSeconds: number;
};

export type MemoryMatchPayload = {
  matches: number;
  attempts: number;
  totalPairs: number;
  won: boolean;
  sessionSeconds: number;
};

export type SoundPayload = {
  soundKey: "nature" | "rain" | "ocean";
  sessionSeconds: number;
};

export type GardenPayload = {
  mode: "camera" | "demo";
  seeds: number;
  stars: number;
  butterflies: number;
  restoredPercent: number;
  sessionSeconds: number;
  targetSeconds: number;
};

export type ExercisePayload =
  | { type: "breathing"; payload: BreathingPayload }
  | { type: "memory_match"; payload: MemoryMatchPayload }
  | { type: "sound"; payload: SoundPayload }
  | { type: "garden"; payload: GardenPayload };