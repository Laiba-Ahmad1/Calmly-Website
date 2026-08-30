// src/app/therapist/requests/page.tsx
// Incoming patient connection requests — accept to connect, reject to dismiss.
import { redirect } from "next/navigation";
import { requireTherapist } from "@/lib/therapist/guard";
import { getPendingRequests } from "@/lib/therapist/requests";
import RequestsList from "@/components/therapist/RequestsList";
import { getTherapistT, therapistRelative } from "@/lib/i18n/server";
import { interpolate } from "@/lib/i18n/dictionaries";

export default async function TherapistRequestsPage() {
  const therapist = await requireTherapist();
  if (!therapist) redirect("/login");

  const [{ language, t }, requests] = await Promise.all([
    getTherapistT(therapist._id.toString()),
    getPendingRequests(therapist._id.toString()),
  ]);

  const initialRequests = requests.map((r) => ({
    ...r,
    requestedAt: interpolate(t("t_req_requested"), {
      when: therapistRelative(language, r.requestedAt),
    }),
  }));

  return (
    <div>
      <header>
        <h1 className="font-body text-3xl font-extrabold text-heading">
          {t("t_req_title")}
        </h1>
        <p className="mt-2 font-body text-sm text-text/60">
          {requests.length === 0
            ? t("t_req_empty")
            : interpolate(
                requests.length === 1
                  ? t("t_req_pending_one")
                  : t("t_req_pending_many"),
                { count: requests.length }
              )}
        </p>
      </header>

      <section className="mt-6">
        <RequestsList
          initialRequests={initialRequests}
          labels={{
            empty: t("t_req_empty"),
            accept: t("t_req_accept"),
            reject: t("t_req_reject"),
          }}
        />
      </section>
    </div>
  );
}
