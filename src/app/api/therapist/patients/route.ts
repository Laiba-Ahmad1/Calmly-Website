// GET /api/therapist/patients — patients connected to the logged-in therapist
import { NextResponse } from "next/server";
import { requireTherapist } from "@/lib/therapist/guard";
import { getTherapistPatients } from "@/lib/therapist/patients";

export async function GET() {
  const therapist = await requireTherapist();
  if (!therapist) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const patients = await getTherapistPatients(therapist._id.toString());
  return NextResponse.json({ patients });
}
