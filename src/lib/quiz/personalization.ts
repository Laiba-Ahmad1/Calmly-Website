// lib/quiz/personalization.ts
import QuizQuestion, { IQuizQuestion } from "@/models/QuizQuestion";
import QuizResult from "@/models/QuizResult";
import QuizAssignment from "@/models/QuizAssignmet";
import { AnxietyType } from "@/lib/anxiety";
import { getWeekWindow, getCurrentWeekNumber } from "@/lib/quiz/weeks";
import { analyzeJournalDimensions } from "@/lib/quiz/journalDimensions";
import mongoose from "mongoose";
import { generatePersonalizedQuestion } from "@/lib/quiz/generatePersonalizedQuestion";

const QUESTIONS_PER_WEEK = 5;
const AI_GENERATED_SLOTS = 3; // cap how many AI questions get generated per week
const EXCLUSION_WEEKS = 2; // don't repeat a question asked in the last N weeks
const QUIZ_WEIGHT = 0.6;
const JOURNAL_WEIGHT = 0.4;

interface GetQuizForUserParams {
  userId: string;
  anxietyType: AnxietyType;
  accountCreatedAt: Date;
}

export async function getQuizForUser({
  userId,
  anxietyType,
  accountCreatedAt,
}: GetQuizForUserParams) {
  const weekNumber = getCurrentWeekNumber(accountCreatedAt);
  const { weekStart, weekEnd } = getWeekWindow(accountCreatedAt, weekNumber);

  // Already generated this week's quiz? Return it (idempotent).
  const existing = await QuizAssignment.findOne({ userId, weekStart });
  if (existing) {
    const questions = await QuizQuestion.find({
      _id: { $in: existing.questionIds },
      active: true,
    });
    return { weekNumber, questions, source: existing.source };
  }

 const questions =
    weekNumber === 1
      ? await selectBaselineQuestions(anxietyType)
      : await selectPersonalizedQuestions({ userId, anxietyType, weekStart });

  if (questions.length === 0) {
    // Don't cache a broken result — next request will retry from scratch instead of being stuck all week
    console.error(`getQuizForUser: got 0 questions for user ${userId}, week ${weekNumber}`);
    return { weekNumber, questions: [], source: "none" };
  }

  await QuizAssignment.create({
    userId,
    anxietyType,
    weekNumber,
    weekStart,
    weekEnd,
    questionIds: questions.map((q) => q._id),
    source: weekNumber === 1 ? "baseline" : "personalized",
  });

  return { weekNumber, questions, source: weekNumber === 1 ? "baseline" : "personalized" };
}

// ---- Week 1: one question per dimension, seed order, up to 5 ----
async function selectBaselineQuestions(anxietyType: AnxietyType) {
  const all = await QuizQuestion.find({
  anxietyType,
  active: true,
  generated: false,
}).sort({ createdAt: 1 });

  const seenDimensions = new Set<string>();
  const picked: IQuizQuestion[] = [];

  for (const q of all) {
    if (picked.length >= QUESTIONS_PER_WEEK) break;
    if (!seenDimensions.has(q.dimension)) {
      seenDimensions.add(q.dimension);
      picked.push(q);
    }
  }

  // fewer than 5 dimensions exist -> backfill with whatever's left, in order
  if (picked.length < QUESTIONS_PER_WEEK) {
    for (const q of all) {
      if (picked.length >= QUESTIONS_PER_WEEK) break;
      if (!picked.find((p) => p._id.equals(q._id))) picked.push(q);
    }
  }

  return picked;
}

