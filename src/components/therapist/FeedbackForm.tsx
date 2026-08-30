// src/components/therapist/FeedbackForm.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const SECTIONS = [
  {
    key: "overallObservation",
    label: "Overall Weekly Observation",
    placeholder: "How was the patient's week overall, based on their logged activity?",
  },
  {
    key: "progressAndStrength",
    label: "Progress and Strength",
    placeholder: "What went well? What strengths did the patient show this week?",
  },
  {
    key: "areasToFocusOn",
    label: "Areas to Focus On",
    placeholder: "Which areas deserve gentle attention in the coming week?",
  },
  {
    key: "feedbackAndGuidance",
    label: "Feedback and Guidance",
    placeholder: "Personal guidance in your own words.",
  },
] as const;

type SectionKey = (typeof SECTIONS)[number]["key"];

export default function FeedbackForm({
  patientId,
  weekNumber,
  existing,
}: {
  patientId: string;
  weekNumber: number;
  existing?: {
    overallObservation: string;
    progressAndStrength: string;
    areasToFocusOn: string;
    feedbackAndGuidance: string;
  } | null;
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
        setError(data.error || "Could not save feedback");
        return;
      }

      setSavedAt(Date.now());
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <p className="font-body text-xs text-text/50">
        Written in your own words — the patient sees this under Feedback.
        {savedAt && (
          <span className="ml-2 font-semibold text-blue">Saved</span>
        )}
      </p>

      {SECTIONS.map((section) => (
        <div key={section.key} className="mt-5">
          <label className="font-body text-sm font-bold text-heading">
            {section.label}
          </label>
          <textarea
            value={values[section.key]}
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
          {saving ? "Saving..." : `Save feedback for week ${weekNumber}`}
        </button>
        {error && <p className="font-body text-sm text-red-500">{error}</p>}
      </div>
    </form>
  );
}
