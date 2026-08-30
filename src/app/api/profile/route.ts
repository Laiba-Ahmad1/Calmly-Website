// PATCH /api/profile — patient edits their own profile (name, age, language)
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import db from "@/lib/db";
import Users from "@/models/User";
import PatientProfile from "@/models/PatientProfile";

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "patient") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db();

  const { name, age, language } = await req.json();

  const updates: Record<string, unknown> = {};

  if (name !== undefined) {
    const trimmed = String(name).trim();
    if (trimmed.length < 2 || trimmed.length > 60) {
      return NextResponse.json({ error: "Name must be 2-60 characters" }, { status: 400 });
    }
    updates.name = trimmed;
  }

  if (age !== undefined) {
    const parsed = Number(age);
    if (age === null || age === "") {
      updates.age = null;
    } else if (!Number.isInteger(parsed) || parsed < 1 || parsed > 120) {
      return NextResponse.json({ error: "Age must be between 1 and 120" }, { status: 400 });
    } else {
      updates.age = parsed;
    }
  }

  if (language !== undefined) {
    if (language !== "en" && language !== "ur") {
      return NextResponse.json({ error: "Invalid language" }, { status: 400 });
    }
    await PatientProfile.updateOne({ userId: user._id }, { $set: { language } });
  }

  if (Object.keys(updates).length > 0) {
    await Users.updateOne({ _id: user._id }, { $set: updates });
  }

  return NextResponse.json({ success: true });
}