// ---- Week 2+: weighted by quiz history + journal signal ----
async function selectPersonalizedQuestions({
  userId,
  anxietyType,
  weekStart,
}: {
  userId: string;
  anxietyType: AnxietyType;
  weekStart: Date;
}) {
  const allQuestions = await QuizQuestion.find({
  anxietyType,
  active: true,
  $or: [
    { generated: false },
    { generated: true, generatedForUserId: userId },
  ],
});
  const dimensions = [...new Set(allQuestions.map((q) => q.dimension))];

  const quizWeights = await getQuizBasedDimensionWeights(userId, dimensions);
  const journalWeights = await analyzeJournalDimensions(userId, dimensions).catch(() => null);

  const combinedWeights: Record<string, number> = {};
  for (const dim of dimensions) {
    const quizW = quizWeights[dim] ?? 0.5; // no history yet -> neutral
    const journalW = journalWeights?.[dim] ?? quizW; // fall back to quiz signal if AI fails/unavailable
    combinedWeights[dim] = QUIZ_WEIGHT * quizW + JOURNAL_WEIGHT * journalW;
  }

  const rankedDimensions = dimensions.sort(
    (a, b) => combinedWeights[b] - combinedWeights[a]
  );
  
  const dimensionsNeedingQuestions = rankedDimensions
  .filter(
    (dimension) =>
      !allQuestions.some(
        (question) =>
          question.dimension === dimension &&
          question.generated &&
          question.generatedForUserId?.toString() === userId
      )
  )
    .slice(0, AI_GENERATED_SLOTS); // was QUESTIONS_PER_WEEK — capped generation to top 3 weakest dims

const generatedQuestions = await Promise.all(
  dimensionsNeedingQuestions.map((dimension) =>
    generatePersonalizedQuestion({
      userId,
      anxietyType,
      dimension,
      struggleScore: combinedWeights[dimension],
    }).catch(() => null)
  )
);

for (const question of generatedQuestions) {
  if (question !== null) {
    allQuestions.unshift(question);
  }
}

  const excludedIds = await getRecentlyAskedQuestionIds(userId, weekStart);

  const picked: IQuizQuestion[] = [];
  const usedIds = new Set(excludedIds.map((id) => id.toString()));

  // pass 1: pull from weakest dimensions first, 1 unseen question each
  for (const dim of rankedDimensions) {
    if (picked.length >= QUESTIONS_PER_WEEK) break;
    const candidate = allQuestions.find(
      (q) => q.dimension === dim && !usedIds.has(q._id.toString())
    );
    if (candidate) {
      picked.push(candidate);
      usedIds.add(candidate._id.toString());
    }
  }

  // pass 2: still short (small question bank) -> allow repeats from weakest dims,
  // ignoring the recency exclusion, before falling back to fully random
  if (picked.length < QUESTIONS_PER_WEEK) {
    for (const dim of rankedDimensions) {
      if (picked.length >= QUESTIONS_PER_WEEK) break;
      const candidate = allQuestions.find(
        (q) =>
          q.dimension === dim &&
          !picked.find((p) => p._id.equals(q._id))
      );
      if (candidate) picked.push(candidate);
    }
  }

  // pass 3: absolute fallback, fill randomly from whatever's left
  if (picked.length < QUESTIONS_PER_WEEK) {
    const remaining = allQuestions.filter(
      (q) => !picked.find((p) => p._id.equals(q._id))
    );
    while (picked.length < QUESTIONS_PER_WEEK && remaining.length) {
      const idx = Math.floor(Math.random() * remaining.length);
      picked.push(remaining.splice(idx, 1)[0]);
    }
  }

  return picked;
}

// Recency-weighted average score per dimension, normalized 0-1 (0=fine, 1=struggling most)
async function getQuizBasedDimensionWeights(
  userId: string,
  dimensions: string[]
): Promise<Record<string, number>> {
  const pastResults = await QuizResult.find({ userId })
    .sort({ weekStart: -1 })
    .limit(6); // last ~6 weeks

  if (!pastResults.length) return {};

  const dimensionTotals: Record<string, { weightedSum: number; weightTotal: number }> = {};

  pastResults.forEach((result, idx) => {
    // more recent weeks get more weight: most recent = 1.0, decaying by 0.15 per week back
    const recencyWeight = Math.max(0.25, 1 - idx * 0.15);

    result.responses.forEach((r) => {
      if (!dimensionTotals[r.dimension]) {
        dimensionTotals[r.dimension] = { weightedSum: 0, weightTotal: 0 };
      }
      const normalizedScore = r.score / 4; // 0-1, higher = more struggle
      dimensionTotals[r.dimension].weightedSum += normalizedScore * recencyWeight;
      dimensionTotals[r.dimension].weightTotal += recencyWeight;
    });
  });

  const weights: Record<string, number> = {};
  for (const dim of dimensions) {
    const totals = dimensionTotals[dim];
    weights[dim] = totals ? totals.weightedSum / totals.weightTotal : 0.5;
  }
  return weights;
}

async function getRecentlyAskedQuestionIds(userId: string, weekStart: Date) {
  const cutoff = new Date(weekStart);
  cutoff.setDate(cutoff.getDate() - EXCLUSION_WEEKS * 7);

  const recentAssignments = await QuizAssignment.find({
    userId,
    weekStart: { $gte: cutoff, $lt: weekStart },
  });

  return recentAssignments.flatMap((a) => a.questionIds) as mongoose.Types.ObjectId[];
}