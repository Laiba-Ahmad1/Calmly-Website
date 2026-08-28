// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";

// export default function LoginPage() {
//   const router = useRouter();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       const res = await fetch("/api/auth/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         setError(data.error || "Login failed");
//         return;
//       }

//       if (data.role === "therapist" && data.verificationStatus !== "approved") {
//         router.push("/therapist/pending");
//         return;
//       }

//       router.push(data.role === "therapist" ? "/therapist/dashboard" : "/home");
//     } catch {
//       setError("Something went wrong. Try again.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
// <main>
//       <h1 className="text-3xl mb-1">Welcome back</h1>
//       <p className="text-sm text-[var(--color-text)]/70 mb-8">
//         Log in to continue your journal streak.
//       </p>

//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label className="block text-sm font-semibold mb-1">Email</label>
//           <input
//             type="email"
//             required
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             placeholder="you@example.com"
//             className="w-full rounded-lg border border-[var(--color-green)]/40 bg-white px-4 py-2.5 text-sm outline-none focus:border-[var(--color-green)] focus:ring-2 focus:ring-[var(--color-green)]/30"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-semibold mb-1">Password</label>
//           <input
//             type="password"
//             required
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             placeholder="Enter your password"
//             className="w-full rounded-lg border border-[var(--color-green)]/40 bg-white px-4 py-2.5 text-sm outline-none focus:border-[var(--color-green)] focus:ring-2 focus:ring-[var(--color-green)]/30"
//           />
//         </div>

//         {error && <p className="text-sm text-red-600">{error}</p>}

//         <button
//           type="submit"
//           disabled={loading}
//           className="w-full rounded-lg bg-[var(--color-green)] py-2.5 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-60"
//         >
//           {loading ? "Logging in..." : "Log in"}
//         </button>

//         <p className="text-center text-sm text-[var(--color-text)]/70">
//           Don't have an account?{" "}
//           <Link href="/signup" className="font-medium text-[var(--color-heading)] underline">
//             Sign up
//           </Link>
//         </p>
//       </form>
//       </main>
//   );
// }
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/shared/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      if (data.role === "therapist" && data.verificationStatus !== "approved") {
        router.push("/therapist/pending");
        return;
      }

      router.push(data.role === "therapist" ? "/therapist/dashboard" : "/home");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1 className="font-bold text-background text-3xl mb-1 ">Welcome back</h1>
      <p className="text-sm text-background/70 mb-8">
        Log in to continue your journal streak.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1 text-background">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-green/40 bg-white px-4 py-2.5 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/30"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1 text-background">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full rounded-lg border border-green/40 bg-white px-4 py-2.5 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/30"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {/* <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-background py-2.5 text-sm font-semibold text-green transition hover:brightness-95 disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Log in"}
        </button> */}
        <Button
          type="submit"
          disabled={loading}
          fillColor="rgb(var(--color-background))"
          className="w-full text-green"
        >
          {loading ? "Logging in..." : "Log in"}
        </Button>

        <p className="text-center text-sm text-background/70">
          Don't have an account?{" "}
          <Link href="/signup" className="font-medium text-background underline">
            Sign up
          </Link>
        </p>
      </form>
    </main>
  );
}