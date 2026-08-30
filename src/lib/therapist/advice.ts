// src/lib/therapist/advice.ts
// Therapist-created advice tied to a Calmly module. Creation is
// relationship-guarded; patient reads only ever use the patient's own id.
import db from "@/lib/db";
import mongoose from "mongoose";
import TherapistPatient from "@/models/TherapistPatient";
import TherapistAdvice from "@/models/TherapistAdvice";
import { isModuleKey, ModuleKey } from "@/lib/modules";

type UserId = string | mongoose.Types.ObjectId;

export type AdviceResult =
  | { ok: true; advice: any }
  | { ok: false; status: number; error: string };

export async function createAdvice(
  therapistId: UserId,
  patientId: UserId,
  text: string,
  relatedModule: string
): Promise<AdviceResult> {
  await db();

  const trimmed = text?.trim();
  if (!trimmed || trimmed.length < 3) {
    return { ok: false, status: 400, error: "Advice text is required" };
  }
  if (trimmed.length > 400) {
    return { ok: false, status: 400, error: "Keep the advice under 400 characters" };
  }
  if (!isModuleKey(relatedModule)) {
    return { ok: false, status: 400, error: "Choose a valid related module" };
  }

  const relation = await TherapistPatient.findOne({
    therapistId,
    patientId,
    status: "active",
  });
  if (!relation) {
    return { ok: false, status: 404, error: "Patient not found" };
  }

  const advice = await TherapistAdvice.create({
    patientId,
    therapistId,
    text: trimmed,
    relatedModule: relatedModule as ModuleKey,
  });

  return { ok: true, advice };
}

export async function deactivateAdvice(
  therapistId: UserId,
  adviceId: string
): Promise<boolean> {
  await db();

  const advice = await TherapistAdvice.findOne({ _id: adviceId, therapistId });
  if (!advice) return false;

  advice.active = false;
  await advice.save();
  return true;
}

// Active advice for a patient, newest first (patient-facing).
export async function getActiveAdvice(patientId: UserId) {
  await db();

  return TherapistAdvice.find({ patientId, active: true })
    .sort({ createdAt: -1 })
    .lean();
}

// Advice list for a therapist's patient view, newest first (therapist-facing).
export async function getAdviceForTherapistPatient(
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

  return TherapistAdvice.find({ patientId })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();
}
