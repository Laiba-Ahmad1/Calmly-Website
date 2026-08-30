// PATCH /api/therapist/profile — therapist edits bio and/or profile picture.
// Verification fields (verificationStatus, document) stay admin-controlled.
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import db from "@/lib/db";
import TherapistProfile from "@/models/TherapistProfile";
import { saveUploadedFile } from "@/lib/uploadFile";

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "therapist") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db();

  const formData = await req.formData();
  const bio = formData.get("bio");
  const avatar = formData.get("avatar");

  const updates: Record<string, unknown> = {};

  if (bio !== null) {
    const trimmed = String(bio).trim();
    if (trimmed.length > 300) {
      return NextResponse.json({ error: "Bio must be under 300 characters" }, { status: 400 });
    }
    updates.bio = trimmed;
  }

  if (avatar instanceof File && avatar.size > 0) {
    if (avatar.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Image must be under 5MB" }, { status: 400 });
    }
    if (!avatar.type.startsWith("image/")) {
      return NextResponse.json({ error: "Please upload an image file" }, { status: 400 });
    }
    updates.avatarUrl = await saveUploadedFile(avatar, "calmly/therapist-avatars");
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  await TherapistProfile.updateOne({ userId: user._id }, { $set: updates });

  return NextResponse.json({ success: true });
}
