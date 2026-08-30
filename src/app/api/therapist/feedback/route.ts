// POST /api/therapist/feedback — save weekly feedback for a connected patient
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import db from "@/lib/db";
import Users from "@/models/User";
import { saveFeedback } from "@/lib/therapist/feedback";
import { createNotification } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "therapist") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    patientId,
    overallObservation,
    progressAndStrength,
    areasToFocusOn,
    feedbackAndGuidance,
  } = await req.json();

  await db();
  const patient = await Users.findById(patientId).select("createdAt");
  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  const result = await saveFeedback(user._id, patientId, {
    overallObservation,
    progressAndStrength,
    areasToFocusOn,
    feedbackAndGuidance,
  }, new Date(patient.createdAt));

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  await createNotification({
    recipientId: patientId,
    type: "therapist_feedback",
    title: "New feedback from your therapist",
    message: `Your therapist shared feedback for week ${result.feedback.weekNumber}.`,
    link: "/feedback",
    dedupeKey: `feedback:${patientId}:${result.feedback.weekStart}`,
  }).catch(() => null);

  return NextResponse.json({ success: true, weekNumber: result.feedback.weekNumber });
}
