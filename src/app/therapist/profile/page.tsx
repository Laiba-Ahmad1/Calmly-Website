// src/app/therapist/profile/page.tsx
// Therapist profile — stored fields plus editing for bio, profile picture,
// and the Urdu/English workspace language. Verification fields stay
// read-only (admin-controlled).
import { redirect } from "next/navigation";
import { requireTherapist } from "@/lib/therapist/guard";
import db from "@/lib/db";
import TherapistProfile from "@/models/TherapistProfile";
import LogoutButton from "@/components/shared/LogoutButton";
import TherapistProfileEditForm from "@/components/therapist/TherapistProfileEditForm";
import LanguageToggle from "@/components/therapist/LanguageToggle";
import { formatDate } from "@/lib/format";
import { getTherapistT } from "@/lib/i18n/server";
import { interpolate } from "@/lib/i18n/dictionaries";

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

  const [profile, { language, t }] = await Promise.all([
    TherapistProfile.findOne({ userId: therapist._id }).lean(),
    getTherapistT(therapist._id.toString()),
  ]);

  const editLabels = {
    aboutYou: t("t_pf_about_you"),
    bioPlaceholder: t("t_pf_bio_placeholder"),
    changePicture: t("t_pf_change_picture"),
    uploadPicture: t("t_pf_upload_picture"),
    removeSelected: t("t_pf_remove_selected"),
    save: t("t_pf_save"),
    saving: t("t_pf_saving"),
    saved: t("t_pf_saved"),
    errorSave: t("t_pf_error_save"),
    errorGeneric: t("t_pf_error_generic"),
  };

  const languageLabels = {
    title: t("t_lang_title"),
    desc: t("t_lang_desc"),
    saving: t("t_lang_saving"),
  };

  return (
    <div className="rounded-[2rem] bg-background p-6 shadow-sm sm:p-10">
      <header>
        <h1 className="font-body text-3xl font-extrabold text-blueheading">
          {therapist.name}
        </h1>
        <p className="mt-2 font-body text-sm text-text/60">{therapist.email}</p>

        <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-blue/15 px-4 py-1.5 font-body text-xs font-semibold text-blueheading">
          <span className="h-2 w-2 rounded-full bg-blue" />
          {t("t_profile_verified")}
        </span>
      </header>

      <section className="mt-8">
        <h2 className="font-body text-lg font-extrabold text-blueheading">
          {t("t_profile_edit")}
        </h2>
        <TherapistProfileEditForm
          initialBio={profile?.bio ?? ""}
          avatarUrl={profile?.avatarUrl}
          initialLetter={therapist.name.trim().charAt(0).toUpperCase()}
          labels={editLabels}
        />
        <LanguageToggle initialLanguage={language} labels={languageLabels} />
      </section>

      <section className="mt-10">
        <h2 className="font-body text-lg font-extrabold text-blueheading">
          {t("t_profile_about")}
        </h2>
        <p className="mt-3 font-body text-sm leading-relaxed text-text/80">
          {profile?.bio?.trim()
            ? profile.bio
            : t("t_profile_no_bio")}
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-body text-lg font-extrabold text-blueheading">
          {t("t_profile_account")}
        </h2>
        <dl className="mt-2">
          <DetailRow
            label={t("t_profile_verification")}
            value={
              profile?.reviewedAt
                ? interpolate(t("t_profile_approved_on"), {
                    date: formatDate(profile.reviewedAt),
                  })
                : t("t_profile_approved")
            }
          />
          <DetailRow
            label={t("t_profile_document")}
            value={profile?.documentName ?? "—"}
          />
          <DetailRow
            label={t("t_profile_submitted")}
            value={profile?.submittedAt ? formatDate(profile.submittedAt) : formatDate(therapist.createdAt)}
          />
          <DetailRow
            label={t("t_profile_member_since")}
            value={formatDate(therapist.createdAt)}
          />
        </dl>
      </section>

      <div className="mt-10 border-t border-blue/15 pt-5">
        <LogoutButton
          className="rounded-full border border-blue/30 px-5 py-2.5 hover:bg-blue/10"
          busyLabel={t("t_logging_out")}
        >
          {t("t_logout")}
        </LogoutButton>
      </div>
    </div>
  );
}