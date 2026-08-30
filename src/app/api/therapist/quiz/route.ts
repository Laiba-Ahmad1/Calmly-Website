// GET /api/therapist/quiz?patientId=... — planned questions for the upcoming week
// POST /api/therapist/quiz — save therapist edits for the upcoming week
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getUpcomingQuizForPatient,
  saveQuizQuestionEdits,
} from "@/lib/therapist/quizReview";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "therapist") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const patientId = req.nextUrl.searchParams.get("patientId");
  if (!patientId) {
    return NextResponse.json({ error: "Missing patientId" }, { status: 400 });
  }

  const result = await getUpcomingQuizForPatient(user._id, patientId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    weekNumber: result.weekNumber,
    source: result.source,
    questions: result.questions,
  });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "therapist") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { patientId, edits } = await req.json();
  if (!patientId) {
    return NextResponse.json({ error: "Missing patientId" }, { status: 400 });
  }

  const result = await saveQuizQuestionEdits(user._id, patientId, edits);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ success: true, weekNumber: result.weekNumber });
}
