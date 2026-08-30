// src/app/therapist/reports/page.tsx
// Weekly AI reports for the therapist's connected patients only.
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireTherapist } from "@/lib/therapist/guard";
import { getReportsForTherapist } from "@/lib/therapist/reports";
import { formatWeekRange, formatDate } from "@/lib/format";
import { getTherapistT } from "@/lib/i18n/server";
import { interpolate } from "@/lib/i18n/dictionaries";

export default async function TherapistReportsPage() {
  const therapist = await requireTherapist();
  if (!therapist) redirect("/login");

  const [{ t }, reports] = await Promise.all([
    getTherapistT(therapist._id.toString()),
    getReportsForTherapist(therapist._id.toString()),
  ]);

  return (
    <div>
      <header>
        <h1 className="font-body text-3xl font-extrabold text-heading">
          {t("t_reports_title")}
        </h1>
        <p className="mt-2 font-body text-sm text-text/60">
          {t("t_reports_subtitle")}
        </p>
      </header>

      {reports.length === 0 ? (
        <div className="mt-8 border-t border-blue/20 pt-6">
          <p className="font-body text-sm text-text/70">
            {t("t_reports_empty")}
          </p>
        </div>
      ) : (
        <div className="mt-6">
          {reports.map((report) => (
            <div
              key={report.id}
              className="flex flex-col gap-2 border-b border-blue/15 py-5 sm:flex-row sm:items-baseline sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-body font-bold text-heading">
                  {report.patientName}
                </p>
                <p className="mt-0.5 font-body text-xs text-text/50">
                  {interpolate(t("t_week"), { week: report.weekNumber })} ·{" "}
                  {formatWeekRange(report.weekStart, report.weekEnd)} ·{" "}
                  {interpolate(t("t_reports_generated"), {
                    date: formatDate(report.generatedAt),
                  })}
                </p>
                <p className="mt-2 line-clamp-2 font-body text-sm text-text/70">
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
          ))}
        </div>
      )}

      <p className="mt-10 border-t border-blue/15 pt-4 font-body text-xs italic text-text/40">
        {t("t_reports_disclaimer")}
      </p>
    </div>
  );
}
