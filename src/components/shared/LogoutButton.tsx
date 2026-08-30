// src/components/shared/LogoutButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton({
  className = "",
  children = "Log out",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={logout}
      disabled={busy}
      className={`font-body text-sm font-semibold text-text/70 transition hover:text-heading disabled:opacity-50 ${className}`}
    >
      {busy ? "Logging out…" : children}
    </button>
  );
}
