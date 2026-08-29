// src/lib/ai/generatePatientReport.ts
import db from "@/lib/db";
import Journal from "@/models/Journal";
import QuizResult from "@/models/QuizResult";
import ExerciseSession from "@/models/ExerciseSession";
import PatientAIReport from "@/models/PatientAIReport";
import PatientProfile from "@/models/PatientProfile";
import Users from "@/models/User";
import { callAI } from "@/lib/quiz/aiClient";
import { getCurrentWeekNumber, getWeekWindow } from "@/lib/quiz/weeks";

function trend(current: number | null, previous: number | null): "up" | "down" | "flat" | null {
  if (current === null || previous === null) return null;
  if (current > previous) return "up";
  if (current < previous) return "down";
  return "flat";
}

function average(nums: number[]): number | null {
  if (!nums.length) return null;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10;
}

export async function generatePatientReport(userId: string) {
  await db();

  const user = await Users.findById(userId).select("createdAt");
  const patientProfile = await PatientProfile.findOne({ userId });
  if (!user || !patientProfile) return null;

  const currentWeekNumber = getCurrentWeekNumber(new Date(user.createdAt));
  if (currentWeekNumber < 2) return null; // no completed week yet

  const targetWeek = currentWeekNumber - 1;
  const { weekStart, weekEnd } = getWeekWindow(new Date(user.createdAt), targetWeek);

  const existing = await PatientAIReport.findOne({ userId, weekStart });
  if (existing) return existing;

  const [journalEntries, quizResult, exerciseSessions, previousReport] = await Promise.all([
    Journal.find({ patientId: userId, date: { $gte: weekStart, $lt: weekEnd } })
      .sort({ date: 1 })
      .select("date mood sleepQuality feelings reflection"),
    QuizResult.findOne({ userId, weekStart }),
    ExerciseSession.find({ userId, completedAt: { $gte: weekStart, $lt: weekEnd } })
      .select("type completed"),
    targetWeek > 1
      ? PatientAIReport.findOne({
          userId,
          weekStart: getWeekWindow(new Date(user.createdAt), targetWeek - 1).weekStart,
        })
      : null,
  ]);

  if (!journalEntries.length && !quizResult && !exerciseSessions.length) {
    return null; // nothing happened this week — don't generate an empty/invented report
  }

  // ---- Computed stats (never AI-generated — these are ground truth) ----
  const journalDays = new Set(journalEntries.map((e) => e.date.toISOString().slice(0, 10))).size;
  const moodAvg = average(journalEntries.map((e) => e.mood));
  const sleepAvg = average(journalEntries.map((e) => e.sleepQuality));

  const exerciseCounts: Record<string, number> = {};
  for (const session of exerciseSessions) {
    exerciseCounts[session.type] = (exerciseCounts[session.type] ?? 0) + 1;
  }

  const stats = {
    journalDays,
    moodAvg,
    moodTrend: trend(moodAvg, previousReport?.stats.moodAvg ?? null),
    sleepAvg,
    sleepTrend: trend(sleepAvg, previousReport?.stats.sleepAvg ?? null),
    quizCompleted: !!quizResult,
    quizTotalScore: quizResult?.totalScore ?? null,
    quizTrend: trend(quizResult?.totalScore ?? null, previousReport?.stats.quizTotalScore ?? null),
    exerciseCounts,
  };

  // ---- Build AI prompt, handing it the real numbers to narrate around ----
  const journalText = journalEntries.length
    ? journalEntries
        .map(
          (e) =>
            `[${e.date.toISOString().slice(0, 10)}] Mood: ${e.mood}/5, Sleep: ${e.sleepQuality}/5\nFeelings: ${e.feelings}\nReflection: ${e.reflection}`
        )
        .join("\n\n")
    : "(no journal entries this week)";

    const quizText = quizResult
    ? `Total score ${quizResult.totalScore}/${quizResult.maxScore} (higher = more struggle). Dimension scores: ${JSON.stringify(Object.fromEntries(quizResult.dimensionScores))}`
    : "(quiz not completed this week)";

  const prompt = `You are a clinical support assistant preparing a weekly report for a therapist about their patient. This is for the therapist's eyes only.

CRITICAL: Below are computed statistics — real numbers pulled directly from the database. Use these EXACT numbers when referencing counts, days, or trends. Do not invent, estimate, or round differently. Do not state any statistic not given below.

Computed stats for this week:
- Journal entries: ${stats.journalDays}/7 days
- Average mood: ${stats.moodAvg ?? "no data"}/5 (trend vs last week: ${stats.moodTrend ?? "no prior data"})
- Average sleep quality: ${stats.sleepAvg ?? "no data"}/5 (trend vs last week: ${stats.sleepTrend ?? "no prior data"})
- Quiz: ${stats.quizCompleted ? `completed, total score ${stats.quizTotalScore} (trend vs last week: ${stats.quizTrend ?? "no prior data"})` : "not completed"}
- Exercises completed: ${Object.entries(stats.exerciseCounts).map(([type, count]) => `${type}: ${count}`).join(", ") || "none"}

Patient's anxiety type: ${patientProfile.anxietyType}

Journal entries this week (for tone/context and identifying patterns/triggers only):
${journalText}

Quiz detail:
${quizText}

Write a report with these exact four sections. For "observedPatterns", weave in the computed stats above verbatim where relevant, plus any qualitative patterns you notice in the journal text (recurring topics, timing, triggers) — but never state a number that isn't in the computed stats above.

Respond as ONLY a JSON object in this exact shape, no markdown fences, no extra text:
{
  "weeklyOverview": "1-2 sentence headline of the week's overall trend",
  "observedPatterns": ["bullet 1", "bullet 2", "..."],
  "progress": "short paragraph on how the patient is trending over time",
  "suggestedAreas": ["area 1 for therapist to follow up on", "..."],
  "strugglingDimensions": ["dimension1", "dimension2"]
}`;

  const raw = await callAI(prompt, { maxTokens: 900, temperature: 0.4 });
  if (!raw) return null;

  let parsed: {
    weeklyOverview: string;
    observedPatterns: string[];
    progress: string;
    suggestedAreas: string[];
    strugglingDimensions: string[];
  };
  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    parsed = JSON.parse(cleaned);
  } catch (err) {
    console.error("Failed to parse AI report response:", raw, err);
    return null;
  }

  const report = await PatientAIReport.create({
    userId,
    weekNumber: targetWeek,
    weekStart,
    weekEnd,
    weeklyOverview: parsed.weeklyOverview,
    observedPatterns: parsed.observedPatterns ?? [],
    progress: parsed.progress,
    suggestedAreas: parsed.suggestedAreas ?? [],
    strugglingDimensions: parsed.strugglingDimensions ?? [],
    dimensionScores: quizResult?.dimensionScores
      ? Object.fromEntries(quizResult.dimensionScores)
      : {},
    stats,
  });

  return report;
}