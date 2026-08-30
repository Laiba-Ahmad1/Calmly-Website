// src/components/patient/JournalUnlockForm.tsx
"use client";

// Password gate for the private journal history. The password is verified
// server-side (bcrypt); this form only collects it.
import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/shared/Button";

export default function JournalUnlockForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/journals/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not unlock your journals.");
        return;
      }

      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative mx-auto max-w-md">
      <div className="relative">
        <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-[2rem] bg-background/50" />
        <div className="absolute inset-0 translate-x-6 translate-y-6 rounded-[2rem] bg-background/25" />

        <form
          onSubmit={handleSubmit}
          className="relative rounded-[2rem] bg-background p-8 shadow-xl sm:p-10"
        >
          <p className="text-center text-4xl">🔒</p>
          <h1 className="mt-4 text-center font-heading text-2xl font-bold text-heading">
            my journals
          </h1>
          <p className="mt-2 text-center font-body text-sm leading-relaxed text-text/60">
            Your journal history is private. Enter your password to unlock it
            for a short while.
          </p>

          <div className="mt-8">
            <label className="mb-2 block text-xs font-medium tracking-wide text-text/60 uppercase">
              Password
            </label>
            <input
              type="password"
              required
              maxLength={128}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-2xl border border-green/30 bg-green/10 p-4 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/30"
            />
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          )}

          <div className="mt-6">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Unlocking..." : "Unlock"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
