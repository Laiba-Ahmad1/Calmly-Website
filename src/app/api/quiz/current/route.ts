// app/api/quiz/current/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getQuizForUser } from "@/lib/quiz/personalization";
import { getCurrentUser } from "@/lib/auth";
import PatientProfile from "@/models/PatientProfile";

export async function GET() {
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

    const { weekNumber, questions, source } = await getQuizForUser({
      userId: user._id.toString(),
      anxietyType: patientProfile.anxietyType,
      accountCreatedAt: new Date(user.createdAt),
    });

    return NextResponse.json({
      weekNumber,
      source,
      questions: questions.map((q) => ({
        id: q._id,
        question: q.question,
        dimension: q.dimension,
        options: q.options.map((o) => o.text),
      })),
    });
  } catch (err) {
    console.error("Error fetching quiz:", err);
    return NextResponse.json({ error: "Failed to fetch quiz" }, { status: 500 });
  }
}