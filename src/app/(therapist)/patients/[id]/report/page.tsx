// AI weekly report view — overview, patterns, progress, attention points, therapist questions
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAssignedPatient } from "@/lib/therapist/getAssignedPatient";
import PatientAIReport from "@/models/PatientAIReport";

export default async function PatientReportPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "therapist") {
    redirect("/login");
  }

  const data = await getAssignedPatient(user._id.toString(), params.id);
  if (!data) notFound();

  const { patientUser } = data;

  const report = await PatientAIReport.findOne({ userId: params.id }).sort({ weekStart: -1 });

  return (
    <div className="mx-auto max-w-3xl p-8">
      <Link
        href={`/patients/${params.id}`}
        className="text-sm text-heading underline underline-offset-4"
      >
        ← Back to {patientUser.name}
      </Link>

      <h1 className="mt-4 font-heading text-3xl text-heading">
        Weekly overview — {patientUser.name}
      </h1>

      {!report && (
        <p className="mt-8 text-sm opacity-60">
          No report available yet. Reports generate automatically once this patient has completed
          at least one full week.
        </p>
      )}

      {report && (
        <div className="mt-6 flex flex-col gap-8">
          <p className="text-sm opacity-50">
            Week {report.weekNumber} · {report.weekStart.toISOString().slice(0, 10)} –{" "}
            {report.weekEnd.toISOString().slice(0, 10)}
          </p>

          <section>
            <h2 className="font-heading text-lg font-bold text-heading">Weekly Overview</h2>
            <p className="mt-2 border-l-2 border-green/40 pl-4 text-sm text-text">
              {report.weeklyOverview}
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-heading">Observed Patterns</h2>
            <ul className="mt-2 list-disc pl-5 text-sm text-text">
              {report.observedPatterns.map((p: string, i: number) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-heading">Progress</h2>
            <p className="mt-2 border-l-2 border-green/40 pl-4 text-sm text-text">
              {report.progress}
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-heading">
              Suggested Areas for Therapist Attention
            </h2>
            <ol className="mt-2 list-decimal pl-5 text-sm text-text">
              {report.suggestedAreas.map((a: string, i: number) => (
                <li key={i}>{a}</li>
              ))}
            </ol>
          </section>

          <section className="rounded-2xl border border-green/30 bg-green/10 p-5">
            <h2 className="font-heading text-base font-bold text-heading">This week's stats</h2>
            <ul className="mt-2 grid grid-cols-2 gap-2 text-sm text-text sm:grid-cols-3">
              <li>Journal: {report.stats.journalDays}/7 days</li>
              <li>Avg mood: {report.stats.moodAvg ?? "—"}/5</li>
              <li>Avg sleep: {report.stats.sleepAvg ?? "—"}/5</li>
              <li>Quiz: {report.stats.quizCompleted ? "Completed" : "Not completed"}</li>
              {Object.entries(report.stats.exerciseCounts as Record<string, number>).map(
                ([type, count]) => (
                  <li key={type}>
                    {type}: {count}
                  </li>
                )
              )}
            </ul>
          </section>

          <p className="text-xs italic opacity-40">
            This is a summary of logged information, not a diagnosis.
          </p>
        </div>
      )}
    </div>
  );
}