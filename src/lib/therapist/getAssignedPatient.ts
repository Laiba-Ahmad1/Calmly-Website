// src/lib/therapist/getAssignedPatient.ts
import db from "@/lib/db";
import TherapistPatient from "@/models/TherapistPatient";
import Users from "@/models/User";
import PatientProfile from "@/models/PatientProfile";

export async function getAssignedPatient(therapistId: string, patientId: string) {
  await db();

  const assignment = await TherapistPatient.findOne({
    therapistId,
    patientId,
    status: "active",
  });

  if (!assignment) return null; // not assigned — caller should treat this as "not found," not "forbidden"

  const [patientUser, patientProfile] = await Promise.all([
    // createdAt is needed by callers to anchor the patient's week windows
    Users.findById(patientId).select("name email createdAt"),
    PatientProfile.findOne({ userId: patientId }),
  ]);

  if (!patientUser || !patientProfile) return null;

  return { assignment, patientUser, patientProfile };
}