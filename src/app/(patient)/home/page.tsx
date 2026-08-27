// src/app/(patient)/home/page.tsx
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import Button from "@/components/shared/Button";
import HomeProgressSection from "@/components/patient/HomeProgressSection";
import { getCurrentUser } from "@/lib/auth";
import db from "@/lib/db";
import PatientProfile from "@/models/PatientProfile";
import QuizResult from "@/models/QuizResult";
import { getCurrentWeekNumber, getWeekWindow } from "@/lib/quiz/weeks";

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login"); // TODO: adjust to your actual login route
  }

  await db();

  const patientProfile = await PatientProfile.findOne({ userId: user._id });
  if (!patientProfile) {
    redirect("/onboarding"); // TODO: adjust — patient hasn't picked an anxiety type yet
  }

  // userName — adjust the field name below if your User schema calls it something else
  const userName = (user as any).name ?? "there";

  const currentScore = patientProfile.plant.growth;
  const nextGrowthLabel = `Stage ${patientProfile.plant.level + 1}`;

  // ---- quiz availability, based on the same week logic as /api/quiz/current ----
  const weekNumber = getCurrentWeekNumber(new Date(user.createdAt));
  const { weekStart, weekEnd } = getWeekWindow(new Date(user.createdAt), weekNumber);

  const thisWeeksResult = await QuizResult.findOne({ userId: user._id, weekStart });

  const now = new Date();
  // if this week's quiz is already done, count down to next week's window;
  // if not done yet, it's available right now (0 days)
  const daysUntilQuiz = thisWeeksResult
    ? Math.max(0, Math.ceil((weekEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  // ---- weekly check-in score, from most recently completed QuizResult ----
  const latestResult = await QuizResult.findOne({ userId: user._id }).sort({ weekStart: -1 });
  const weeklyCheckinScore = latestResult
    ? `${Math.round((latestResult.totalScore / latestResult.maxScore) * 100)}%`
    : "—";

  // TODO: replace once JournalEntry model exists and journaling is built
  const weeklyJournalCount = "0/7";

  // TODO: replace once an Exercise/activity-log model exists
  const weeklyExerciseCount = "0";

  // TODO: pull from a real TherapistAdvice/assignment model once therapist side is built
  const therapistAdvice = [
    "Practice breathing exercises",
    "Practice grounding exercises",
    "Recognize your triggers and write about them in your journal",
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-green p-4 sm:p-8">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-white/10" />

      <div className="relative mx-auto max-w-6xl">
        {/* ================= TOP BAR ================= */}
        <div className="mb-4 flex items-center justify-between px-2">
          <button
            aria-label="Open menu"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-background text-lg shadow-sm transition hover:scale-105"
          >
            ☰
          </button>
        </div>

        {/* ================= MAIN CARD ================= */}
        <div className="rounded-[2.5rem] bg-background shadow-sm">
          {/* ---------- SECTION 1: hero ---------- */}
          <div className="grid gap-10 p-8 sm:p-12 lg:grid-cols-2">
            {/* LEFT — plant with bubble cluster behind it */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative flex h-64 w-64 items-center justify-center">
                <div className="absolute h-60 w-60 rounded-full bg-green/10" />
                <div className="absolute -left-6 top-4 h-40 w-40 rounded-full bg-green/15" />
                <div className="absolute -right-4 -bottom-2 h-36 w-36 rounded-full bg-green/20" />
                <div className="absolute left-8 -top-2 h-24 w-24 rounded-full bg-green/15" />

                <Image
                  src="/plant.png"
                  alt="Your Calmly plant"
                  width={350}
                  height={350}
                  priority
                  className="relative left-[30px] z-10 h-82 w-auto object-contain"
                />
              </div>

              <div className="mt-6 flex gap-4">
                <div className="rounded-full bg-green/10 px-6 py-4 text-center">
                  <p className="text-xs opacity-60">Current score</p>
                  <p className="font-body text-lg font-extrabold text-heading">
                    {currentScore}
                  </p>
                </div>

                <div className="rounded-full bg-green/10 px-6 py-4 text-center">
                  <p className="text-xs opacity-60">Next growth</p>
                  <p className="font-body text-lg font-extrabold text-heading">
                    {nextGrowthLabel}
                  </p>
                </div>
              </div>

              <Button className="mt-6" width="w-48">
                New plant
              </Button>
            </div>

            {/* RIGHT — welcome + cards */}
            <div className="flex flex-col justify-center">
              <h1 className="font-heading text-4xl text-heading">
                Welcome to <span className="font-logo">Calmly</span>, {userName}
              </h1>

              <p className="mt-3 text-sm opacity-60">
                You can take the weekly quiz after {daysUntilQuiz} day
                {daysUntilQuiz === 1 ? "" : "s"}
              </p>

              <div className="mt-8 flex flex-col gap-4">
                <HomeLinkCard
                  href="/quiz"
                  icon="◉"
                  title="Weekly quiz"
                  description="Check in with how you've been feeling"
                />

                <HomeLinkCard
                  href="/exercises"
                  icon="♡"
                  title="Exercises"
                  description="A few minutes to reset"
                />

                <HomeLinkCard
                  href="/journal"
                  icon="✎"
                  title="Journal"
                  description="Write about your day"
                />
              </div>
            </div>
          </div>

          {/* ---------- SECTION 2: scroll reveal (client component) ---------- */}
          <HomeProgressSection
            weeklyJournalCount={weeklyJournalCount}
            weeklyExerciseCount={weeklyExerciseCount}
            weeklyCheckinScore={weeklyCheckinScore}
            therapistAdvice={therapistAdvice}
          />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function HomeLinkCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-2xl border border-green/30 bg-green/15 p-5 transition hover:-translate-y-0.5 hover:bg-green/20"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green/20 text-green">
        {icon}
      </div>

      <div>
        <p className="font-semibold text-text">{title}</p>
        <p className="text-sm opacity-60">{description}</p>
      </div>
    </Link>
  );
}