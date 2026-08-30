// src/lib/therapist/reports.ts
import mongoose from "mongoose";
import db from "@/lib/db";
import Users from "@/models/User";
import TherapistPatient from "@/models/TherapistPatient";
import PatientAIReport from "@/models/PatientAIReport";

export interface TherapistReportListItem {
  id: string;
  patientId: string;
  patientName: string;
  weekNumber: number;
  weekStart: Date;
  weekEnd: Date;
  weeklyOverview: string;
  generatedAt: Date;
}

// Reports for the therapist's connected patients only — the patient list is
// resolved from active relationships before reports are queried.
export async function getReportsForTherapist(
  therapistId: string,
  limit = 50
): Promise<TherapistReportListItem[]> {
  await db();

  const assignments = await TherapistPatient.find({ therapistId, status: "active" })
    .select("patientId")
    .lean();

  if (!assignments.length) return [];

  const patientIds = assignments.map((a: any) => a.patientId);

  const reports = await PatientAIReport.find({ userId: { $in: patientIds } })
    .sort({ weekStart: -1 })
    .limit(limit)
    .lean();

  if (!reports.length) return [];

  const patients = await Users.find({ _id: { $in: reports.map((r: any) => r.userId) } })
    .select("name")
    .lean();
  const namesById = new Map(patients.map((p: any) => [p._id.toString(), p.name]));

  return reports.map((r: any) => ({
    id: r._id.toString(),
    patientId: r.userId.toString(),
    patientName: namesById.get(r.userId.toString()) ?? "Patient",
    weekNumber: r.weekNumber,
    weekStart: r.weekStart,
    weekEnd: r.weekEnd,
    weeklyOverview: r.weeklyOverview,
    generatedAt: r.generatedAt,
  }));
}

// Loads a single report and verifies the therapist is connected to the
// patient it belongs to. Returns null for "not found" AND "not yours".
export async function getReportForTherapist(
  therapistId: string,
  reportId: string
) {
  await db();

  if (!mongoose.Types.ObjectId.isValid(reportId)) return null;

  const report = await PatientAIReport.findById(reportId).lean();
  if (!report) return null;

  const patientId = report.userId.toString();
  const assignment = await TherapistPatient.findOne({
    therapistId,
    patientId,
    status: "active",
  }).lean();

  if (!assignment) return null;

  const patientUser = await Users.findById(patientId).select("name email").lean();
  if (!patientUser) return null;

  return { report, patientUser };
}
