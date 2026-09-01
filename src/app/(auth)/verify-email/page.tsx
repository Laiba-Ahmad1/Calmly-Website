"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "@/components/shared/Button";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const isPendingLogin = searchParams.get("pending") === "1";

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const trimmed = code.trim();
    if (!/^\d{6}$/.test(trimmed)) {
      setError("Please enter the 6-digit code from your email.");
      return;
    }
    if (!email) {
      setError("Please sign up again to get a new code.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not verify your email.");
        return;
      }

      router.push("/login?verified=1");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    setNotice("");

    if (!email) {
      setError("Please sign up again to get a new code.");
      return;
    }

    setResending(true);

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not send a new code.");
        return;
      }

      setNotice("A new code has been sent to your email.");
      setCooldown(60);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setResending(false);
    }
  }

  return (
    <main>
      <h1 className="font-bold text-background text-3xl mb-1 dark:text-heading">
        Verify your email
      </h1>
      <p className="text-sm text-background/70 mb-8 dark:text-text/70">
        {isPendingLogin
          ? "Your account needs email verification before you can log in. We've sent a fresh code."
          : "We sent a 6-digit code to your email. Enter it below to activate your account."}
        {email && (
          <>
            {" "}
            <span className="font-semibold text-background dark:text-text">{email}</span>
          </>
        )}
      </p>

      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1 text-background dark:text-text">
            Verification code
          </label>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            maxLength={6}
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder="••••••"
            className="w-full rounded-lg border border-green/40 bg-white px-4 py-2.5 text-center text-lg tracking-[0.5em] text-text outline-none focus:border-green focus:ring-2 focus:ring-green/30 dark:border-green/25 dark:bg-greensoft dark:text-text dark:focus:border-green/70"
          />
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {notice && <p className="text-sm text-heading">{notice}</p>}

        <Button
          type="submit"
          disabled={loading}
          fillColor="rgb(var(--color-background))"
          className="w-full text-green"
        >
          {loading ? "Verifying..." : "Verify email"}
        </Button>

        <button
          type="button"
          onClick={handleResend}
          disabled={resending || cooldown > 0}
          className="w-full text-center text-sm text-background/70 underline disabled:opacity-50 dark:text-text/70"
        >
          {cooldown > 0
            ? `Resend code (${cooldown}s)`
            : resending
              ? "Sending..."
              : "Resend code"}
        </button>

        <p className="text-center text-sm text-background/70 dark:text-text/70">
          Wrong email or need to start over?{" "}
          <Link href="/signup" className="font-medium text-background underline dark:text-green">
            Sign up again
          </Link>
        </p>
      </form>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailForm />
    </Suspense>
  );
}