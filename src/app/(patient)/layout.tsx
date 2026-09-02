// src/app/(patient)/layout.tsx
import Sidebar from "@/components/patient/Sidebar";
import { getCurrentUser } from "@/lib/auth";
import db from "@/lib/db";
import { getPatientLanguage } from "@/lib/i18n/server";
import { tFor } from "@/lib/i18n/dictionaries";
import { getUnreadCount } from "@/lib/notifications";
import { ensurePatientNotifications } from "@/lib/patientNotifications";

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const userName = (user as any)?.name ?? "there";
  const userEmail = (user as any)?.email ?? "";

  // Language preference, unread notifications, and availability reminders
  // (quiz ready / journal due) — all server-side, all cheap indexed lookups.
  let language: "en" | "ur" = "en";
  let notificationCount = 0;

  if (user) {
    await db();
    [language, notificationCount] = await Promise.all([
      getPatientLanguage(user._id.toString()),
      getUnreadCount(user._id),
    ]);
    await ensurePatientNotifications(user._id.toString(), new Date(user.createdAt));
  }

  const t = tFor(language);
  const labels = {
    home: t("nav_home"),
    feedback: t("nav_feedback"),
    therapists: t("nav_therapists"),
    settings: t("nav_settings"),
    guide: t("Guide to Calmly"),
    notifications: t("nav_notifications"),
  };

  return (
    <div
      dir={language === "ur" ? "rtl" : "ltr"}
      className="relative min-h-screen overflow-hidden bg-canvas "
    >
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-white/10" />

      <Sidebar
        userName={userName}
        userEmail={userEmail}
        labels={labels}
        notificationCount={notificationCount}
      />

      {/* pt-20 clears the fixed menu button in the top-left corner */}
      <main className="relative p-4 pt-20 sm:p-8">{children}</main>
    </div>
  );
}
