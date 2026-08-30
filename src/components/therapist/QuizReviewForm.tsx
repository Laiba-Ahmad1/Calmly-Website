// src/components/therapist/QuizReviewForm.tsx
"use client";

// Therapist review of the AI-planned questions for the UPCOMING week.
// Leaving texts untouched keeps the AI version; editing replaces the texts
// with the therapist's version for that week.
import { useRouter } from "next/navigation";
import { useState } from "react";

export interface ReviewableQuestion {
  id: string;
  question: string;
  dimension: string;
  options: string[];
}

export interface QuizReviewLabels {
  intro: string; // may contain {week}
  hint: string;
  question: string; // may contain {n}
  options: string;
  save: string;
  saving: string;
  saved: string; // may contain {week}
  unsaved: string;
  error: string;
  errorGeneric: string;
}

export default function QuizReviewForm({
  patientId,
  weekNumber,
  source,
  questions,
  labels,
}: {
  patientId: string;
  weekNumber: number;
  source: string;
  questions: ReviewableQuestion[];
  labels: QuizReviewLabels;
}) {
  const router = useRouter();
  const [texts, setTexts] = useState<Record<string, string>>(
    Object.fromEntries(questions.map((q) => [q.id, q.question]))
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const anyEdited = questions.some((q) => texts[q.id]?.trim() !== q.question);

  async function handleSave() {
    setError("");
    setSaving(true);

    try {
      const edits = questions
        .map((q) => ({ questionId: q.id, text: texts[q.id]?.trim() ?? "" }))
        .filter((e) => e.text.length > 0);

      const res = await fetch("/api/therapist/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, edits }),
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
    <div className="mt-4">
      <p className="font-body text-xs text-text/50">
        {labels.intro.replace("{week}", String(weekNumber))} {labels.hint}
      </p>

      <div className="mt-4 space-y-4">
        {questions.map((q, i) => (
          <div key={q.id}>
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text/40">
              {labels.question.replace("{n}", String(i + 1))} ·{" "}
              {q.dimension.replace(/_/g, " ")}
            </p>
            <textarea
              value={texts[q.id] ?? ""}
              onChange={(e) =>
                setTexts((prev) => ({ ...prev, [q.id]: e.target.value }))
              }
              rows={2}
              maxLength={300}
              className="mt-1 w-full resize-none rounded-xl border border-blue/25 bg-background px-4 py-2.5 font-body text-sm text-text outline-none focus:border-blue/60"
            />
            <p className="mt-1 font-body text-xs text-text/40">
              {labels.options} {q.options.join(" · ")}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-full bg-blue px-6 py-2.5 font-body text-sm font-semibold text-background transition hover:bg-blue/85 disabled:opacity-50"
        >
          {saving ? labels.saving : labels.save}
        </button>
        {savedAt && (
          <span className="font-body text-sm font-semibold text-blue">
            {labels.saved.replace("{week}", String(weekNumber))}
          </span>
        )}
        {error && <p className="font-body text-sm text-red-500">{error}</p>}
      </div>

      {anyEdited && !savedAt && (
        <p className="mt-2 font-body text-xs italic text-text/45">
          {labels.unsaved}
        </p>
      )}
    </div>
  );
}
