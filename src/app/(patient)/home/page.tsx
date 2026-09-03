// src/app/(patient)/home/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import Button from "@/components/shared/Button";
import HomeProgressSection from "@/components/patient/HomeProgressSection";
import HomeLinkCard from "@/components/patient/HomeLinkCard";
import { getCurrentUser } from "@/lib/auth";
import db from "@/lib/db";
import PatientProfile from "@/models/PatientProfile";
import QuizResult from "@/models/QuizResult";
import Plant from "@/components/shared/Plant";
import Journal from "@/models/Journal";
import { getPakistanDayStart, getPakistanDayEnd } from "@/lib/journal/today";
import { getCurrentWeekNumber, getWeekWindow } from "@/lib/quiz/weeks";
import ExerciseSession from "@/models/ExerciseSession";
import { getActiveAdvice } from "@/lib/therapist/advice";
import { getPatientLanguage } from "@/lib/i18n/server";
import { tFor } from "@/lib/i18n/dictionaries";
import { CALMLY_MODULES, ModuleKey } from "@/lib/modules";
import { formatShortDate } from "@/lib/format";

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  await db();

  const patientProfile = await PatientProfile.findOne({ userId: user._id });
  if (!patientProfile) {
    redirect("/onboarding");
  }

  const language = patientProfile.language === "ur" ? "ur" : "en";
  const t = tFor(language);

  const userName = (user as any).name ?? "there";

  const todaysJournal = await Journal.findOne({
    patientId: user._id,
    date: { $gte: getPakistanDayStart(), $lt: getPakistanDayEnd() },
  }).select("_id");

  const hasJournaledToday = !!todaysJournal;

  const currentScore = patientProfile.plant.growth;
  const nextGrowthLabel = `${t("home_next_growth").toLowerCase()}: stage ${patientProfile.plant.level + 1}`;

  // ---- quiz availability, based on the same week logic as /api/quiz/current ----
  const weekNumber = getCurrentWeekNumber(new Date(user.createdAt));
  const { weekStart, weekEnd } = getWeekWindow(
    new Date(user.createdAt),
    weekNumber,
  );

  const thisWeeksResult = await QuizResult.findOne({
    userId: user._id,
    weekStart,
  });

  const now = new Date();
  const daysUntilQuiz = thisWeeksResult
    ? Math.max(
        0,
        Math.ceil((weekEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      )
    : 0;

  const latestResult = await QuizResult.findOne({ userId: user._id }).sort({
    weekStart: -1,
  });
  const weeklyCheckinStatus = thisWeeksResult
    ? language === "ur"
      ? "جمع ہو چکا"
      : "Submitted"
    : language === "ur"
      ? "باقی ہے"
      : "Pending";

  const journalEntriesThisWeek = await Journal.find({
    patientId: user._id,
    date: { $gte: weekStart, $lt: weekEnd },
  }).select("date");

  const uniqueJournalDays = new Set(
    journalEntriesThisWeek.map((entry) =>
      entry.date.toISOString().slice(0, 10),
    ),
  );

  const weeklyJournalCount = `${uniqueJournalDays.size}/7`;

  // Counts every scored exercise session (breathing, sound, memory match, garden) this week.
  // growthAwarded > 0 filters out abandoned/too-short sessions that the scoring functions rejected.
  const weeklyExerciseSessionCount = await ExerciseSession.countDocuments({
    userId: user._id,
    completedAt: { $gte: weekStart, $lt: weekEnd },
    growthAwarded: { $gt: 0 },
  });

  const weeklyExerciseCount = `${weeklyExerciseSessionCount}`;

  // Real therapist advice for this patient
  const advice = await getActiveAdvice(user._id);

  return (
    <div className="relative mx-auto max-w-6xl">
      {/* ================= MAIN CARD ================= */}
      <div className="rounded-[2.5rem] bg-background shadow-sm">
        {/* ---------- SECTION 1: hero ---------- */}
        <div className="grid gap-10 p-8 sm:p-12 lg:grid-cols-2">
          {/* LEFT — plant with bubble cluster behind it */}
          <div className="flex flex-col items-center justify-center">
            <Link
              href="/plant"
              className="relative flex h-64 w-64 items-center justify-center transition hover:scale-[1.02]"
            >
              <div className="absolute h-60 w-60 rounded-full bg-green/10" />
              <div className="absolute -left-6 top-4 h-40 w-40 rounded-full bg-green/15" />
              <div className="absolute -right-4 -bottom-2 h-36 w-36 rounded-full bg-green/20" />
              <div className="absolute left-8 -top-2 h-24 w-24 rounded-full bg-green/15" />

              <Plant
                level={patientProfile.plant.level}
                size={350}
                className="relative left-[30px] z-10 h-82 w-auto"
              />
            </Link>

            <div className="mt-6 flex gap-4">
              <div className="rounded-full bg-green/10 px-6 py-4 text-center">
                <p className="text-xs opacity-60">{t("home_current_score")}</p>
                <p className="font-body text-lg font-extrabold text-heading">
                  {currentScore}
                </p>
              </div>
              <div className="rounded-full bg-green/10 px-6 py-4 text-center">
                <p className="text-xs opacity-60">{t("home_next_growth")}</p>
                <p className="font-body text-lg font-extrabold text-heading">
                  stage {patientProfile.plant.level + 1}
                </p>
              </div>
            </div>

            <Link href="/plant">
              <Button className="mt-6" width="w-48">
                {t("home_my_plant")}
              </Button>
            </Link>
          </div>

          {/* RIGHT — welcome + cards */}
          <div className="flex flex-col justify-center">
            <h1 className="font-heading text-4xl text-heading">
              {t("home_welcome")}, {userName}
            </h1>

            <p className="mt-3 text-sm opacity-60">
              {thisWeeksResult
                ? t("home_quiz_in_days").replace("{days}", String(daysUntilQuiz))
                : t("home_quiz_available")}
            </p>

            <div className="mt-8 flex flex-col gap-4">
              <HomeLinkCard
                href="/quiz"
                icon="◉"
                title={t("home_quiz_card_title")}
                description={t("home_quiz_card_desc")}
                // disabled={!!thisWeeksResult}
              />

              <HomeLinkCard
                href="/exercises"
                icon="♡"
                title={t("home_exercises_card_title")}
                description={t("home_exercises_card_desc")}
              />

              <HomeLinkCard
                href="/journal"
                icon="✎"
                title={t("home_journal_card_title")}
                description={t("home_journal_card_desc")}
                disabled={hasJournaledToday}
              />
            </div>
          </div>
        </div>

        {/* ---------- SECTION 2: scroll reveal (client component) ---------- */}
        <HomeProgressSection
          weeklyJournalCount={weeklyJournalCount}
          weeklyExerciseCount={weeklyExerciseCount}
          weeklyCheckinStatus={weeklyCheckinStatus}
          sectionTitle={t("home_weekly_progress")}
          journalLabel={t("home_journal_progress")}
          exercisesLabel={t("home_exercises_progress")}
          checkinLabel={t("home_checkin_progress")}
        />

        {/* ---------- SECTION 3: real therapist advice ---------- */}
        <div className="px-8 pb-12 sm:px-12">
          <h2 className="font-heading text-xl font-bold text-heading">
            {t("home_advice_title")}
          </h2>

          {advice.length === 0 ? (
            <p className="mt-4 font-body text-sm text-text/60">
              {t("home_advice_empty")}
            </p>
          ) : (
            <div className="mt-5 flex flex-col gap-3">
              {advice.slice(0, 5).map((adv) => {
                const module = CALMLY_MODULES[adv.relatedModule as ModuleKey];
                return (
                  <div
                    key={adv._id.toString()}
                    className="flex flex-col gap-3 rounded-2xl border border-green/25 bg-green/10 p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      {/* the therapist's own words — never translated */}
                      <p className="font-body text-sm font-medium leading-relaxed text-text">
                        {adv.text}
                      </p>
                      <p className="mt-1 font-body text-xs text-text/50">
                        {module
                          ? `${t(`module_${adv.relatedModule}`)} · ${formatShortDate(adv.createdAt)}`
                          : formatShortDate(adv.createdAt)}
                      </p>
                    </div>

                    {module && (
                      <Link
                        href={module.href}
                        className="shrink-0 self-start rounded-full bg-green px-5 py-2 font-body text-sm font-semibold text-background transition hover:bg-green/85 sm:self-auto"
                      >
                        {t("home_advice_cta").replace(
                          "{module}",
                          t(`module_${adv.relatedModule}`),
                        )}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
