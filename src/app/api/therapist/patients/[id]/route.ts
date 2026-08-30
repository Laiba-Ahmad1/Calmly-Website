// GET /api/therapist/patients/[id] — full overview for a connected patient.
// Verifies the therapist-patient relationship server-side; a patientId the
// therapist is not connected to returns 404, never data.
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireTherapist } from "@/lib/therapist/guard";
import { getPatientOverview } from "@/lib/therapist/patients";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const therapist = await requireTherapist();
  if (!therapist) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    return NextResponse.json({ error: "Invalid patient id" }, { status: 400 });
  }

  const overview = await getPatientOverview(
    therapist._id.toString(),
    params.id
  );

  if (!overview) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  return NextResponse.json({ patient: overview });
}
