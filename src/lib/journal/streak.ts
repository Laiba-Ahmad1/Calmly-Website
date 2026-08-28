// lib/journal/streak.ts
import Journal from "@/models/Journal";

export async function getJournalHistory(patientId: string) {
  const entries = await Journal.find({ patientId })
    .sort({ date: -1 })
    .select("date")
    .lean();

  if (!entries.length) {
    return { lastEntryDate: null, currentStreak: 0 };
  }

  const lastEntryDate = entries[0].date;

  // dedupe to calendar days, in case of multiple entries on the same day
  const dayKeys = new Set(
    entries.map((e) => new Date(e.date).toISOString().slice(0, 10))
  );

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  // if today has no entry yet, still count the streak as active if
  // yesterday has one — start checking from yesterday instead
  const todayKey = cursor.toISOString().slice(0, 10);
  if (!dayKeys.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (dayKeys.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { lastEntryDate, currentStreak: streak };
}