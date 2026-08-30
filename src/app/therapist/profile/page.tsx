// src/app/therapist/profile/page.tsx
// Therapist profile — stored fields plus editing for bio and profile picture.
// Verification fields stay read-only (admin-controlled).
import { redirect } from "next/navigation";
import { requireTherapist } from "@/lib/therapist/guard";
import db from "@/lib/db";
import TherapistProfile from "@/models/TherapistProfile";
import LogoutButton from "@/components/shared/LogoutButton";
import TherapistProfileEditForm from "@/components/therapist/TherapistProfileEditForm";
import { formatDate } from "@/lib/format";

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-blue/15 py-4 sm:flex-row sm:items-baseline">
      <dt className="w-48 shrink-0 font-body text-xs font-semibold uppercase tracking-wide text-text/50">
        {label}
      </dt>
      <dd className="font-body text-sm text-text">{value}</dd>
    </div>
  );
}

export default async function TherapistProfilePage() {
  const therapist = await requireTherapist();
  if (!therapist) redirect("/login");

  await db();

  const profile = await TherapistProfile.findOne({ userId: therapist._id }).lean();

  return (
    <div>
      <header>
        <h1 className="font-body text-3xl font-extrabold text-heading">
          {therapist.name}
        </h1>
        <p className="mt-2 font-body text-sm text-text/60">{therapist.email}</p>

        <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-blue/15 px-4 py-1.5 font-body text-xs font-semibold text-heading">
          <span className="h-2 w-2 rounded-full bg-blue" />
          Verified therapist
        </span>
      </header>

      <section className="mt-8">
        <h2 className="font-body text-lg font-extrabold text-heading">
          Edit profile
        </h2>
        <TherapistProfileEditForm
          initialBio={profile?.bio ?? ""}
          avatarUrl={profile?.avatarUrl}
          initialLetter={therapist.name.trim().charAt(0).toUpperCase()}
        />
      </section>

      <section className="mt-10">
        <h2 className="font-body text-lg font-extrabold text-heading">
          About
        </h2>
        <p className="mt-3 font-body text-sm leading-relaxed text-text/80">
          {profile?.bio?.trim()
            ? profile.bio
            : "No professional bio has been added to this profile yet."}
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-body text-lg font-extrabold text-heading">
          Account details
        </h2>
        <dl className="mt-2">
          <DetailRow
            label="Verification"
            value={`Approved${profile?.reviewedAt ? ` on ${formatDate(profile.reviewedAt)}` : ""}`}
          />
          <DetailRow
            label="Document"
            value={profile?.documentName ?? "—"}
          />
          <DetailRow
            label="Submitted"
            value={profile?.submittedAt ? formatDate(profile.submittedAt) : formatDate(therapist.createdAt)}
          />
          <DetailRow
            label="Member since"
            value={formatDate(therapist.createdAt)}
          />
        </dl>
      </section>

      <div className="mt-10 border-t border-blue/15 pt-5">
        <LogoutButton className="rounded-full border border-blue/30 px-5 py-2.5 hover:bg-blue/10" />
      </div>
    </div>
  );
}
