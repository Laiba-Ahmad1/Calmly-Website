// src/app/therapist/reports/[reportId]/page.tsx
// A single weekly AI report. Access requires an active connection to the
// patient the report belongs to — checked server-side.
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireTherapist } from "@/lib/therapist/guard";
import { getReportForTherapist } from "@/lib/therapist/reports";
import { formatDate, formatWeekRange } from "@/lib/format";
import { getTherapistT } from "@/lib/i18n/server";
import { interpolate } from "@/lib/i18n/dictionaries";

export default async function TherapistReportDetailPage({
  params,
}: {
  params: { reportId: string };
}) {
  const therapist = await requireTherapist();
  if (!therapist) redirect("/login");

  const [{ t }, data] = await Promise.all([
    getTherapistT(therapist._id.toString()),
    getReportForTherapist(therapist._id.toString(), params.reportId),
  ]);
  if (!data) notFound();

  const { report, patientUser } = data;
  const stats = report.stats ?? {
    journalDays: 0,
    moodAvg: null,
    sleepAvg: null,
    quizCompleted: false,
    exerciseCounts: {},
    taskText: null,
    taskCompleted: null,
  };

  const exerciseSummary = Object.entries(stats.exerciseCounts ?? {})
    .map(([type, count]) => `${type.replace("_", " ")} ×${count}`)
    .join(" · ");

  return (
    <div>
      <Link
        href="/therapist/reports"
        className="font-body text-sm text-heading underline-offset-4 hover:underline"
      >
        ← {t("t_reports_title")}
      </Link>

      <header className="mt-4">
        <h1 className="font-body text-3xl font-extrabold text-heading">
          {interpolate(t("t_report_title"), { name: patientUser.name })}
        </h1>
        <p className="mt-2 font-body text-sm text-text/60">
          {interpolate(t("t_report_week_line"), {
            week: report.weekNumber,
            range: formatWeekRange(report.weekStart, report.weekEnd),
            date: formatDate(report.generatedAt),
          })}
        </p>
      </header>

      <div className="mt-8 flex flex-col gap-10">
        <section>
          <h2 className="font-body text-lg font-extrabold text-heading">
            {t("t_report_overview")}
          </h2>
          <p className="mt-2 border-l-2 border-blue/40 pl-4 font-body text-sm leading-relaxed text-text">
            {report.weeklyOverview}
          </p>
        </section>

        <section>
          <h2 className="font-body text-lg font-extrabold text-heading">
            {t("t_report_patterns")}
          </h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 font-body text-sm leading-relaxed text-text">
            {report.observedPatterns?.map((pattern: string, i: number) => (
              <li key={i}>{pattern}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-body text-lg font-extrabold text-heading">
            {t("t_report_progress")}
          </h2>
          <p className="mt-2 border-l-2 border-blue/40 pl-4 font-body text-sm leading-relaxed text-text">
            {report.progress}
          </p>
        </section>

        <section>
          <h2 className="font-body text-lg font-extrabold text-heading">
            {t("t_report_areas")}
          </h2>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5 font-body text-sm leading-relaxed text-text">
            {report.suggestedAreas?.map((area: string, i: number) => (
              <li key={i}>{area}</li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="font-body text-lg font-extrabold text-heading">
            {t("t_report_numbers")}
          </h2>
          <dl className="mt-3 grid grid-cols-2 gap-x-8 gap-y-4 border-y border-blue/25 py-5 sm:grid-cols-3">
            <div>
              <dt className="font-body text-xs font-semibold uppercase tracking-wide text-text/50">
                {t("t_report_stat_journals")}
              </dt>
              <dd className="mt-0.5 font-body text-lg font-extrabold text-heading">
                {interpolate(t("t_report_days"), { days: stats.journalDays })}
              </dd>
            </div>
            <div>
              <dt className="font-body text-xs font-semibold uppercase tracking-wide text-text/50">
                {t("t_report_stat_mood")}
              </dt>
              <dd className="mt-0.5 font-body text-lg font-extrabold text-heading">
                {stats.moodAvg ?? "—"}/5
              </dd>
            </div>
            <div>
              <dt className="font-body text-xs font-semibold uppercase tracking-wide text-text/50">
                {t("t_report_stat_sleep")}
              </dt>
              <dd className="mt-0.5 font-body text-lg font-extrabold text-heading">
                {stats.sleepAvg ?? "—"}/5
              </dd>
            </div>
            <div>
              <dt className="font-body text-xs font-semibold uppercase tracking-wide text-text/50">
                {t("t_report_stat_quiz")}
              </dt>
              <dd className="mt-0.5 font-body text-lg font-extrabold text-heading">
                {stats.quizCompleted
                  ? t("t_report_completed")
                  : t("t_report_not_completed")}
              </dd>
            </div>
            <div>
              <dt className="font-body text-xs font-semibold uppercase tracking-wide text-text/50">
                {t("t_report_stat_exercises")}
              </dt>
              <dd className="mt-0.5 font-body text-lg font-extrabold text-heading">
                {exerciseSummary || t("t_report_none")}
              </dd>
            </div>
            <div>
              <dt className="font-body text-xs font-semibold uppercase tracking-wide text-text/50">
                {t("t_report_stat_task")}
              </dt>
              <dd className="mt-0.5 font-body text-sm font-extrabold leading-snug text-heading">
                {stats.taskText ? (
                  <>
                    {stats.taskText}
                    <span className="mt-0.5 block text-xs font-medium text-text/50">
                      {stats.taskCompleted
                        ? t("t_report_task_completed")
                        : t("t_report_task_not_completed")}
                    </span>
                  </>
                ) : (
                  t("t_report_none_assigned")
                )}
              </dd>
            </div>
          </dl>
        </section>

        <div className="flex items-center justify-between">
          <p className="font-body text-xs italic text-text/40">
            {t("t_report_disclaimer")}
          </p>
          <Link
            href={`/therapist/patients/${report.userId.toString()}`}
            className="font-body text-sm font-semibold text-blue hover:underline"
          >
            {t("t_pd_view_patient")}
          </Link>
        </div>
      </div>
    </div>
  );
}
