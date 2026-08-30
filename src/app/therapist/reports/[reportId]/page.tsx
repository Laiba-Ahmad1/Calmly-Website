// src/app/therapist/reports/[reportId]/page.tsx
// A single weekly AI report. Access requires an active connection to the
// patient the report belongs to — checked server-side.
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireTherapist } from "@/lib/therapist/guard";
import { getReportForTherapist } from "@/lib/therapist/reports";
import { formatDate, formatWeekRange } from "@/lib/format";

export default async function TherapistReportDetailPage({
  params,
}: {
  params: { reportId: string };
}) {
  const therapist = await requireTherapist();
  if (!therapist) redirect("/login");

  const data = await getReportForTherapist(
    therapist._id.toString(),
    params.reportId
  );
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
        ← Reports
      </Link>

      <header className="mt-4">
        <h1 className="font-body text-3xl font-extrabold text-heading">
          Weekly report — {patientUser.name}
        </h1>
        <p className="mt-2 font-body text-sm text-text/60">
          Week {report.weekNumber} · {formatWeekRange(report.weekStart, report.weekEnd)} ·
          generated {formatDate(report.generatedAt)}
        </p>
      </header>

      <div className="mt-8 flex flex-col gap-10">
        <section>
          <h2 className="font-body text-lg font-extrabold text-heading">
            Weekly Overview
          </h2>
          <p className="mt-2 border-l-2 border-blue/40 pl-4 font-body text-sm leading-relaxed text-text">
            {report.weeklyOverview}
          </p>
        </section>

        <section>
          <h2 className="font-body text-lg font-extrabold text-heading">
            Observed Patterns
          </h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 font-body text-sm leading-relaxed text-text">
            {report.observedPatterns?.map((pattern: string, i: number) => (
              <li key={i}>{pattern}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-body text-lg font-extrabold text-heading">
            Progress
          </h2>
          <p className="mt-2 border-l-2 border-blue/40 pl-4 font-body text-sm leading-relaxed text-text">
            {report.progress}
          </p>
        </section>

        <section>
          <h2 className="font-body text-lg font-extrabold text-heading">
            Suggested Areas for Therapist Attention
          </h2>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5 font-body text-sm leading-relaxed text-text">
            {report.suggestedAreas?.map((area: string, i: number) => (
              <li key={i}>{area}</li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="font-body text-lg font-extrabold text-heading">
            This week&apos;s numbers
          </h2>
          <dl className="mt-3 grid grid-cols-2 gap-x-8 gap-y-4 border-y border-blue/25 py-5 sm:grid-cols-3">
            <div>
              <dt className="font-body text-xs font-semibold uppercase tracking-wide text-text/50">
                Journals
              </dt>
              <dd className="mt-0.5 font-body text-lg font-extrabold text-heading">
                {stats.journalDays}/7 days
              </dd>
            </div>
            <div>
              <dt className="font-body text-xs font-semibold uppercase tracking-wide text-text/50">
                Avg mood
              </dt>
              <dd className="mt-0.5 font-body text-lg font-extrabold text-heading">
                {stats.moodAvg ?? "—"}/5
              </dd>
            </div>
            <div>
              <dt className="font-body text-xs font-semibold uppercase tracking-wide text-text/50">
                Avg sleep
              </dt>
              <dd className="mt-0.5 font-body text-lg font-extrabold text-heading">
                {stats.sleepAvg ?? "—"}/5
              </dd>
            </div>
            <div>
              <dt className="font-body text-xs font-semibold uppercase tracking-wide text-text/50">
                Weekly quiz
              </dt>
              <dd className="mt-0.5 font-body text-lg font-extrabold text-heading">
                {stats.quizCompleted ? "Completed" : "Not completed"}
              </dd>
            </div>
            <div>
              <dt className="font-body text-xs font-semibold uppercase tracking-wide text-text/50">
                Exercises
              </dt>
              <dd className="mt-0.5 font-body text-lg font-extrabold text-heading">
                {exerciseSummary || "None"}
              </dd>
            </div>
            <div>
              <dt className="font-body text-xs font-semibold uppercase tracking-wide text-text/50">
                Assigned to-do
              </dt>
              <dd className="mt-0.5 font-body text-sm font-extrabold leading-snug text-heading">
                {stats.taskText ? (
                  <>
                    {stats.taskText}
                    <span className="mt-0.5 block text-xs font-medium text-text/50">
                      {stats.taskCompleted
                        ? "completed during the week"
                        : "not completed during the week"}
                    </span>
                  </>
                ) : (
                  "None assigned"
                )}
              </dd>
            </div>
          </dl>
        </section>

        <div className="flex items-center justify-between">
          <p className="font-body text-xs italic text-text/40">
            This is a summary of logged information — not a diagnosis.
          </p>
          <Link
            href={`/therapist/patients/${report.userId.toString()}`}
            className="font-body text-sm font-semibold text-blue hover:underline"
          >
            View patient
          </Link>
        </div>
      </div>
    </div>
  );
}
