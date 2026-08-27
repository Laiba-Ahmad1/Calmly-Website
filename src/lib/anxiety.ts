export const ANXIETY_TYPES = [
  "social",
  "health",
  "panic attacks",
  "general",
] as const;

export type AnxietyType = (typeof ANXIETY_TYPES)[number];