// src/lib/therapist/feedback.ts
// Therapist-written weekly feedback (four fixed sections). Saved as an upsert
// per patient per week so the therapist can refine it later. Relationship is
// verified server-side; the patient read path only ever uses the patient's own id.
import db from "@/lib/db";
import mongoose from "mongoose";
import TherapistPatient from "@/models/TherapistPatient";
import TherapistFeedback from "@/models/TherapistFeedback";
import { getWeekWindow, getCurrentWeekNumber } from "@/lib/quiz/weeks";

type UserId = string | mongoose.Types.ObjectId;

export interface FeedbackInput {
  overallObservation: string;
  progressAndStrength: string;
  areasToFocusOn: string;
  feedbackAndGuidance: string;
}

export type FeedbackResult =
  | { ok: true; feedback: any }
  | { ok: false; status: number; error: string };

const MAX_SECTION = 2000;

function validate(input: FeedbackInput): string | null {
  const sections: [keyof FeedbackInput, string][] = [
    ["overallObservation", "Overall weekly observation"],
    ["progressAndStrength", "Progress and strength"],
    ["areasToFocusOn", "Areas to focus on"],
    ["feedbackAndGuidance", "Feedback and guidance"],
  ];
  for (const [key, label] of sections) {
    const val = input[key]?.trim();
    if (!val) return `${label} is required`;
    if (val.length > MAX_SECTION) return `${label} is too long`;
  }
  return null;
}

// Writes feedback for the patient's CURRENT week (the week the therapist is
// reviewing). Re-saving the same week updates the existing document.
export async function saveFeedback(
  therapistId: UserId,
  patientId: UserId,
  input: FeedbackInput,
  accountCreatedAt: Date
): Promise<FeedbackResult> {
  await db();

  const error = validate(input);
  if (error) return { ok: false, status: 400, error };

  const relation = await TherapistPatient.findOne({
    therapistId,
    patientId,
    status: "active",
  });
  if (!relation) {
    return { ok: false, status: 404, error: "Patient not found" };
  }

  const weekNumber = getCurrentWeekNumber(accountCreatedAt);
  const { weekStart, weekEnd } = getWeekWindow(accountCreatedAt, weekNumber);

  const feedback = await TherapistFeedback.findOneAndUpdate(
    { patientId, weekStart },
    {
      $set: {
        therapistId,
        weekNumber,
        weekStart,
        weekEnd,
        overallObservation: input.overallObservation.trim(),
        progressAndStrength: input.progressAndStrength.trim(),
        areasToFocusOn: input.areasToFocusOn.trim(),
        feedbackAndGuidance: input.feedbackAndGuidance.trim(),
      },
    },
    { upsert: true, new: true }
  );

  return { ok: true, feedback };
}

// Feedback history for the therapist's patient view, newest first.
export async function getFeedbackForTherapistPatient(
  therapistId: UserId,
  patientId: UserId
) {
  await db();

  const relation = await TherapistPatient.findOne({
    therapistId,
    patientId,
    status: "active",
  });
  if (!relation) return null;

  return TherapistFeedback.find({ patientId })
    .sort({ weekStart: -1 })
    .lean();
}

// Feedback history for the patient themselves, newest first.
export async function getFeedbackForPatient(patientId: UserId) {
  await db();

  return TherapistFeedback.find({ patientId })
    .sort({ weekStart: -1 })
    .lean();
}
