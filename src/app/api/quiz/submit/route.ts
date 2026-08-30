// app/api/quiz/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import QuizQuestion from "@/models/QuizQuestion";
import QuizResult from "@/models/QuizResult";
import { calculateQuizScore } from "@/lib/quiz/calculateQuizScore";
import { getWeekWindow, getCurrentWeekNumber } from "@/lib/quiz/weeks";
import { getCurrentUser } from "@/lib/auth";
import PatientProfile from "@/models/PatientProfile";
import { incrementPlantGrowth } from "@/lib/plant/incrementGrowth";

export async function POST(req: NextRequest) {
  try {
    await db();

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const patientProfile = await PatientProfile.findOne({ userId: user._id });
    if (!patientProfile) {
      return NextResponse.json({ error: "Patient profile not found" }, { status: 404 });
    }

    const weekNumber = getCurrentWeekNumber(new Date(user.createdAt));
    const { weekStart, weekEnd } = getWeekWindow(new Date(user.createdAt), weekNumber);

    // block resubmission — this week's quiz can only be completed once
    const existingResult = await QuizResult.findOne({ userId: user._id, weekStart });
    if (existingResult) {
      return NextResponse.json(
        { error: "This week's quiz has already been submitted." },
        { status: 409 }
      );
    }

    const { responses } = await req.json();
    if (!Array.isArray(responses) || responses.length === 0) {
      return NextResponse.json(
        { error: "No answers to submit." },
        { status: 400 }
      );
    }
    const anxietyType = patientProfile.anxietyType;

    const questionIds = responses.map((r: any) => r.questionId);
    const questions = await QuizQuestion.find({ _id: { $in: questionIds } });

    const { processedResponses, dimensionScores, totalScore } = calculateQuizScore(
      questions,
      responses
    );

    // Most recent PRIOR week's result — rolling comparison, not a fixed week-1 baseline.
    // weekStart is strictly before this week's, so a resubmission-blocked week never counts itself.
    const previousResult = await QuizResult.findOne({
      userId: user._id,
      weekStart: { $lt: weekStart },
    }).sort({ weekStart: -1 });

    const result = await QuizResult.create({
      userId: user._id,
      anxietyType,
      weekStart,
      weekEnd,
      responses: processedResponses,
      dimensionScores,
      totalScore,
      maxScore: questions.length * 4,
      completedAt: new Date(),
    });

    // Growth = improvement vs. last week's score, not raw score itself.
    // Since higher totalScore = more struggle, growth only happens when the score DROPS.
    // No prior result (e.g. week 1) => nothing to compare against => no growth yet, baseline only.
    let growthAwarded = 0;
    if (previousResult) {
      const improvement = previousResult.totalScore - totalScore;
      growthAwarded = improvement > 0 ? 15 : 0;
    }

    const plant = growthAwarded > 0
      ? await incrementPlantGrowth(user._id, growthAwarded)
      : null;

    return NextResponse.json({
      success: true,
      result,
      plant,
      growthAwarded,
      comparedToPreviousScore: previousResult?.totalScore ?? null,
    });
  } catch (err) {
    console.error("Error submitting quiz:", err);
    return NextResponse.json({ error: "Failed to submit quiz" }, { status: 500 });
  }
}