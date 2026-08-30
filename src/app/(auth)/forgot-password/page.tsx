"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/shared/Button";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Step = "email" | "code" | "done";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const trimmed = email.trim();
    if (!trimmed) {
      setError("Please enter your email address.");
      return;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not send a reset code.");
        return;
      }

      setNotice(
        "If an account exists for that email, a reset code is on its way."
      );
      setStep("code");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const trimmedCode = code.trim();
    if (!/^\d{6}$/.test(trimmedCode)) {
      setError("Please enter the 6-digit code from your email.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword.length > 128) {
      setError("Password must be shorter than 128 characters.");
      return;
    }
    if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setError("Password must include at least one letter and one number.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: trimmedCode, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not reset your password.");
        return;
      }

      setStep("done");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (step === "done") {
    return (
      <main>
        <h1 className="font-bold text-background text-3xl mb-1">
          Password updated
        </h1>
        <p className="text-sm text-background/70 mb-8">
          Your password has been changed. You can now log in with your new
          password.
        </p>
        <Link
          href="/login"
          className="block w-full rounded-lg bg-background py-2.5 text-center text-sm font-semibold text-green transition hover:brightness-95"
        >
          Go to login
        </Link>
      </main>
    );
  }

  if (step === "email") {
    return (
      <main>
        <h1 className="font-bold text-background text-3xl mb-1">
          Forgot your password?
        </h1>
        <p className="text-sm text-background/70 mb-8">
          Enter the email you signed up with and we&apos;ll send you a reset
          code.
        </p>

        <form onSubmit={handleSendCode} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1 text-background">Email</label>
            <input
              type="email"
              required
              maxLength={254}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-green/40 bg-white px-4 py-2.5 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/30"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            fillColor="rgb(var(--color-background))"
            className="w-full text-green"
          >
            {loading ? "Sending..." : "Send reset code"}
          </Button>

          <p className="text-center text-sm text-background/70">
            Remembered it?{" "}
            <Link href="/login" className="font-medium text-background underline">
              Back to login
            </Link>
          </p>
        </form>
      </main>
    );
  }

  return (
    <main>
      <h1 className="font-bold text-background text-3xl mb-1">Reset password</h1>
      <p className="text-sm text-background/70 mb-8">
        Enter the 6-digit code we sent to{" "}
        <span className="font-semibold text-background">{email.trim()}</span>{" "}
        and choose a new password.
      </p>

      <form onSubmit={handleReset} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1 text-background">
            Reset code
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
            className="w-full rounded-lg border border-green/40 bg-white px-4 py-2.5 text-center text-lg tracking-[0.5em] outline-none focus:border-green focus:ring-2 focus:ring-green/30"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1 text-background">
            New password
          </label>
          <input
            type="password"
            required
            minLength={8}
            maxLength={128}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 8 characters, a letter and a number"
            className="w-full rounded-lg border border-green/40 bg-white px-4 py-2.5 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/30"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1 text-background">
            Confirm new password
          </label>
          <input
            type="password"
            required
            minLength={8}
            maxLength={128}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Type it once more"
            className="w-full rounded-lg border border-green/40 bg-white px-4 py-2.5 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/30"
          />
        </div>

        {notice && <p className="text-sm text-heading">{notice}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button
          type="submit"
          disabled={loading}
          fillColor="rgb(var(--color-background))"
          className="w-full text-green"
        >
          {loading ? "Resetting..." : "Set new password"}
        </Button>

        <button
          type="button"
          onClick={() => {
            setStep("email");
            setError("");
          }}
          className="w-full text-center text-sm text-background/70 underline"
        >
          Use a different email
        </button>
      </form>
    </main>
  );
}
