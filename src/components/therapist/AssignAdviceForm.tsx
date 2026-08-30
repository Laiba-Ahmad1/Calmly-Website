// src/components/therapist/AssignAdviceForm.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MODULE_KEYS } from "@/lib/modules";

export default function AssignAdviceForm({ patientId }: { patientId: string }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [relatedModule, setRelatedModule] = useState<string>("breathing");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/therapist/advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, text, relatedModule }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save advice");
        return;
      }

      setText("");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5">
      <p className="font-body text-xs font-semibold uppercase tracking-wide text-text/40">
        New advice
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        maxLength={400}
        placeholder="e.g. Try the breathing exercise when you notice yourself feeling overwhelmed."
        className="mt-2 w-full resize-none rounded-xl border border-blue/25 bg-background px-4 py-3 font-body text-sm text-text outline-none placeholder:text-text/35 focus:border-blue/60"
      />

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="font-body text-xs font-semibold uppercase tracking-wide text-text/40">
            Related to
          </span>
          <select
            value={relatedModule}
            onChange={(e) => setRelatedModule(e.target.value)}
            className="rounded-xl border border-blue/25 bg-background px-3 py-2.5 font-body text-sm text-text outline-none focus:border-blue/60"
          >
            {MODULE_KEYS.map((key) => (
              <option key={key} value={key}>
                {MODULE_LABELS[key]}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          disabled={saving || text.trim().length < 3}
          className="rounded-full bg-blue px-5 py-2.5 font-body text-sm font-semibold text-background transition hover:bg-blue/85 disabled:opacity-50"
        >
          {saving ? "Sharing..." : "Share advice"}
        </button>
      </div>

      <p className="mt-2 font-body text-xs text-text/40">
        Advice should relate to Calmly features — exercises, journal, or the
        weekly quiz. Please avoid medical or diagnostic instructions.
      </p>

      {error && (
        <p className="mt-2 font-body text-sm text-red-500">{error}</p>
      )}
    </form>
  );
}

// Shown in the select dropdown; matches the patient-facing module labels
const MODULE_LABELS: Record<string, string> = {
  breathing: "Breathing",
  sound: "Sound Therapy",
  memory_match: "Memory Matcher",
  garden: "Calmly Garden",
  journal: "Journal",
  quiz: "Weekly Quiz",
};
