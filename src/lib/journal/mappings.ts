// lib/journal/mappings.ts
export type SleepQuality = "restless" | "okay" | "good" | "refreshing";
export type Mood = "sad" | "low" | "okay" | "good" | "happy";

// Only 4 UI options but schema allows 1-5 — mapped to 1,2,4,5 (skipping 3)
// so "okay" and "good" stay clearly separated on the scale.
const SLEEP_TO_NUMBER: Record<SleepQuality, number> = {
  restless: 1,
  okay: 2,
  good: 4,
  refreshing: 5,
};

const MOOD_TO_NUMBER: Record<Mood, number> = {
  sad: 1,
  low: 2,
  okay: 3,
  good: 4,
  happy: 5,
};

export function sleepQualityToNumber(value: SleepQuality): number {
  return SLEEP_TO_NUMBER[value];
}

export function moodToNumber(value: Mood): number {
  return MOOD_TO_NUMBER[value];
}