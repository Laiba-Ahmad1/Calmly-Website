// lib/plant/growth/calculateJournalGrowth.ts
import { compareJournalGrowth } from "@/lib/ai/compareJournalGrowth";

interface PreviousEntry {
  feelings: string;
  reflection: string;
  date: Date;
}

interface TodoItem {
  text: string;
  done: boolean;
}

interface JournalGrowthParams {
  mood: number; // 1-5
  sleepQuality: number; // 1-5
  feelings: string;
  reflection: string;
  todos: TodoItem[];
  previousEntries: PreviousEntry[]; // last 7 entries, oldest → newest
}

const JOURNAL_SUBMISSION_BONUS = 3; // flat, unconditional — awarded just for writing today
const IMPROVEMENT_BONUS = 2; // only if AI judges today's feelings/reflection better than the recent pattern
const TODO_COMPLETION_BONUS = 1; // per checked-off therapist task
const MIN_ENTRIES_FOR_COMPARISON = 7;

export async function calculateJournalGrowth({
  mood,
  sleepQuality,
  feelings,
  reflection,
  todos,
  previousEntries,
}: JournalGrowthParams): Promise<number> {
  // 0.5-increment wellbeing score: mood/sleep of 1→0.5, 2→1, 3→1.5, 4→2, 5→2.5
  const wellbeingGrowth = ((mood + sleepQuality) / 2) * 0.5;

  const completedTodosCount = todos.filter((t) => t.done).length;
  const todoGrowth = completedTodosCount * TODO_COMPLETION_BONUS;

  let growth = wellbeingGrowth + JOURNAL_SUBMISSION_BONUS + todoGrowth;

  if (previousEntries.length >= MIN_ENTRIES_FOR_COMPARISON) {
    const improved = await compareJournalGrowth({
      today: { feelings, reflection },
      previousEntries,
    });
    if (improved) growth += IMPROVEMENT_BONUS;
  }

  return growth;
}