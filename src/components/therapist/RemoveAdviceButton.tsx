// src/components/therapist/RemoveAdviceButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RemoveAdviceButton({
  adviceId,
  removeLabel,
  removingLabel,
}: {
  adviceId: string;
  removeLabel: string;
  removingLabel: string;
}) {
  const router = useRouter();
  const [removing, setRemoving] = useState(false);

  async function handleRemove() {
    setRemoving(true);
    try {
      await fetch(`/api/therapist/advice?id=${adviceId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setRemoving(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleRemove}
      disabled={removing}
      className="font-body text-xs text-text/40 underline-offset-2 transition hover:text-red-500 hover:underline disabled:opacity-50"
    >
      {removing ? removingLabel : removeLabel}
    </button>
  );
}
