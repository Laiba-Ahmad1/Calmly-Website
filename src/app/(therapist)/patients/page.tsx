// Full patient list for this therapist
import Link from "next/link";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import TherapistPatient from "@/models/TherapistPatient";
import Users from "@/models/User";

export default async function PatientsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "therapist") {
    redirect("/login");
  }

  await db();

  const assignments = await TherapistPatient.find({
    therapistId: user._id,
    status: "active",
  }).sort({ assignedAt: -1 });

  const patientIds = assignments.map((a) => a.patientId);
  const patients = await Users.find({ _id: { $in: patientIds } }).select("name email");
  const patientsById = new Map(patients.map((p) => [p._id.toString(), p]));

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="font-heading text-3xl text-heading">Your patients</h1>

      <div className="mt-6 flex flex-col gap-3">
        {assignments.length === 0 && (
          <p className="text-sm opacity-60">No active patients yet.</p>
        )}

        {assignments.map((a) => {
          const patient = patientsById.get(a.patientId.toString());
          if (!patient) return null;

          return (
            <Link
              key={a._id.toString()}
              href={`/patients/${a.patientId}`}
              className="flex items-center justify-between rounded-2xl border border-green/30 bg-green/10 p-5 transition hover:-translate-y-0.5 hover:bg-green/15"
            >
              <div>
                <p className="font-semibold text-text">{patient.name}</p>
                <p className="text-sm opacity-60">{patient.email}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}