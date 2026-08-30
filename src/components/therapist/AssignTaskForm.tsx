// src/components/therapist/AssignTaskForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface AssignTaskLabels {
  placeholder: string;
  assign: string;
  assigning: string;
  assigned: string;
  error: string;
}

export default function AssignTaskForm({
  patientId,
  labels,
}: {
  patientId: string;
  labels: AssignTaskLabels;
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [assigned, setAssigned] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = text.trim();
    if (!trimmed) return;

    setBusy(true);
    setError("");
    setAssigned(false);

    try {
      const res = await fetch("/api/therapist/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, text: trimmed }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error ?? labels.error);
      }

      setText("");
      setAssigned(true);
      router.refresh();
    } catch {
      setError(labels.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        maxLength={300}
        disabled={busy}
        placeholder={labels.placeholder}
        className="w-full resize-none rounded-2xl border border-blue/30 bg-background p-4 font-body text-sm text-text outline-none transition focus:border-blue focus:ring-2 focus:ring-blue/30 disabled:opacity-60"
      />

      <div className="mt-3 flex items-center gap-4">
        <button
          type="submit"
          disabled={busy || !text.trim()}
          className="rounded-full bg-blue px-5 py-2 font-body text-sm font-semibold text-background transition hover:opacity-90 disabled:opacity-40"
        >
          {busy ? labels.assigning : labels.assign}
        </button>
        {assigned && (
          <p className="font-body text-sm text-heading">{labels.assigned}</p>
        )}
      </div>

      {error && <p className="mt-2 font-body text-sm text-red-600">{error}</p>}
    </form>
  );
}
