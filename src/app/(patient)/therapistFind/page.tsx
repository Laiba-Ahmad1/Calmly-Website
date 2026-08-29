import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import db from "@/lib/db";
import TherapistProfile from "@/models/TherapistProfile";
import TherapistPatient from "@/models/TherapistPatient";
import TherapistSearch from "@/components/patient/TherapistSeacrh";
import type { TherapistListItem } from "@/components/patient/TherapistSeacrh";

export default async function TherapistFindPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await db();

  const therapists = await TherapistProfile.find({ verificationStatus: "approved" })
    .populate("userId", "name")
    .lean();

  const existingRelation = await TherapistPatient.findOne({
    patientId: user._id,
    status: { $in: ["pending", "active"] },
  }).select("therapistId status");

  const initialTherapists: TherapistListItem[] = therapists.map((t: any) => {
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
        ? "blocked"
        : "none",
    } satisfies TherapistListItem;
  });

  return (
    <div className="relative mx-auto max-w-3xl">
      <div className="rounded-[2.5rem] bg-background p-8 shadow-sm sm:p-12">
        <h1 className="mb-6 font-heading text-3xl font-bold text-heading">Find a therapist</h1>
        <TherapistSearch initialTherapists={initialTherapists} />
      </div>
    </div>
  );
}