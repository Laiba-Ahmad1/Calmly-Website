// src/app/therapist/notifications/page.tsx
// Therapist notification center. Visiting marks everything as read.
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireTherapist } from "@/lib/therapist/guard";
import { getNotificationsForUser, markAllRead } from "@/lib/notifications";
import { formatRelative } from "@/lib/format";

export default async function TherapistNotificationsPage() {
  const therapist = await requireTherapist();
  if (!therapist) redirect("/login");

  const notifications = await getNotificationsForUser(therapist._id);

  if (notifications.some((n) => !n.read)) {
    await markAllRead(therapist._id);
  }

  return (
    <div>
      <h1 className="font-body text-3xl font-extrabold text-heading">
        Notifications
      </h1>

      {notifications.length === 0 ? (
        <p className="mt-8 font-body text-sm text-text/60">
          You&apos;re all caught up.
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {notifications.map((n) => {
            const inner = (
              <>
                <p className="font-body text-sm font-semibold text-text">
                  {n.title}
                  {!n.read && (
                    <span className="ml-2 inline-block h-2 w-2 rounded-full bg-blue align-middle" />
                  )}
                </p>
                <p className="mt-0.5 font-body text-sm text-text/60">{n.message}</p>
                <p className="mt-1 font-body text-xs text-text/40">
                  {formatRelative(n.createdAt)}
                </p>
              </>
            );

            return n.link ? (
              <Link
                key={n._id.toString()}
                href={n.link}
                className={`rounded-2xl border p-5 transition hover:-translate-y-0.5 ${
                  n.read
                    ? "border-blue/15 bg-bluesoft"
                    : "border-blue/30 bg-blue/10"
                }`}
              >
                {inner}
              </Link>
            ) : (
              <div
                key={n._id.toString()}
                className={`rounded-2xl border p-5 ${
                  n.read
                    ? "border-blue/15 bg-bluesoft"
                    : "border-blue/30 bg-blue/10"
                }`}
              >
                {inner}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
