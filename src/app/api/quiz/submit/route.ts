// app/api/quiz/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import QuizQuestion from "@/models/QuizQuestion";
import QuizResult from "@/models/QuizResult";
import { calculateQuizScore } from "@/lib/quiz/calculateQuizScore";
import { getWeekWindow, getCurrentWeekNumber } from "@/lib/quiz/weeks";
import { getCurrentUser } from "@/lib/auth";
import PatientProfile from "@/models/PatientProfile";

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
    const anxietyType = patientProfile.anxietyType;

    const questionIds = responses.map((r: any) => r.questionId);
    const questions = await QuizQuestion.find({ _id: { $in: questionIds } });

    const { processedResponses, dimensionScores, totalScore } = calculateQuizScore(
      questions,
      responses
    );

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

    return NextResponse.json({ success: true, result });
  } catch (err) {
    console.error("Error submitting quiz:", err);
    return NextResponse.json({ error: "Failed to submit quiz" }, { status: 500 });
  }
}