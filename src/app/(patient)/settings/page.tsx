// src/app/(patient)/settings/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import SettingsForm from "@/components/patient/SettingsForm";
import { getPatientT } from "@/lib/i18n/server";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { language, t } = await getPatientT(user._id.toString());

  const labels = {
    appearance: t("settings_appearance"),
    appearanceDesc: t("settings_appearance_desc"),
    darkMode: t("settings_dark_mode"),
    language: t("settings_language"),
    languageDesc: t("settings_language_desc"),
    account: t("settings_account"),
    accountDesc: t("settings_account_desc"),
    logout: t("settings_logout"),
    loggingOut: t("settings_logging_out"),
    saving: t("settings_saving"),
  };

  return (
    <div className="relative mx-auto max-w-2xl">
      <h1 className="mb-6 font-heading text-3xl font-bold text-heading">
        {t("settings_title")}
      </h1>
      <SettingsForm initialLanguage={language} labels={labels} />
    </div>
  );
}
