// src/components/therapist/RequestsList.tsx
"use client";

import { useState } from "react";

interface RequestItem {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  requestedAt: string; // pre-formatted, server-side
}

export default function RequestsList({
  initialRequests,
}: {
  initialRequests: RequestItem[];
}) {
  const [requests, setRequests] = useState(initialRequests);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function respond(id: string, decision: "accept" | "reject") {
    setBusyId(id);
    setError("");

    try {
      const res = await fetch("/api/therapist/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: id, decision }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Something went wrong");
      }

      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusyId(null);
    }
  }

  if (requests.length === 0) {
    return (
      <p className="mt-4 font-body text-sm text-text/60">
        No pending requests right now. When a patient sends you a request, it
        will appear here.
      </p>
    );
  }

  return (
    <div>
      {error && (
        <p className="mb-4 font-body text-sm text-red-600">{error}</p>
      )}

      <div className="mt-2">
        {requests.map((request) => (
          <div
            key={request.id}
            className="flex flex-col gap-3 border-b border-blue/15 py-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="font-body font-bold text-heading">
                {request.patientName}
              </p>
              <p className="mt-0.5 font-body text-sm text-text/60">
                {request.patientEmail} · requested {request.requestedAt}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <button
                onClick={() => respond(request.id, "accept")}
                disabled={busyId === request.id}
                className="rounded-full bg-blue px-5 py-2 font-body text-sm font-semibold text-background transition hover:opacity-90 disabled:opacity-50"
              >
                Accept
              </button>
              <button
                onClick={() => respond(request.id, "reject")}
                disabled={busyId === request.id}
                className="rounded-full border border-blue/40 px-5 py-2 font-body text-sm font-semibold text-text/70 transition hover:bg-blue/10 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
