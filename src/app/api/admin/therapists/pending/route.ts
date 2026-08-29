// src/app/api/admin/therapists/pending/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import db from "@/lib/db";
import TherapistProfile from "@/models/TherapistProfile";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db();

  const pending = await TherapistProfile.find({ verificationStatus: "pending" })
    .populate("userId", "name email")
    .sort({ submittedAt: 1 })
    .lean();

  const results = pending.map((t: any) => ({
    id: t._id.toString(),
    name: t.userId?.name ?? "Unknown",
    email: t.userId?.email ?? "",
    documentUrl: t.documentUrl,
    documentName: t.documentName,
    submittedAt: t.submittedAt,
  }));

  return NextResponse.json({ therapists: results });
}