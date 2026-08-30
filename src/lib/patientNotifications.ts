// src/lib/patientNotifications.ts
// Lazily materializes patient-facing availability notifications (quiz ready,
// journal due). Runs from the patient layout: each check is an indexed lookup
// and dedupeKey-guarded, so this never creates duplicates or spam.
import db from "@/lib/db";
import Journal from "@/models/Journal";
import QuizResult from "@/models/QuizResult";
import { getCurrentWeekNumber, getWeekWindow } from "@/lib/quiz/weeks";
import { getPakistanDayStart, getPakistanDayEnd } from "@/lib/journal/today";
import { createNotification } from "@/lib/notifications";

export async function ensurePatientNotifications(
  userId: string,
  accountCreatedAt: Date
) {
  try {
    const weekNumber = getCurrentWeekNumber(new Date(accountCreatedAt));
    const { weekStart } = getWeekWindow(new Date(accountCreatedAt), weekNumber);

    const [quizSubmitted, todaysJournal] = await Promise.all([
      QuizResult.findOne({ userId, weekStart }).select("_id").lean(),
      Journal.findOne({
        patientId: userId,
        date: { $gte: getPakistanDayStart(), $lt: getPakistanDayEnd() },
      })
        .select("_id")
        .lean(),
    ]);

    const dayKey = getPakistanDayStart().toISOString().slice(0, 10);

    await Promise.all([
      !quizSubmitted &&
        createNotification({
          recipientId: userId,
          type: "quiz_available",
          title: "Your weekly quiz is ready",
          message: `Week ${weekNumber}'s check-in quiz is available to take.`,
          link: "/quiz",
          dedupeKey: `quiz:${userId}:${weekNumber}`,
        }),
      !todaysJournal &&
        createNotification({
          recipientId: userId,
          type: "journal_due",
          title: "Your journal is ready",
          message: "Take a moment to write today's journal entry.",
          link: "/journal",
          dedupeKey: `journal:${userId}:${dayKey}`,
        }),
    ]);
  } catch (err) {
    // availability notifications are best-effort — never break page rendering
    console.error("ensurePatientNotifications failed:", err);
  }
}
