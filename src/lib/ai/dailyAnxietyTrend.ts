// src/lib/ai/dailyAnxietyTrend.ts
// Deterministic, per-day anxiety indicator derived from the only genuinely
// daily numeric signals in the database: Journal.mood (1–5, higher = better)
// and Journal.sleepQuality (1–5, higher = better). The quiz is weekly and
// exercise sessions have no anxiety valence, so neither is used here.
//
// The score is normalised to 0–1 where HIGHER = MORE anxiety (i.e. the
// polarity of mood/sleep is flipped). This matches how therapists think
// about the week: a rising line means a harder week, not a better one.

export type AnxietyLevel = "low" | "moderate" | "high" | "none";

export interface DailyAnxietyPoint {
  dayIndex: number; // 0..6 offset from weekStart
  date: Date;
  score: number | null; // 0–1 or null when no data
  level: AnxietyLevel;
  mood: number | null;
  sleepQuality: number | null;
}

interface JournalRow {
  date: Date;
  mood: number;
  sleepQuality: number;
}

const MOOD_WEIGHT = 0.55;
const SLEEP_WEIGHT = 0.45;

const LOW_CEIL = 1 / 3; // < 1/3  → low
const MOD_CEIL = 2 / 3; // < 2/3  → moderate; >= 2/3 → high

function clampInt(n: number, lo: number, hi: number): number | null {
  if (typeof n !== "number" || Number.isNaN(n)) return null;
  if (n < lo) return lo;
  if (n > hi) return hi;
  return n;
}

function levelForScore(score: number): AnxietyLevel {
  if (score < LOW_CEIL) return "low";
  if (score < MOD_CEIL) return "moderate";
  return "high";
}

// Invert a 1–5 rating to a 0–1 anxiety contribution (higher = more anxious).
function invertScale(value: number): number {
  return (5 - value) / 4;
}

// Bucket a journal entry by integer offset from weekStart. This avoids the
// latent UTC-string-bucketing bug elsewhere (toISOString().slice(0,10)
// shifts the day boundary to UTC midnight, which is wrong for patients in
// non-UTC timezones). Integer day offset is always correct relative to the
// report's own weekStart.
function bucketDay(entry: JournalRow, weekStart: Date): number {
  const ms = entry.date.getTime() - weekStart.getTime();
  return Math.floor(ms / 86_400_000);
}

export function computeDailyAnxietyTrend(
  entries: JournalRow[],
  weekStart: Date
): DailyAnxietyPoint[] {
  // Latest entry per day wins (entries arrive sorted ascending from the
  // query, so a later overwrite is the correct "most recent" semantics).
  const byDay = new Map<number, JournalRow>();
  for (const entry of entries) {
    const idx = bucketDay(entry, weekStart);
    if (idx < 0 || idx > 6) continue; // outside this week's window
    byDay.set(idx, entry);
  }

  const points: DailyAnxietyPoint[] = [];
  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
    const entry = byDay.get(dayIndex);
    const date = new Date(weekStart.getTime() + dayIndex * 86_400_000);

    if (!entry) {
      points.push({ dayIndex, date, score: null, level: "none", mood: null, sleepQuality: null });
      continue;
    }

    const mood = clampInt(entry.mood, 1, 5);
    const sleep = clampInt(entry.sleepQuality, 1, 5);

    if (mood === null && sleep === null) {
      points.push({ dayIndex, date, score: null, level: "none", mood: null, sleepQuality: null });
      continue;
    }

    // Reweight when one signal is missing — a lone mood=1 must still read
    // as high anxiety, not get diluted by a phantom neutral sleep value.
    let score: number;
    if (mood !== null && sleep !== null) {
      score = MOOD_WEIGHT * invertScale(mood) + SLEEP_WEIGHT * invertScale(sleep);
    } else if (mood !== null) {
      score = invertScale(mood);
    } else {
      score = invertScale(sleep as number);
    }

    points.push({
      dayIndex,
      date,
      score: Math.round(score * 1000) / 1000,
      level: levelForScore(score),
      mood,
      sleepQuality: sleep,
    });
  }

  return points;
}

// Compact line for the AI prompt. When fewer than 3 days have data we add
// an explicit "do not narrate" guard so the model doesn't spin a story
// around a single isolated bad day.
export function formatTrendForPrompt(points: DailyAnxietyPoint[]): string {
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const parts = points.map((p) => {
    const wd = labels[p.date.getUTCDay()];
    if (p.score === null) return `${wd}: no data`;
    return `${wd}: ${p.score.toFixed(2)} (${p.level})`;
  });

  const dataDays = points.filter((p) => p.score !== null).length;
  const header = `Daily mood & sleep indicator (${dataDays}/7 days have data; 0.00 = best mood+sleep, 1.00 = worst mood+sleep, plotted as recorded):`;
  const guard =
    dataDays < 3
      ? " [LESS THAN 3 DAYS OF DATA — do not describe any daily pattern from this row.]"
      : " [You may describe the week's shape observationally if >= 3 days show a coherent pattern.]";

  return `${header}\n${parts.join(", ")}${guard}`;
}
