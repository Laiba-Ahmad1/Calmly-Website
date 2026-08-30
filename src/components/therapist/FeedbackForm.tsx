// src/components/therapist/FeedbackForm.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export interface FeedbackFormLabels {
  hint: string;
  saved: string;
  saving: string;
  // interpolated server-side is not possible for a dynamic week number, so
  // the label is passed with a {week} placeholder and interpolated here
  saveFor: string;
  error: string;
  errorGeneric: string;
  sections: { key: string; label: string; placeholder: string }[];
}

type SectionKey =
  | "overallObservation"
  | "progressAndStrength"
  | "areasToFocusOn"
  | "feedbackAndGuidance";

export default function FeedbackForm({
  patientId,
  weekNumber,
  existing,
  labels,
}: {
  patientId: string;
  weekNumber: number;
  existing?: {
    overallObservation: string;
    progressAndStrength: string;
    areasToFocusOn: string;
    feedbackAndGuidance: string;
  } | null;
  labels: FeedbackFormLabels;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Record<SectionKey, string>>({
    overallObservation: existing?.overallObservation ?? "",
    progressAndStrength: existing?.progressAndStrength ?? "",
    areasToFocusOn: existing?.areasToFocusOn ?? "",
    feedbackAndGuidance: existing?.feedbackAndGuidance ?? "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/therapist/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, ...values }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || labels.error);
        return;
      }

      setSavedAt(Date.now());
      router.refresh();
    } catch {
      setError(labels.errorGeneric);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <p className="font-body text-xs text-text/50">
        {labels.hint}
        {savedAt && (
          <span className="ml-2 font-semibold text-blue">{labels.saved}</span>
        )}
      </p>

      {labels.sections.map((section) => (
        <div key={section.key} className="mt-5">
          <label className="font-body text-sm font-bold text-heading">
            {section.label}
          </label>
          <textarea
            value={values[section.key as SectionKey]}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, [section.key]: e.target.value }))
            }
            rows={3}
            maxLength={2000}
            placeholder={section.placeholder}
            className="mt-1.5 w-full resize-none rounded-xl border border-blue/25 bg-background px-4 py-3 font-body text-sm leading-relaxed text-text outline-none placeholder:text-text/35 focus:border-blue/60"
          />
        </div>
      ))}

      <div className="mt-5 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-blue px-6 py-2.5 font-body text-sm font-semibold text-background transition hover:bg-blue/85 disabled:opacity-50"
        >
          {saving
            ? labels.saving
            : labels.saveFor.replace("{week}", String(weekNumber))}
        </button>
        {error && <p className="font-body text-sm text-red-500">{error}</p>}
      </div>
    </form>
  );
}
