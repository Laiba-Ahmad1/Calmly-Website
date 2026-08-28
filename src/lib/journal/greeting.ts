// src/lib/journal/greeting.ts

/**
 * Pure function — computes the greeting/streak message for the top of the
 * journal page. Kept separate from the component so it's easy to test and
 * to swap the data source later (currently fed from GET /api/journal/history).
 *
 * lastEntryDate: date of the user's most recent journal entry, or null if
 *   they've never written one.
 * currentStreak: consecutive days written up to and including lastEntryDate.
 */
export function getJournalGreeting(
  lastEntryDate: Date | null,
  currentStreak: number
): string {
  if (!lastEntryDate) {
    return "Welcome to your journal — this is where it starts.";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const last = new Date(lastEntryDate);
  last.setHours(0, 0, 0, 0);

  const daysSinceLastEntry = Math.round(
    (today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
  );

  // wrote yesterday or today, and has a real streak going -> praise consistency
  if (daysSinceLastEntry <= 1 && currentStreak > 1) {
    return `${currentStreak} days in a row — you're building a real habit.`;
  }

  // wrote yesterday or today, but streak is only 1 -> gentle continuation, no big claim yet
  if (daysSinceLastEntry <= 1) {
    return "Good to see you again — let's keep going.";
  }

  // gap of 2+ days since last entry -> streak broke, reframe as a fresh start
  return "You started your journal journey.";
}