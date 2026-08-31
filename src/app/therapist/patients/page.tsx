// src/app/therapist/patients/page.tsx
// Connected patients — clean rows, no card grid.
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireTherapist } from "@/lib/therapist/guard";
import { getTherapistPatients } from "@/lib/therapist/patients";
import { formatShortDate } from "@/lib/format";
import { getTherapistT, therapistRelative } from "@/lib/i18n/server";
import { interpolate } from "@/lib/i18n/dictionaries";

export default async function TherapistPatientsPage() {
  const therapist = await requireTherapist();
  if (!therapist) redirect("/login");

  const [{ language, t }, patients] = await Promise.all([
    getTherapistT(therapist._id.toString()),
    getTherapistPatients(therapist._id.toString()),
  ]);

  return (
    <div className="rounded-[2rem] bg-background p-6 shadow-sm sm:p-10">
      <header>
        <h1 className="font-body text-3xl font-extrabold text-blueheading">
          {t("t_patients_title")}
        </h1>
        <p className="mt-2 font-body text-sm text-text/60">
          {patients.length === 0
            ? t("t_patients_empty")
            : interpolate(
                patients.length === 1
                  ? t("t_patients_count_one")
                  : t("t_patients_count_many"),
                { count: patients.length }
              )}
        </p>
      </header>

      {patients.length === 0 ? (
        <div className="mt-8 border-t border-blue/20 pt-6">
          <p className="font-body text-sm text-text/70">
            {t("t_patients_accept_hint")}
          </p>
          <Link
            href="/therapist/requests"
            className="mt-3 inline-block font-body text-sm font-semibold text-blue hover:underline"
          >
            {t("t_patients_go_requests")}
          </Link>
        </div>
      ) : (
        <div className="mt-6">
          {patients.map((patient) => (
            <div
              key={patient.patientId}
              className="flex flex-col gap-2 border-b border-blue/15 py-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <Link
                  href={`/therapist/patients/${patient.patientId}`}
                  className="font-body font-bold text-blueheading hover:underline"
                >
                  {patient.name}
                </Link>
                <p className="mt-0.5 font-body text-sm text-text/60">
                  {patient.anxietyType ? (
                    <span className="capitalize">
                      {interpolate(t("t_patients_anxiety"), {
                        type: patient.anxietyType,
                      })}
                    </span>
                  ) : (
                    t("t_patients_anxiety_not_set")
                  )}
                  {patient.connectedSince && (
                    <>
                      {" "}
                      ·{" "}
                      {interpolate(t("t_patients_connected_since"), {
                        date: formatShortDate(patient.connectedSince),
                      })}
                    </>
                  )}
                </p>
                <p className="mt-0.5 font-body text-sm text-text/50">
                  {patient.lastJournalDate
                    ? interpolate(t("t_patients_last_journal"), {
                        when: therapistRelative(language, patient.lastJournalDate),
                      })
                    : t("t_patients_no_journals")}
                  {patient.latestReport
                    ? ` · ${interpolate(t("t_patients_last_report"), {
                        date: formatShortDate(patient.latestReport.weekEnd),
                      })}`
                    : ` · ${t("t_patients_no_report")}`}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-5">
                {patient.latestReport && (
                  <span className="hidden font-body text-xs text-text/50 md:block">
                    {interpolate(t("t_patients_mood_sleep"), {
                      mood: patient.latestReport.moodAvg ?? "—",
                      sleep: patient.latestReport.sleepAvg ?? "—",
                    })}
                  </span>
                )}
                <Link
                  href={`/therapist/patients/${patient.patientId}`}
                  className="font-body text-sm font-semibold text-blue hover:underline"
                >
                  {t("t_pd_view_patient")}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}