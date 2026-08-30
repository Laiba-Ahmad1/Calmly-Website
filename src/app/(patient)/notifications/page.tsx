// src/app/(patient)/notifications/page.tsx
// In-app notification center. Visiting marks everything as read.
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getNotificationsForUser, markAllRead } from "@/lib/notifications";
import { getPatientT } from "@/lib/i18n/server";
import { formatRelative } from "@/lib/format";
import type { TFunction } from "@/lib/i18n/dictionaries";

// System-generated notification text is stored in English; it's translated at
// display time. Advice messages quote the therapist's own words — those stay
// verbatim.
function displayText(
  n: { type: string; title: string; message: string },
  t: TFunction
): { title: string; message: string } {
  switch (n.type) {
    case "quiz_available":
      return { title: t("notif_quiz_title"), message: t("notif_quiz_message") };
    case "journal_due":
      return {
        title: t("notif_journal_title"),
        message: t("notif_journal_message"),
      };
    case "therapist_advice":
      return { title: t("notif_advice_title"), message: n.message };
    case "therapist_feedback":
      return {
        title: t("notif_feedback_title"),
        message: t("notif_feedback_message"),
      };
    default:
      return { title: n.title, message: n.message };
  }
}

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [notifications, { t }] = await Promise.all([
    getNotificationsForUser(user._id),
    getPatientT(user._id.toString()),
  ]);

  if (notifications.some((n) => !n.read)) {
    await markAllRead(user._id);
  }

  return (
    <div className="relative mx-auto max-w-2xl">
      <h1 className="font-body text-3xl font-extrabold text-heading">
        {t("notifications_title")}
      </h1>

      {notifications.length === 0 ? (
        <p className="mt-8 font-body text-sm text-text/60">
          {t("notifications_empty")}
        </p>
      ) : (
        <div className="mt-6 flex flex-col">
          {notifications.map((n) => {
            const { title, message } = displayText(n, t);
            const inner = (
              <>
                <p className="font-body text-sm font-semibold text-text">
                  {title}
                  {!n.read && (
                    <span className="ml-2 inline-block h-2 w-2 rounded-full bg-green align-middle" />
                  )}
                </p>
                <p className="mt-0.5 font-body text-sm text-text/60">{message}</p>
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
                    ? "border-green/15 bg-green/5"
                    : "border-green/30 bg-green/15"
                }`}
              >
                {inner}
              </Link>
            ) : (
              <div
                key={n._id.toString()}
                className={`rounded-2xl border p-5 ${
                  n.read
                    ? "border-green/15 bg-green/5"
                    : "border-green/30 bg-green/15"
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
