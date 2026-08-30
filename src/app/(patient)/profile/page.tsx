// src/app/(patient)/profile/page.tsx
// Patient profile — displays stored fields, lets the patient edit only the
// user-editable ones (name, age, language).
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import db from "@/lib/db";
import PatientProfile from "@/models/PatientProfile";
import { getPatientT } from "@/lib/i18n/server";
import { formatDate } from "@/lib/format";
import ProfileForm from "@/components/patient/ProfileForm";

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-green/15 py-3.5 sm:flex-row sm:items-baseline">
      <dt className="w-44 shrink-0 font-body text-xs font-semibold uppercase tracking-wide text-text/50">
        {label}
      </dt>
      <dd className="font-body text-sm text-text">{value}</dd>
    </div>
  );
}

export default async function PatientProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await db();
  const profile = await PatientProfile.findOne({ userId: user._id }).lean();
  const { t } = await getPatientT(user._id.toString());

  return (
    <div className="relative mx-auto max-w-2xl">
      <h1 className="font-body text-3xl font-extrabold text-heading">
        {t("profile_title")}
      </h1>

      <section className="mt-8">
        <h2 className="font-body text-lg font-extrabold text-heading">
          {t("profile_edit")}
        </h2>
        <ProfileForm
          initialName={user.name}
          initialAge={profile?.age ?? null}
          initialLanguage={profile?.language === "ur" ? "ur" : "en"}
          labels={{
            name: t("profile_name"),
            age: t("profile_age"),
            language: t("profile_language"),
            save: t("profile_save"),
            saving: t("settings_saving"),
            saved: t("profile_saved"),
            english: "English",
            urdu: "اردو",
          }}
        />
      </section>

      <section className="mt-10">
        <h2 className="font-body text-lg font-extrabold text-heading">
          {t("profile_title")}
        </h2>
        <dl className="mt-2">
          <DetailRow label={t("profile_email")} value={user.email} />
          <DetailRow label={t("profile_gender")} value={user.gender} />
          <DetailRow
            label={t("profile_anxiety_type")}
            value={
              profile?.anxietyType ? (
                <span className="capitalize">{profile.anxietyType}</span>
              ) : (
                "—"
              )
            }
          />
          <DetailRow
            label={t("profile_member_since")}
            value={formatDate(user.createdAt)}
          />
        </dl>
      </section>
    </div>
  );
}
