// src/app/therapist/reports/page.tsx
// Weekly AI reports for the therapist's connected patients only.
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireTherapist } from "@/lib/therapist/guard";
import { getReportsForTherapist } from "@/lib/therapist/reports";
import { formatWeekRange, formatDate } from "@/lib/format";

export default async function TherapistReportsPage() {
  const therapist = await requireTherapist();
  if (!therapist) redirect("/login");

  const reports = await getReportsForTherapist(therapist._id.toString());

  return (
    <div>
      <header>
        <h1 className="font-body text-3xl font-extrabold text-heading">
          Reports
        </h1>
        <p className="mt-2 font-body text-sm text-text/60">
          Weekly AI reports for your connected patients — one per patient per
          completed week.
        </p>
      </header>

      {reports.length === 0 ? (
        <div className="mt-8 border-t border-blue/20 pt-6">
          <p className="font-body text-sm text-text/70">
            No reports yet. A patient&apos;s first weekly report is generated
            automatically once they complete a full week in Calmly.
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
                  Week {report.weekNumber} ·{" "}
                  {formatWeekRange(report.weekStart, report.weekEnd)} ·
                  generated {formatDate(report.generatedAt)}
                </p>
                <p className="mt-2 line-clamp-2 font-body text-sm text-text/70">
                  {report.weeklyOverview}
                </p>
              </div>
              <Link
                href={`/therapist/reports/${report.id}`}
                className="shrink-0 font-body text-sm font-semibold text-blue hover:underline"
              >
                View report
              </Link>
            </div>
          ))}
        </div>
      )}

      <p className="mt-10 border-t border-blue/15 pt-4 font-body text-xs italic text-text/40">
        Reports interpret logged information with careful, observational
        language. They are not a diagnosis.
      </p>
    </div>
  );
}
