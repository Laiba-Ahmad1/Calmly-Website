// POST /api/therapist/tasks — therapist assigns a todo to a connected patient
// GET  /api/therapist/tasks?patientId= — tasks for one connected patient
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireTherapist } from "@/lib/therapist/guard";
import { assignTask, getTasksForTherapistPatient } from "@/lib/tasks";

export async function POST(req: Request) {
  const therapist = await requireTherapist();
  if (!therapist) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { patientId?: string; text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { patientId, text } = body;
  if (!patientId || !mongoose.Types.ObjectId.isValid(patientId)) {
    return NextResponse.json({ error: "Valid patientId is required" }, { status: 400 });
  }

  const result = await assignTask(
    therapist._id.toString(),
    patientId,
    text ?? ""
  );

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ success: true, task: result.task }, { status: 201 });
}

export async function GET(req: Request) {
  const therapist = await requireTherapist();
  if (!therapist) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get("patientId");

  if (!patientId || !mongoose.Types.ObjectId.isValid(patientId)) {
    return NextResponse.json({ error: "Valid patientId is required" }, { status: 400 });
  }

  const tasks = await getTasksForTherapistPatient(
    therapist._id.toString(),
    patientId
  );

  if (!tasks) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  return NextResponse.json(tasks);
}
