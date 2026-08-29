// lib/plant/growth/calculateJournalGrowth.ts

interface JournalGrowthParams {
  mood: number;          // 1-5
  sleepQuality: number;  // 1-5
  feelings: string;
  reflection: string;
}

const FEELINGS_WRITE_BONUS = 5;
const REFLECTION_WRITE_BONUS = 5;

export function calculateJournalGrowth({
  mood,
  sleepQuality,
  feelings,
  reflection,
}: JournalGrowthParams) {
  // Averaged (not summed) so a great mood + great sleep day caps at 5,
  // keeping the max entry around 15 total in line with other exercises.
  const wellbeingGrowth = Math.round((mood + sleepQuality) / 2); // range: 1-5

  const feelingsBonus = feelings.trim().length > 0 ? FEELINGS_WRITE_BONUS : 0;
  const reflectionBonus = reflection.trim().length > 0 ? REFLECTION_WRITE_BONUS : 0;

  return wellbeingGrowth + feelingsBonus + reflectionBonus;
}