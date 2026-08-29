"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/shared/Button";
import Link from "next/link";

type Role = "patient" | "therapist";
type AnxietyType = "social" | "health" | "panic attacks" | "general";

const ANXIETY_OPTIONS: { value: AnxietyType; label: string }[] = [
  { value: "social", label: "Social anxiety" },
  { value: "health", label: "Health anxiety" },
  { value: "panic attacks", label: "Panic attacks" },
  { value: "general", label: "I don't know" },
  { value: "general", label: "General Anxiety" },
];

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<Role | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [anxietyType, setAnxietyType] = useState<AnxietyType | "">("");
  const [document, setDocument] = useState<File | null>(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function goToStep2(selectedRole: Role) {
    setRole(selectedRole);
    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (role === "patient" && !anxietyType) {
      setError("Pick what fits best — or choose 'I don't know'.");
      return;
    }
    if (role === "therapist" && !document) {
      setError("Please upload a verification document.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("role", role!);

      if (role === "patient") formData.append("anxietyType", anxietyType);
      if (role === "therapist" && document) formData.append("document", document);

      const res = await fetch("/api/auth/signup", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Signup failed");
        return;
      }

      router.push(role === "therapist" ? "/pending" : "/login");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      {step === 1 && (
        <>
          <h1 className="text-3xl mb-1 text-[rgb((var(--color-background)))]">Create your account</h1>
          <p className="text-sm text-[rgb((var(--color-background)/70))] mb-8">
            First, tell us which side you're on.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => goToStep2("patient")}
              className="rounded-xl border-2 border-[rgb((var(--color-green)/40))] bg-white p-5 text-left transition hover:border-green"
            >
              <div className="text-sm font-semibold text-[rgb((var(--color-heading)))]">I'm a patient</div>
              <div className="mt-1 text-xs text-[rgb((var(--color-text)/70))]">
                Journal, track mood, grow your plant.
              </div>
            </button>

            <button
              onClick={() => goToStep2("therapist")}
              className="rounded-xl border-2 border-green/40 bg-white p-5 text-left transition hover:border-green"
            >
              <div className="text-sm font-semibold text-heading">I'm a therapist</div>
              <div className="mt-1 text-xs text-text/70">
                Review patients, assign tasks.
              </div>
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-[rgb((var(--color-background)/70))]">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-background underline">
              Log in
            </Link>
          </p>
        </>
      )}

      {step === 2 && (
        <>
          <button
            onClick={() => setStep(1)}
            className="mb-4 text-xs text-background/60 hover:underline"
          >
            ← back
          </button>

          <h1 className="text-3xl mb-1 text-background">
            {role === "patient" ? "About you" : "Verify your practice"}
          </h1>
          <p className="text-sm text-background/70 mb-6">
            {role === "patient"
              ? "This helps us tailor your dashboard."
              : "We review documents before you get patient access."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-background">Full name</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-green/40 bg-white px-4 py-2.5 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-background">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-green/40 bg-white px-4 py-2.5 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-background">Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-green/40 bg-white px-4 py-2.5 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/30"
              />
            </div>

            {role === "patient" && (
              <div>
                <label className="block text-sm font-medium mb-1 text-background">
                  What's mostly on your mind?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ANXIETY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setAnxietyType(opt.value)}
                      className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                        anxietyType === opt.value
                          ? "border-green bg-green/20 text-heading"
                          : "border-green/30 bg-white text-text/70"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {role === "therapist" && (
              <div>
                <label className="block text-sm font-medium mb-1 text-background">
                  License or certificate
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => setDocument(e.target.files?.[0] ?? null)}
                  className="w-full rounded-lg border border-green/40 bg-white px-4 py-2.5 text-xs file:mr-3 file:rounded-md file:border-0 file:bg-green file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white"
                />
                <p className="mt-1 text-xs text-background/60">
                  PDF or image. We'll review this before activating your account.
                </p>
              </div>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}
              <Button
                       type="submit"
                       disabled={loading}
                       fillColor="rgb(var(--color-background))"
                       className="w-full text-green disabled:opacity-60"
             >{loading ? "Creating account..." : "Create account"}</Button>
            {/* <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg  py-2.5 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create account"}
            </button> */}
          </form>
        </>
      )}
    </main>
  );
}