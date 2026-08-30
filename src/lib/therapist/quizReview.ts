// src/lib/therapist/quizReview.ts
// Therapist review of the upcoming week's AI-planned quiz questions.
// Flow: AI plans -> therapist may edit -> edited version is what the patient
// receives; no edit means the AI version is used automatically.
import db from "@/lib/db";
import mongoose from "mongoose";
import TherapistPatient from "@/models/TherapistPatient";
import Users from "@/models/User";
import PatientProfile from "@/models/PatientProfile";
import QuizQuestion from "@/models/QuizQuestion";
import QuizAssignment from "@/models/QuizAssignmet";
import { planQuizForWeek } from "@/lib/quiz/personalization";
import { getCurrentWeekNumber } from "@/lib/quiz/weeks";

type UserId = string | mongoose.Types.ObjectId;

export interface UpcomingQuizQuestion {
  id: string;
  question: string;
  dimension: string;
  options: string[];
}

export type QuizReviewResult =
  | {
      ok: true;
      weekNumber: number;
      source: string;
      questions: UpcomingQuizQuestion[];
    }
  | { ok: false; status: number; error: string };

// Plans and returns NEXT week's questions for a connected patient.
export async function getUpcomingQuizForPatient(
  therapistId: UserId,
  patientId: UserId
): Promise<QuizReviewResult> {
  await db();

  const relation = await TherapistPatient.findOne({
    therapistId,
    patientId,
    status: "active",
  });
  if (!relation) {
    return { ok: false, status: 404, error: "Patient not found" };
  }

  const patientUser = await Users.findById(patientId).select("createdAt");
  const profile = await PatientProfile.findOne({ userId: patientId }).select(
    "anxietyType"
  );
  if (!patientUser || !profile) {
    return { ok: false, status: 404, error: "Patient not found" };
  }

  const currentWeek = getCurrentWeekNumber(new Date(patientUser.createdAt));
  const upcomingWeek = currentWeek + 1;

  const planned = await planQuizForWeek({
    userId: patientId.toString(),
    anxietyType: profile.anxietyType,
    accountCreatedAt: new Date(patientUser.createdAt),
    targetWeekNumber: upcomingWeek,
  });

  return {
    ok: true,
    weekNumber: upcomingWeek,
    source: planned.source,
    questions: planned.questions.map((q) => ({
      id: q._id.toString(),
      question: q.question,
      dimension: q.dimension,
      options: q.options.map((o) => o.text),
    })),
  };
}

export type SaveQuizEditsResult =
  | { ok: true; weekNumber: number }
  | { ok: false; status: number; error: string };

// Saves the therapist's version of the upcoming week's questions. Bank
// questions are never mutated — edited texts become private copies
// (generated for this patient) so other users' quizzes are unaffected.
export async function saveQuizQuestionEdits(
  therapistId: UserId,
  patientId: UserId,
  edits: { questionId: string; text: string }[]
): Promise<SaveQuizEditsResult> {
  await db();

  if (!Array.isArray(edits) || edits.length === 0) {
    return { ok: false, status: 400, error: "No edits provided" };
  }
  for (const e of edits) {
    const trimmed = e.text?.trim();
    if (!trimmed) {
      return { ok: false, status: 400, error: "Question text cannot be empty" };
    }
    if (trimmed.length > 300) {
      return { ok: false, status: 400, error: "Questions must stay under 300 characters" };
    }
  }

  const relation = await TherapistPatient.findOne({
    therapistId,
    patientId,
    status: "active",
  });
  if (!relation) {
    return { ok: false, status: 404, error: "Patient not found" };
  }

  const patientUser = await Users.findById(patientId).select("createdAt");
  const profile = await PatientProfile.findOne({ userId: patientId }).select(
    "anxietyType"
  );
  if (!patientUser || !profile) {
    return { ok: false, status: 404, error: "Patient not found" };
  }

  const currentWeek = getCurrentWeekNumber(new Date(patientUser.createdAt));
  const upcomingWeek = currentWeek + 1;

  // Make sure the assignment for the upcoming week exists before editing it.
  const planned = await planQuizForWeek({
    userId: patientId.toString(),
    anxietyType: profile.anxietyType,
    accountCreatedAt: new Date(patientUser.createdAt),
    targetWeekNumber: upcomingWeek,
  });
  if (!planned.questions.length) {
    return { ok: false, status: 500, error: "Could not plan the upcoming quiz" };
  }

  const assignment = await QuizAssignment.findOne({
    userId: patientId,
    weekNumber: upcomingWeek,
  });
  if (!assignment) {
    return { ok: false, status: 500, error: "Quiz assignment not found" };
  }

  const editsById = new Map(edits.map((e) => [e.questionId, e.text.trim()]));
  const newQuestionIds: mongoose.Types.ObjectId[] = [];

  for (const question of planned.questions) {
    const idStr = question._id.toString();
    const editedText = editsById.get(idStr);

    if (editedText === undefined || editedText === question.question) {
      // unchanged — keep the existing question id
      newQuestionIds.push(question._id as mongoose.Types.ObjectId);
      continue;
    }

    // edited — private copy for this patient, same options/scores/dimension
    const copy = await QuizQuestion.create({
      question: editedText,
      anxietyType: question.anxietyType,
      dimension: question.dimension,
      options: question.options,
      active: true,
      generated: true,
      generatedForUserId: patientId,
      generatedContext: "therapist edit",
    });
    newQuestionIds.push(copy._id as mongoose.Types.ObjectId);
  }

  assignment.questionIds = newQuestionIds;
  assignment.source = "therapist";
  await assignment.save();

  return { ok: true, weekNumber: upcomingWeek };
}
