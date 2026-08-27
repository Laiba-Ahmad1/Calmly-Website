// lib/quiz/weeks.ts

// Anchors weeks to the user's account creation date, not the calendar.
// weekNumber 1 = the 7 days starting at accountCreatedAt.
export function getWeekWindow(accountCreatedAt: Date, weekNumber: number) {
  const weekStart = new Date(accountCreatedAt);
  weekStart.setDate(weekStart.getDate() + (weekNumber - 1) * 7);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  return { weekStart, weekEnd };
}

export function getCurrentWeekNumber(accountCreatedAt: Date, now: Date = new Date()) {
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const diff = now.getTime() - accountCreatedAt.getTime();
  return Math.max(1, Math.floor(diff / msPerWeek) + 1);
}