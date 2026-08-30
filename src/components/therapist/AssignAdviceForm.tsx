// src/components/therapist/AssignAdviceForm.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MODULE_KEYS } from "@/lib/modules";

export interface AssignAdviceLabels {
  newAdvice: string;
  relatedTo: string;
  share: string;
  sharing: string;
  placeholder: string;
  hint: string;
  error: string;
  errorGeneric: string;
}

export default function AssignAdviceForm({
  patientId,
  labels,
  moduleLabels,
}: {
  patientId: string;
  labels: AssignAdviceLabels;
  moduleLabels: Record<string, string>;
}) {
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
        setError(data.error || labels.error);
        return;
      }

      setText("");
      router.refresh();
    } catch {
      setError(labels.errorGeneric);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5">
      <p className="font-body text-xs font-semibold uppercase tracking-wide text-text/40">
        {labels.newAdvice}
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        maxLength={400}
        placeholder={labels.placeholder}
        className="mt-2 w-full resize-none rounded-xl border border-blue/25 bg-background px-4 py-3 font-body text-sm text-text outline-none placeholder:text-text/35 focus:border-blue/60"
      />

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="font-body text-xs font-semibold uppercase tracking-wide text-text/40">
            {labels.relatedTo}
          </span>
          <select
            value={relatedModule}
            onChange={(e) => setRelatedModule(e.target.value)}
            className="rounded-xl border border-blue/25 bg-background px-3 py-2.5 font-body text-sm text-text outline-none focus:border-blue/60"
          >
            {MODULE_KEYS.map((key) => (
              <option key={key} value={key}>
                {moduleLabels[key] ?? key}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          disabled={saving || text.trim().length < 3}
          className="rounded-full bg-blue px-5 py-2.5 font-body text-sm font-semibold text-background transition hover:bg-blue/85 disabled:opacity-50"
        >
          {saving ? labels.sharing : labels.share}
        </button>
      </div>

      <p className="mt-2 font-body text-xs text-text/40">{labels.hint}</p>

      {error && (
        <p className="mt-2 font-body text-sm text-red-500">{error}</p>
      )}
    </form>
  );
}
