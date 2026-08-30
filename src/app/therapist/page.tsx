// src/app/therapist/page.tsx
// Therapist dashboard — "How are my patients doing?" based on weekly reports.
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireTherapist } from "@/lib/therapist/guard";
import { getTherapistPatients, TherapistPatientSummary } from "@/lib/therapist/patients";
import { getPendingRequests } from "@/lib/therapist/requests";
import { getReportsForTherapist } from "@/lib/therapist/reports";
import { formatShortDate, formatWeekRange } from "@/lib/format";
import { getTherapistT, therapistGreeting } from "@/lib/i18n/server";
import { interpolate, type TFunction } from "@/lib/i18n/dictionaries";

// Heuristic flags from a patient's LATEST weekly report — explicitly not a
// live status, just "what the most recent report says".
function attentionReasons(p: TherapistPatientSummary, t: TFunction): string[] {
  const r = p.latestReport;
  if (!r) return [];

  const reasons: string[] = [];
  if (r.moodTrend === "down") reasons.push(t("t_reason_mood"));
  if (r.sleepTrend === "down") reasons.push(t("t_reason_sleep"));
  if (r.quizTrend === "up") reasons.push(t("t_reason_quiz"));
  if (r.journalDays <= 2)
    reasons.push(interpolate(t("t_reason_journal"), { days: r.journalDays }));
  if (!r.quizCompleted) reasons.push(t("t_reason_quiz_missing"));
  return reasons;
}

export default async function TherapistDashboardPage() {
  const therapist = await requireTherapist();
  if (!therapist) redirect("/login");

  const [{ language, t }, patients, requests, reports] = await Promise.all([
    getTherapistT(therapist._id.toString()),
    getTherapistPatients(therapist._id.toString()),
    getPendingRequests(therapist._id.toString()),
    getReportsForTherapist(therapist._id.toString(), 5),
  ]);

  const needsAttention = patients
    .map((p) => ({ patient: p, reasons: attentionReasons(p, t) }))
    .filter((x) => x.reasons.length > 0);

  return (
    <div>
      <header>
        <p className="font-body text-sm text-text/60">
          {therapistGreeting(language)},
        </p>
        <h1 className="mt-1 font-body text-3xl font-extrabold text-heading">
          {therapist.name}
        </h1>
      </header>

      {/* Overview */}
      <dl className="mt-8 flex flex-wrap gap-x-12 gap-y-5 border-y border-blue/25 py-6">
        <div>
          <dt className="font-body text-xs font-semibold uppercase tracking-wide text-text/50">
            {t("t_dash_active_patients")}
          </dt>
          <dd className="mt-1 font-body text-3xl font-extrabold text-heading">
            {patients.length}
          </dd>
        </div>
        <div>
          <dt className="font-body text-xs font-semibold uppercase tracking-wide text-text/50">
            {t("t_dash_pending_requests")}
          </dt>
          <dd className="mt-1 font-body text-3xl font-extrabold text-heading">
            {requests.length}
          </dd>
        </div>
        <div>
          <dt className="font-body text-xs font-semibold uppercase tracking-wide text-text/50">
            {t("t_dash_recent_reports")}
          </dt>
          <dd className="mt-1 font-body text-3xl font-extrabold text-heading">
            {reports.length}
          </dd>
        </div>
        {requests.length > 0 && (
          <div className="flex items-end">
            <Link
              href="/therapist/requests"
              className="font-body text-sm font-semibold text-blue underline-offset-4 hover:underline"
            >
              {t("t_dash_review_requests")}
            </Link>
          </div>
        )}
      </dl>

      {/* Patients to review */}
      <section className="mt-10">
        <h2 className="font-body text-lg font-extrabold text-heading">
          {t("t_dash_review_title")}
        </h2>
        <p className="mt-1 font-body text-xs text-text/50">
          {t("t_dash_review_desc")}
        </p>

        {needsAttention.length === 0 && (
          <p className="mt-4 font-body text-sm text-text/60">
            {patients.length === 0
              ? t("t_dash_no_patients")
              : t("t_dash_nothing_flagged")}
          </p>
        )}

        <div className="mt-4">
          {needsAttention.map(({ patient, reasons }) => (
            <div
              key={patient.patientId}
              className="flex flex-col gap-2 border-b border-blue/15 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <Link
                  href={`/therapist/patients/${patient.patientId}`}
                  className="font-body font-bold text-heading hover:underline"
                >
                  {patient.name}
                </Link>
                <p className="mt-0.5 font-body text-sm capitalize text-text/70">
                  {reasons.join(" · ")}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-5">
                <span className="font-body text-xs text-text/50">
                  {interpolate(t("t_dash_report_of"), {
                    date: formatShortDate(patient.latestReport!.weekEnd),
                  })}
                </span>
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
      </section>

      {/* Recent weekly reports */}
      <section className="mt-12">
        <div className="flex items-baseline justify-between">
          <h2 className="font-body text-lg font-extrabold text-heading">
            {t("t_dash_reports_title")}
          </h2>
          <Link
            href="/therapist/reports"
            className="font-body text-sm font-semibold text-blue hover:underline"
          >
            {t("t_dash_all_reports")}
          </Link>
        </div>

        {reports.length === 0 ? (
          <p className="mt-4 font-body text-sm text-text/60">
            {t("t_dash_no_reports")}
          </p>
        ) : (
          <div className="mt-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="border-b border-blue/15 py-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-body font-bold text-heading">
                      {report.patientName}
                      <span className="ml-3 font-body text-xs font-medium text-text/50">
                        {interpolate(t("t_week"), { week: report.weekNumber })}{" "}
                        · {formatWeekRange(report.weekStart, report.weekEnd)}
                      </span>
                    </p>
                    <p className="mt-1 line-clamp-2 font-body text-sm text-text/70">
                      {report.weeklyOverview}
                    </p>
                  </div>
                  <Link
                    href={`/therapist/reports/${report.id}`}
                    className="shrink-0 font-body text-sm font-semibold text-blue hover:underline"
                  >
                    {t("t_reports_view")}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="mt-12 border-t border-blue/15 pt-4 font-body text-xs italic text-text/40">
        {t("t_dash_disclaimer")}
      </p>
    </div>
  );
}
