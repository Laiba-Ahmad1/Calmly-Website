// Landing page — redirect to /login or /home depending on auth state
import Button from "@/components/shared/Button";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  
  const user = await getCurrentUser();
  if (user?.role === "patient") {
    redirect("/home");
  } else if (user?.role === "therapist") {
    redirect("/dashboard");
  }


  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-8 overflow-hidden bg-green p-6 sm:gap-10">
      <div
        className="pointer-events-none absolute -top-16 -left-16 h-40 w-40 bg-white/10 sm:h-56 sm:w-56 lg:h-72 lg:w-72"
        style={{ borderRadius: "63% 37% 30% 70% / 50% 45% 55% 50%" }}
      />
      <div
        className="pointer-events-none absolute top-1/4 -right-10 h-24 w-24 bg-white/10 sm:h-32 sm:w-32 lg:h-40 lg:w-40"
        style={{ borderRadius: "42% 58% 65% 35% / 40% 62% 38% 60%" }}
      />
      <div
        className="pointer-events-none absolute -bottom-20 -right-24 h-56 w-56 bg-white/10 sm:h-72 sm:w-72 lg:h-96 lg:w-96"
        style={{ borderRadius: "55% 45% 38% 62% / 60% 40% 60% 40%" }}
      />
      <div
        className="pointer-events-none absolute bottom-10 left-4 hidden h-24 w-24 bg-white/10 sm:block"
        style={{ borderRadius: "70% 30% 45% 55% / 45% 55% 45% 55%" }}
      />
      <div
        className="pointer-events-none absolute top-8 left-1/3 hidden h-16 w-16 bg-white/10 sm:block"
        style={{ borderRadius: "48% 52% 60% 40% / 55% 40% 60% 45%" }}
      />
      <div
        className="pointer-events-none absolute bottom-1/3 -left-8 hidden h-32 w-32 bg-white/10 md:block"
        style={{ borderRadius: "60% 40% 50% 50% / 35% 65% 35% 65%" }}
      />

      <div className="flex flex-col items-center justify-center text-center text-heading/70">
        <p className="font-heading text-base font-bold text-background/50 sm:text-lg">
          welcome to
        </p>
        <p className="font-logo -my-2 text-[80px] leading-none sm:text-[120px] md:text-[160px] lg:text-[200px]">
          Calmly
        </p>
        <p className="font-heading text-base font-bold text-background/50 sm:text-lg">
          a mental wellness companion
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <Link href="/signup">
          <Button fillColor="rgb(var(--color-background))" className="text-green">
            Signup
          </Button>
        </Link>
        <Link href="/login">
          <Button fillColor="rgb(var(--color-background))" className="text-green">
            Login
          </Button>
        </Link>
      </div>
    </main>
  );
}