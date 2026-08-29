"use client";

import Image from "next/image";
import { useState } from "react";
import type { TherapistListItem } from "./TherapistSeacrh";

export default function TherapistCard({
  therapist,
  onRequestSent,
}: {
  therapist: TherapistListItem;
  onRequestSent: () => void;
}) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function handleRequest() {
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/therapist/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ therapistUserId: therapist.therapistUserId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send request");
      }
      onRequestSent();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  const buttonLabel =
    therapist.requestStatus === "active"
      ? "Your therapist"
      : therapist.requestStatus === "pending"
      ? "Requested"
      : therapist.requestStatus === "blocked"
      ? "Unavailable"
      : sending
      ? "Sending…"
      : "Send request";

  const buttonDisabled = therapist.requestStatus !== "none" || sending;

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-green/30 bg-green/10 px-4 py-3">
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-green/20">
        {therapist.avatarUrl ? (
          <Image src={therapist.avatarUrl} alt={therapist.name} fill className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-body text-sm font-bold text-heading">
            {therapist.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-text">{therapist.name}</p>
        <p className="truncate text-sm opacity-60">{therapist.bio || "No description yet."}</p>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>

      <button
        onClick={handleRequest}
        disabled={buttonDisabled}
        className="shrink-0 rounded-full bg-green px-4 py-2 font-body text-xs font-semibold text-background transition disabled:cursor-not-allowed disabled:opacity-50"
      >
        {buttonLabel}
      </button>
    </div>
  );
}