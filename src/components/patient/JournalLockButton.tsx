// src/components/patient/JournalLockButton.tsx
"use client";

// Ends the protected journal session early.
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JournalLockButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleLock() {
    setBusy(true);
    try {
      await fetch("/api/journals/lock", { method: "POST" });
      router.refresh();
    } catch {
      // cookie expires on its own anyway
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLock}
      disabled={busy}
      className="rounded-full border border-green/30 bg-background/80 px-4 py-1.5 font-body text-xs font-semibold text-text/70 transition hover:bg-green/10 disabled:opacity-50"
    >
      🔒 Lock journals
    </button>
  );
}
