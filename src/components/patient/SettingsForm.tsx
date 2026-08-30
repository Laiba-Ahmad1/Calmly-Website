// src/components/patient/SettingsForm.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";

export interface SettingsLabels {
  appearance: string;
  appearanceDesc: string;
  darkMode: string;
  language: string;
  languageDesc: string;
  account: string;
  accountDesc: string;
  logout: string;
  loggingOut: string;
  saving: string;
}

export default function SettingsForm({
  initialLanguage,
  labels,
}: {
  initialLanguage: "en" | "ur";
  labels: SettingsLabels;
}) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [language, setLanguage] = useState<"en" | "ur">(initialLanguage);
  const [loggingOut, setLoggingOut] = useState(false);
  const [savingLanguage, setSavingLanguage] = useState(false);

  async function handleLanguageChange(next: "en" | "ur") {
    if (next === language) return;
    setLanguage(next);
    setSavingLanguage(true);

    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: next }),
      });
      // re-renders the whole patient layout + pages in the new language
      router.refresh();
    } finally {
      setSavingLanguage(false);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ---------- appearance ---------- */}
      <div className="rounded-2xl border border-green/20 bg-background p-6 shadow-sm">
        <p className="font-semibold text-text">{labels.appearance}</p>
        <p className="mt-1 text-sm text-text/60">{labels.appearanceDesc}</p>

        <button
          type="button"
          onClick={toggleTheme}
          className="mt-4 flex w-full items-center justify-between rounded-xl border border-green/20 bg-green/10 px-4 py-3"
        >
          <span className="text-sm font-medium text-text">{labels.darkMode}</span>
          <span
            className={`relative h-6 w-11 rounded-full transition-colors ${
              theme === "dark" ? "bg-green" : "bg-green/30"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-background shadow-sm transition-transform ${
                theme === "dark" ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </span>
        </button>
      </div>

      {/* ---------- language ---------- */}
      <div className="rounded-2xl border border-green/20 bg-background p-6 shadow-sm">
        <p className="font-semibold text-text">{labels.language}</p>
        <p className="mt-1 text-sm text-text/60">{labels.languageDesc}</p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleLanguageChange("en")}
            disabled={savingLanguage}
            className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
              language === "en"
                ? "border-green bg-green/20 text-heading"
                : "border-green/20 bg-green/5 text-text/70"
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => handleLanguageChange("ur")}
            disabled={savingLanguage}
            className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
              language === "ur"
                ? "border-green bg-green/20 text-heading"
                : "border-green/20 bg-green/5 text-text/70"
            }`}
          >
            اردو
          </button>
        </div>

        {savingLanguage && (
          <p className="mt-2 font-body text-xs text-text/50">{labels.saving}</p>
        )}
      </div>

      {/* ---------- account ---------- */}
      <div className="rounded-2xl border border-red-500/20 bg-background p-6 shadow-sm">
        <p className="font-semibold text-text">{labels.account}</p>
        <p className="mt-1 text-sm text-text/60">{labels.accountDesc}</p>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="mt-4 w-full rounded-xl border border-red-400/40 bg-red-500/10 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-500/15 disabled:opacity-50"
        >
          {loggingOut ? labels.loggingOut : labels.logout}
        </button>
      </div>
    </div>
  );
}
