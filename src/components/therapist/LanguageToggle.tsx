// src/components/therapist/LanguageToggle.tsx
"use client";

// Functional Urdu/English switch for the therapist workspace. Persists to
// TherapistProfile.language via PATCH /api/therapist/profile, then refreshes
// so the whole server-rendered workspace (layout + pages) re-renders.
import { useRouter } from "next/navigation";
import { useState } from "react";

export interface LanguageToggleLabels {
  title: string;
  desc: string;
  saving: string;
}

export default function LanguageToggle({
  initialLanguage,
  labels,
}: {
  initialLanguage: "en" | "ur";
  labels: LanguageToggleLabels;
}) {
  const router = useRouter();
  const [language, setLanguage] = useState<"en" | "ur">(initialLanguage);
  const [saving, setSaving] = useState(false);

  async function change(next: "en" | "ur") {
    if (next === language || saving) return;
    setLanguage(next);
    setSaving(true);

    try {
      await fetch("/api/therapist/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: next }),
      });
      // re-renders the therapist layout + every page in the new language
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-4 rounded-2xl border border-blue/20 bg-bluesoft p-5">
      <p className="font-body text-sm font-bold text-heading">
        {labels.title}
      </p>
      <p className="mt-1 font-body text-xs text-text/60">{labels.desc}</p>

      <div className="mt-4 grid max-w-xs grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => change("en")}
          disabled={saving}
          className={`rounded-xl border px-4 py-2.5 font-body text-sm font-semibold transition disabled:opacity-60 ${
            language === "en"
              ? "border-blue bg-blue/20 text-heading"
              : "border-blue/25 bg-background text-text/70 hover:bg-blue/10"
          }`}
        >
          English
        </button>
        <button
          type="button"
          onClick={() => change("ur")}
          disabled={saving}
          className={`rounded-xl border px-4 py-2.5 font-body text-sm font-semibold transition disabled:opacity-60 ${
            language === "ur"
              ? "border-blue bg-blue/20 text-heading"
              : "border-blue/25 bg-background text-text/70 hover:bg-blue/10"
          }`}
        >
          اردو
        </button>
      </div>

      {saving && (
        <p className="mt-2 font-body text-xs text-text/50">
          {labels.saving}
        </p>
      )}
    </div>
  );
}
