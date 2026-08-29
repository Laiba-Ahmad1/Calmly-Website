// src/components/admin/AdminTherapistReview.tsx
"use client";

import { useState } from "react";

interface PendingTherapist {
  id: string;
  name: string;
  email: string;
  documentUrl: string;
  documentName: string;
  submittedAt: string;
}

export default function AdminTherapistReview({
  initialTherapists,
}: {
  initialTherapists: PendingTherapist[];
}) {
  const [therapists, setTherapists] = useState(initialTherapists);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  async function review(id: string, decision: "approved" | "rejected", reason?: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/therapists/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, rejectionReason: reason }),
      });
      if (!res.ok) throw new Error("Failed");

      setTherapists((prev) => prev.filter((t) => t.id !== id));
      setRejectingId(null);
      setRejectionReason("");
    } catch {
      alert("Something went wrong — try again.");
    } finally {
      setBusyId(null);
    }
  }

  if (therapists.length === 0) {
    return (
      <div className="rounded-[2rem] bg-background p-10 text-center shadow-sm">
        <p className="text-sm text-text/60">No pending therapists — all caught up 🌱</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {therapists.map((t) => (
        <div key={t.id} className="rounded-2xl bg-background p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-text">{t.name}</p>
              <p className="text-sm text-text/60">{t.email}</p>
              <p className="mt-1 text-xs text-text/40">
                Submitted {new Date(t.submittedAt).toLocaleDateString()}
              </p>
            </div>

            <a
              href={t.documentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-green/30 bg-green/10 px-4 py-2 text-xs font-medium text-heading transition hover:bg-green/20"
            >
              View document ({t.documentName})
            </a>
          </div>

          {rejectingId === t.id ? (
            <div className="mt-4 flex flex-col gap-2">
              <input
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Reason for rejection (optional)"
                className="rounded-lg border border-green/30 bg-green/5 px-3 py-2 text-sm outline-none focus:border-green"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => review(t.id, "rejected", rejectionReason)}
                  disabled={busyId === t.id}
                  className="rounded-full bg-red-500 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                >
                  Confirm reject
                </button>
                <button
                  onClick={() => setRejectingId(null)}
                  className="rounded-full border border-green/30 px-4 py-2 text-xs font-medium text-text/70"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => review(t.id, "approved")}
                disabled={busyId === t.id}
                className="rounded-full bg-green px-4 py-2 text-xs font-semibold text-background disabled:opacity-50"
              >
                {busyId === t.id ? "Approving…" : "Approve"}
              </button>
              <button
                onClick={() => setRejectingId(t.id)}
                disabled={busyId === t.id}
                className="rounded-full border border-red-300 px-4 py-2 text-xs font-medium text-red-500 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}