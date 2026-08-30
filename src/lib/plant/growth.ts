// src/lib/plant/growth.ts
const TOTAL_STAGES = 10;

// Cumulative growth required to reach each level, starting from level 2:
// level 2 needs 50, level 3 needs 50+75=125, level 4 needs 125+100=225, etc.
// — each stage costs 25 more than the one before it, starting at 50.
const LEVEL_THRESHOLDS: number[] = (() => {
  const thresholds: number[] = [];
  let cumulative = 0;
  let stageCost = 50;
  for (let level = 2; level <= TOTAL_STAGES; level++) {
    cumulative += stageCost;
    thresholds.push(cumulative); // thresholds[i] = growth needed to reach level i + 2
    stageCost += 25;
  }
  return thresholds;
})();

export function calculateLevel(growth: number) {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (growth >= LEVEL_THRESHOLDS[i]) {
      level = i + 2;
    } else {
      break;
    }
  }
  return Math.min(Math.max(level, 1), TOTAL_STAGES);
}

// Growth needed to reach the NEXT level from wherever the patient is now —
// useful for a "X more to grow" progress readout. Returns null once maxed out.
export function getGrowthForNextLevel(currentLevel: number): number | null {
  if (currentLevel >= TOTAL_STAGES) return null;
  return LEVEL_THRESHOLDS[currentLevel - 1]; // threshold to reach (currentLevel + 1)
}

export function getPlantStage(level: number) {
  return Math.min(Math.max(Math.round(level), 1), TOTAL_STAGES);
}

export function getPlantImage(level: number) {
  const stage = getPlantStage(level);
  return `/plants/plant-${stage}.png`; // plant-1.png (baby) ... plant-10.png (fully grown)
}

export function getPlantStageLabel(level: number) {
  const stage = getPlantStage(level);
  return stage === TOTAL_STAGES ? "Fully grown" : `Stage ${stage}`;
}