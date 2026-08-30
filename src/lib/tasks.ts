// src/lib/tasks.ts
// Therapist-assigned todos (PatientTask). Assignment is therapist-guarded;
// the patient-facing reads only ever use the logged-in patient's own id.
import db from "@/lib/db";
import mongoose from "mongoose";
import TherapistPatient from "@/models/TherapistPatient";
import PatientTask from "@/models/PatientTask";

type UserId = string | mongoose.Types.ObjectId;

export type AssignTaskResult =
  | { ok: true; task: any }
  | { ok: false; status: number; error: string };

export async function assignTask(
  therapistId: UserId,
  patientId: UserId,
  text: string
): Promise<AssignTaskResult> {
  await db();

  const trimmed = text?.trim();
  if (!trimmed) {
    return { ok: false, status: 400, error: "Task text is required" };
  }
  if (trimmed.length > 300) {
    return { ok: false, status: 400, error: "Keep the task under 300 characters" };
  }

  const relation = await TherapistPatient.findOne({
    therapistId,
    patientId,
    status: "active",
  });
  if (!relation) {
    return { ok: false, status: 404, error: "Patient not found" };
  }

  const task = await PatientTask.create({
    patientId,
    therapistId,
    text: trimmed,
  });

  return { ok: true, task };
}

export async function getTasksForTherapistPatient(
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

  return getPatientTasks(patientId);
}

export async function getPatientTasks(patientId: UserId) {
  await db();

  const [active, completed] = await Promise.all([
    PatientTask.find({ patientId, status: "active" })
      .sort({ assignedAt: -1 })
      .lean(),
    PatientTask.find({ patientId, status: "completed" })
      .sort({ completedAt: -1 })
      .limit(10)
      .lean(),
  ]);

  return { active, completed };
}

// Called after a journal entry is saved: any submitted todo that matches an
// active task (by id) and was checked off gets marked completed.
export async function completeTasksFromJournal(
  patientId: UserId,
  todos: { taskId?: string; text: string; done: boolean }[],
  journalEntryId: mongoose.Types.ObjectId | string
) {
  const completedTaskIds = todos
    .filter((t) => t?.taskId && t?.done)
    .map((t) => t.taskId!);

  if (!completedTaskIds.length) return;

  await db();

  await PatientTask.updateMany(
    { _id: { $in: completedTaskIds }, patientId, status: "active" },
    {
      $set: {
        status: "completed",
        completedAt: new Date(),
        completedViaJournal: journalEntryId,
      },
    }
  );
}
