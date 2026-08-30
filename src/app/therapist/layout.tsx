// src/app/therapist/layout.tsx
// Therapist shell: role check + verification gate + blue sidebar navigation.
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import db from "@/lib/db";
import TherapistProfile from "@/models/TherapistProfile";
import TherapistPatient from "@/models/TherapistPatient";
import TherapistSidebar from "@/components/therapist/Sidebar";
import LogoutButton from "@/components/shared/LogoutButton";
import { getUnreadCount } from "@/lib/notifications";

function VerificationScreen({
  name,
  status,
  reason,
}: {
  name: string;
  status: "pending" | "rejected";
  reason?: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bluesoft p-6">
      <div className="w-full max-w-md rounded-[2rem] border border-blue/25 bg-background p-8 sm:p-10">
        <div className="text-center">
          <span className="font-logo text-4xl text-heading">Calmly</span>
        </div>

        {status === "pending" ? (
          <>
            <h1 className="mt-8 text-center font-body text-xl font-extrabold text-heading">
              Verification in progress
            </h1>
            <p className="mt-3 text-center font-body text-sm leading-relaxed text-text/70">
              Welcome, {name}. Your document is being reviewed by our team. You
              will get access to your therapist workspace as soon as your
              account is verified.
            </p>
          </>
        ) : (
          <>
            <h1 className="mt-8 text-center font-body text-xl font-extrabold text-heading">
              Verification was not approved
            </h1>
            <p className="mt-3 text-center font-body text-sm leading-relaxed text-text/70">
              {reason
                ? `Reason: ${reason}`
                : "Your submitted document could not be verified."}
            </p>
          </>
        )}

        <div className="mt-8 flex justify-center">
          <LogoutButton className="rounded-full border border-blue/30 px-5 py-2.5 hover:bg-blue/10" />
        </div>
      </div>
    </div>
  );
}

export default async function TherapistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "therapist") {
    redirect("/login");
  }

  await db();

  const [profile, pendingCount, notificationCount] = await Promise.all([
    TherapistProfile.findOne({ userId: user._id }).lean(),
    TherapistPatient.countDocuments({ therapistId: user._id, status: "pending" }),
    getUnreadCount(user._id),
  ]);

  const verificationStatus = profile?.verificationStatus ?? "pending";

  // Unverified therapists never see the workspace — no data, no navigation.
  if (verificationStatus !== "approved") {
    return (
      <VerificationScreen
        name={user.name}
        status={verificationStatus === "rejected" ? "rejected" : "pending"}
        reason={profile?.rejectionReason}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-bluesoft">
      <TherapistSidebar
        userName={user.name}
        userEmail={user.email}
        pendingCount={pendingCount}
        notificationCount={notificationCount}
        avatarUrl={profile?.avatarUrl}
      />

      {/* pt-20 clears the fixed menu button on mobile */}
      <main className="relative p-6 pt-20 sm:p-10 lg:pl-80 lg:pt-10">
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>
    </div>
  );
}
