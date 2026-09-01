"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/shared/Button";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("verified") === "1") {
      setNotice("Your email is verified — log in to continue.");
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoginSuccess(false);
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.needsVerification) {
          router.push(
            `/verify-email?email=${encodeURIComponent(trimmedEmail)}&pending=1`
          );
          return;
        }
        setError(data.error || "Login failed");
        return;
      }
      setLoginSuccess(true);
      if (data.role === "admin") {
        router.push("/admin/therapists");
        return;
      }

      // therapist layout shows a verification screen until the account is
      // approved — everyone lands on /therapist regardless of status
      router.push(data.role === "therapist" ? "/therapist" : "/home");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1 className="font-bold text-background text-3xl mb-1 dark:text-heading">Welcome back</h1>
      <p className="text-sm text-background/70 mb-8 dark:text-text/70">
        Log in to continue your journal streak.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1 text-background dark:text-text">Email</label>
          <input
            type="email"
            required
            maxLength={254}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-green/40 bg-white px-4 py-2.5 text-sm text-text outline-none focus:border-green focus:ring-2 focus:ring-green/30 dark:border-green/25 dark:bg-greensoft dark:text-text dark:focus:border-green/70"
          />
        </div>

        <div className="relative">
          <label className="block text-sm font-semibold mb-1 text-background dark:text-text">Password</label>
          <input
            type={showPassword ? "text" : "password"}
            required
            maxLength={128}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full rounded-lg border border-green/40 bg-white px-4 py-2.5 text-sm text-text outline-none focus:border-green focus:ring-2 focus:ring-green/30 dark:border-green/25 dark:bg-greensoft dark:text-text dark:focus:border-green/70"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-9 text-gray-500 text-sm dark:text-text/60"
          >
            {showPassword ? "⌣" : "👁"}
          </button>
        </div>

        {notice && <p className="text-sm text-heading">{notice}</p>}
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <Button
          type="submit"
          disabled={loading || loginSuccess}
          fillColor="rgb(var(--color-background))"
          className="w-full text-green disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Log in"}
          {loginSuccess && " ✔"}
        </Button>

        <p className="text-center text-sm text-background/70 dark:text-text/70">
          Forgot your password?{" "}
          <Link
            href="/forgot-password"
            className="font-medium text-background underline dark:text-green"
          >
            Reset it
          </Link>
        </p>

        <p className="text-center text-sm text-background/70 dark:text-text/70">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-background underline dark:text-green">
            Sign up
          </Link>
        </p>
      </form>
    </main>
  );
}