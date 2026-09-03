// src/components/patient/ProfileForm.tsx
"use client";

// Edits only patient-editable fields: name, age, language.
import { useRouter } from "next/navigation";
import { useState } from "react";

export interface ProfileFormLabels {
  name: string;
  age: string;
  language: string;
  save: string;
  saving: string;
  saved: string;
  english: string;
  urdu: string;
}

export default function ProfileForm({
  initialName,
  initialAge,
  initialLanguage,
  labels,
}: {
  initialName: string;
  initialAge: number | null;
  initialLanguage: "en" | "ur";
  labels: ProfileFormLabels;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [age, setAge] = useState(initialAge === null ? "" : String(initialAge));
  const [language, setLanguage] = useState<"en" | "ur">(initialLanguage);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          age: age.trim() === "" ? null : Number(age),
          language,
        }),
      }
    );

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save changes");
        return;
      }

      setSaved(true);
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSaving(false);
    }
  }

  const inputClasses = "w-full rounded-xl border border-green/25 bg-background px-4 py-2.5 font-body text-sm text-text outline-none placeholder:text-text/35 focus:border-green/60";
  
  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="font-body text-sm font-bold text-heading">
            {labels.name}
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            minLength={2}
            maxLength={60}
            required
            className={inputClasses}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-body text-sm font-bold text-heading">
            {labels.age}
          </span>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            min={1}
            max={120}
            placeholder="—"
            className={inputClasses}
          />
        </label>
      </div>

      <div className="mt-4">
        <span className="font-body text-sm font-bold text-heading">
          {labels.language}
        </span>
        <div className="mt-1.5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setLanguage("en")}
            className={`rounded-xl border px-4 py-2.5 font-body text-sm font-medium transition ${
              language === "en"
                ? "border-green bg-green/20 text-heading"
                : "border-green/20 bg-green/5 text-text/70"
            }`}
          >
            {labels.english}
          </button>
          <button
            type="button"
            onClick={() => setLanguage("ur")}
            className={`rounded-xl border px-4 py-2.5 font-body text-sm font-medium transition ${
              language === "ur"
                ? "border-green bg-green/20 text-heading"
                : "border-green/20 bg-green/5 text-text/70"
            }`}
          >
            {labels.urdu}
          </button>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-green px-6 py-2.5 font-body text-sm font-semibold text-background transition hover:bg-green/85 disabled:opacity-50"
        >
          {saving ? labels.saving : labels.save}
        </button>
        {saved && !error && (
          <span className="font-body text-sm font-semibold text-green">
            {labels.saved}
          </span>
        )}
        {error && <p className="font-body text-sm text-red-500">{error}</p>}
      </div>
    </form>
  );
}
