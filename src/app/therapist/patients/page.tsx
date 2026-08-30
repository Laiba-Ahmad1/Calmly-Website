// src/app/therapist/patients/page.tsx
// Connected patients — clean rows, no card grid.
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireTherapist } from "@/lib/therapist/guard";
import { getTherapistPatients } from "@/lib/therapist/patients";
import { formatShortDate, formatRelative } from "@/lib/format";

export default async function TherapistPatientsPage() {
  const therapist = await requireTherapist();
  if (!therapist) redirect("/login");

  const patients = await getTherapistPatients(therapist._id.toString());

  return (
    <div>
      <header>
        <h1 className="font-body text-3xl font-extrabold text-heading">
          Patients
        </h1>
        <p className="mt-2 font-body text-sm text-text/60">
          {patients.length === 0
            ? "You are not working with any patients yet."
            : `${patients.length} connected ${patients.length === 1 ? "patient" : "patients"}.`}
        </p>
      </header>

      {patients.length === 0 ? (
        <div className="mt-8 border-t border-blue/20 pt-6">
          <p className="font-body text-sm text-text/70">
            Accept a patient request to start working together.
          </p>
          <Link
            href="/therapist/requests"
            className="mt-3 inline-block font-body text-sm font-semibold text-blue hover:underline"
          >
            Go to requests
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
                  className="font-body font-bold text-heading hover:underline"
                >
                  {patient.name}
                </Link>
                <p className="mt-0.5 font-body text-sm text-text/60">
                  {patient.anxietyType ? (
                    <span className="capitalize">{patient.anxietyType} anxiety</span>
                  ) : (
                    "Anxiety type not set"
                  )}
                  {patient.connectedSince && (
                    <> · connected since {formatShortDate(patient.connectedSince)}</>
                  )}
                </p>
                <p className="mt-0.5 font-body text-sm text-text/50">
                  {patient.lastJournalDate
                    ? `Last journal ${formatRelative(patient.lastJournalDate)}`
                    : "No journals yet"}
                  {patient.latestReport
                    ? ` · last report ${formatShortDate(patient.latestReport.weekEnd)}`
                    : " · no report yet"}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-5">
                {patient.latestReport && (
                  <span className="hidden font-body text-xs text-text/50 md:block">
                    Mood {patient.latestReport.moodAvg ?? "—"}/5 · Sleep{" "}
                    {patient.latestReport.sleepAvg ?? "—"}/5
                  </span>
                )}
                <Link
                  href={`/therapist/patients/${patient.patientId}`}
                  className="font-body text-sm font-semibold text-blue hover:underline"
                >
                  View patient
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
