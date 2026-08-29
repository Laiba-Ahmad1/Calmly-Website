// src/lib/plant/growth.ts
const TOTAL_STAGES = 10;
const GROWTH_PER_STAGE = 50; // tune this — 50 points per stage, e.g.

export function calculateLevel(growth: number) {
  const level = Math.floor(growth / GROWTH_PER_STAGE) + 1;
  return Math.min(Math.max(level, 1), TOTAL_STAGES);
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