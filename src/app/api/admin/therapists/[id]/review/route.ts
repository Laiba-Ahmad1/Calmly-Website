// src/app/api/admin/therapists/[id]/review/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import db from "@/lib/db";
import TherapistProfile from "@/models/TherapistProfile";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { decision, rejectionReason } = await req.json();
  if (decision !== "approved" && decision !== "rejected") {
    return NextResponse.json({ error: "Invalid decision" }, { status: 400 });
  }

  await db();

  const profile = await TherapistProfile.findById(params.id);
  if (!profile) {
    return NextResponse.json({ error: "Therapist profile not found" }, { status: 404 });
  }

  profile.verificationStatus = decision;
  profile.reviewedAt = new Date();
  if (decision === "rejected" && rejectionReason) {
    profile.rejectionReason = rejectionReason;
  }

  await profile.save();

  return NextResponse.json({ success: true });
}