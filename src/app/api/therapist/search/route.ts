import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import db from "@/lib/db";
import TherapistProfile from "@/models/TherapistProfile";
import TherapistPatient from "@/models/TherapistPatient";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db();

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query")?.trim() ?? "";

  const therapists = await TherapistProfile.find({ verificationStatus: "approved" })
    .populate("userId", "name")
    .lean();

  const filtered = query
    ? therapists.filter((t: any) => t.userId?.name?.toLowerCase().includes(query.toLowerCase()))
    : therapists;

  // this patient's one active-or-pending relation, if any
  const existingRelation = await TherapistPatient.findOne({
    patientId: user._id,
    status: { $in: ["pending", "active"] },
  }).select("therapistId status");

  const results = filtered.map((t: any) => {
    const therapistUserId = t.userId._id.toString();
    const isThisTherapist = existingRelation?.therapistId.toString() === therapistUserId;

    return {
      id: t._id.toString(),
      therapistUserId,
      name: t.userId?.name ?? "Unnamed therapist",
      avatarUrl: t.avatarUrl ?? null,
      bio: t.bio ?? "",
      requestStatus: isThisTherapist
        ? (existingRelation!.status as "pending" | "active")
        : existingRelation
        ? "blocked" // patient already has/requested a different therapist
        : "none",
    };
  });

  return NextResponse.json({ therapists: results });
}