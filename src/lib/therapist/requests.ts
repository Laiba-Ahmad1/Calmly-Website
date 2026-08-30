// src/lib/therapist/requests.ts
import mongoose from "mongoose";
import db from "@/lib/db";
import Users from "@/models/User";
import TherapistPatient from "@/models/TherapistPatient";

export interface PendingRequestItem {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  requestedAt: Date;
}

export async function getPendingRequests(
  therapistId: string
): Promise<PendingRequestItem[]> {
  await db();

  const requests = await TherapistPatient.find({ therapistId, status: "pending" })
    .sort({ requestedAt: 1 })
    .lean();

  if (!requests.length) return [];

  const patients = await Users.find({
    _id: { $in: requests.map((r: any) => r.patientId) },
  })
    .select("name email")
    .lean();

  const patientsById = new Map(patients.map((p: any) => [p._id.toString(), p]));

  return requests.flatMap((r: any) => {
    const patient = patientsById.get(r.patientId.toString());
    if (!patient) return [];

    return [
      {
        id: r._id.toString(),
        patientId: r.patientId.toString(),
        patientName: patient.name,
        patientEmail: patient.email,
        requestedAt: r.requestedAt,
      },
    ];
  });
}

export type RespondResult =
  | { ok: true }
  | { ok: false; status: number; error: string };

// Accept/reject an incoming request. Only the therapist the request was sent
// to can respond, and only while it is still pending.
export async function respondToRequest(
  therapistId: string,
  requestId: string,
  decision: "accept" | "reject"
): Promise<RespondResult> {
  await db();

  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    return { ok: false, status: 400, error: "Invalid request id" };
  }

  const request = await TherapistPatient.findById(requestId);
  if (!request || request.therapistId.toString() !== therapistId) {
    // 404, not 403 — don't reveal whether the request exists for someone else
    return { ok: false, status: 404, error: "Request not found" };
  }
  if (request.status !== "pending") {
    return { ok: false, status: 409, error: "This request has already been handled" };
  }

  const now = new Date();
  if (decision === "accept") {
    request.status = "active";
    request.respondedAt = now;
    request.assignedAt = now;
  } else {
    request.status = "rejected";
    request.respondedAt = now;
  }

  await request.save();
  return { ok: true };
}
