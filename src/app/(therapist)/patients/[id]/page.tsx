// Single patient profile — graphs, exercises, tasks, journal count, link to AI report
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAssignedPatient } from "@/lib/therapist/getAssignedPatient";
import Journal from "@/models/Journal";

export default async function PatientDetailPage({
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

  const { patientUser, patientProfile } = data;

  const recentJournalEntries = await Journal.find({ patientId: params.id })
    .sort({ date: -1 })
    .limit(10)
    .select("date mood sleepQuality feelings reflection");

  return (
    <div className="mx-auto max-w-4xl p-8">
      <Link href="/patients" className="text-sm text-heading underline underline-offset-4">
        ← Back to patients
      </Link>

      <h1 className="mt-4 font-heading text-3xl text-heading">{patientUser.name}</h1>
      <p className="text-sm opacity-60">
        Anxiety type: {patientProfile.anxietyType} · Plant growth: {patientProfile.plant.growth}
      </p>

      <Link
        href={`/patients/${params.id}/report`}
        className="mt-6 inline-block rounded-full bg-green px-5 py-2.5 font-body text-sm font-semibold text-background"
      >
        View weekly AI report
      </Link>

      <h2 className="mt-10 font-heading text-xl font-bold text-heading">Recent journal entries</h2>

      <div className="mt-4 flex flex-col gap-3">
        {recentJournalEntries.length === 0 && (
          <p className="text-sm opacity-60">No journal entries yet.</p>
        )}

        {recentJournalEntries.map((entry) => (
          <div
            key={entry._id.toString()}
            className="rounded-2xl border border-green/30 bg-green/10 p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-wide opacity-50">
              {entry.date.toISOString().slice(0, 10)} · Mood {entry.mood}/5 · Sleep {entry.sleepQuality}/5
            </p>
            <p className="mt-2 text-sm text-text">
              <span className="font-semibold">Feelings:</span> {entry.feelings}
            </p>
            <p className="mt-1 text-sm text-text">
              <span className="font-semibold">Reflection:</span> {entry.reflection}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}