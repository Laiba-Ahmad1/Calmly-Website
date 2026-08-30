// src/app/therapist/requests/page.tsx
// Incoming patient connection requests — accept to connect, reject to dismiss.
import { redirect } from "next/navigation";
import { requireTherapist } from "@/lib/therapist/guard";
import { getPendingRequests } from "@/lib/therapist/requests";
import RequestsList from "@/components/therapist/RequestsList";
import { formatRelative } from "@/lib/format";

export default async function TherapistRequestsPage() {
  const therapist = await requireTherapist();
  if (!therapist) redirect("/login");

  const requests = await getPendingRequests(therapist._id.toString());

  const initialRequests = requests.map((r) => ({
    ...r,
    requestedAt: formatRelative(r.requestedAt),
  }));

  return (
    <div>
      <header>
        <h1 className="font-body text-3xl font-extrabold text-heading">
          Requests
        </h1>
        <p className="mt-2 font-body text-sm text-text/60">
          {requests.length === 0
            ? "Patients who want to work with you will send requests here."
            : `${requests.length} pending ${requests.length === 1 ? "request" : "requests"}. Accepting connects the patient to you in Calmly.`}
        </p>
      </header>

      <section className="mt-6">
        <RequestsList initialRequests={initialRequests} />
      </section>
    </div>
  );
}
