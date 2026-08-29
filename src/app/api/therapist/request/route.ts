import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import db from "@/lib/db";
import TherapistPatient from "@/models/TherapistPatient";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { therapistUserId } = await req.json();
  if (!therapistUserId) {
    return NextResponse.json({ error: "Missing therapistUserId" }, { status: 400 });
  }

  await db();

  const existingRelation = await TherapistPatient.findOne({
    patientId: user._id,
    status: { $in: ["pending", "active"] },
  });

  if (existingRelation) {
    return NextResponse.json(
      { error: "You already have a therapist or a pending request." },
      { status: 409 }
    );
  }

  try {
    await TherapistPatient.create({
      therapistId: therapistUserId,
      patientId: user._id,
      status: "pending",
    });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.code === 11000) {
      // race: two requests landed before the first one committed
      return NextResponse.json(
        { error: "You already have a therapist or a pending request." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}