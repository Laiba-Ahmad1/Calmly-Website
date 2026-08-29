// src/app/(admin)/admin/therapists/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import db from "@/lib/db";
import TherapistProfile from "@/models/TherapistProfile";
import AdminTherapistReview from "@/components/admin/AdminTherapistReview";

export default async function AdminPendingTherapistsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/login");

  await db();

  const pending = await TherapistProfile.find({ verificationStatus: "pending" })
    .populate("userId", "name email")
    .sort({ submittedAt: 1 })
    .lean();

  const initialTherapists = pending.map((t: any) => ({
    id: t._id.toString(),
    name: t.userId?.name ?? "Unknown",
    email: t.userId?.email ?? "",
    documentUrl: t.documentUrl,
    documentName: t.documentName,
    submittedAt: t.submittedAt.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-canvas p-6 sm:p-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-1 font-heading text-3xl font-bold text-background">
          Pending therapist verifications
        </h1>
        <p className="mb-8 text-sm text-background/70">
          {initialTherapists.length} awaiting review
        </p>

        <AdminTherapistReview initialTherapists={initialTherapists} />
      </div>
    </div>
  );
}