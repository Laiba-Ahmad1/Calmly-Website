// src/app/therapist/patients/[patientId]/page.tsx
// One connected patient: this week at a glance, assigned to-dos, advice,
// weekly feedback, quiz review, latest weekly report, and recent journals.
// Relationship is verified server-side.
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireTherapist } from "@/lib/therapist/guard";
import { getPatientOverview } from "@/lib/therapist/patients";
import AssignTaskForm from "@/components/therapist/AssignTaskForm";
import AssignAdviceForm from "@/components/therapist/AssignAdviceForm";
import RemoveAdviceButton from "@/components/therapist/RemoveAdviceButton";
import FeedbackForm from "@/components/therapist/FeedbackForm";
import QuizReviewForm from "@/components/therapist/QuizReviewForm";
import { getAdviceForTherapistPatient } from "@/lib/therapist/advice";
import { getFeedbackForTherapistPatient } from "@/lib/therapist/feedback";
import { getUpcomingQuizForPatient } from "@/lib/therapist/quizReview";
import { formatDate, formatShortDate, formatWeekRange, formatRelative } from "@/lib/format";
import { getPlantStageLabel, getGrowthForNextLevel } from "@/lib/plant/growth";

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div>
      <dt className="font-body text-xs font-semibold uppercase tracking-wide text-text/50">
        {label}
      </dt>
      <dd className="mt-1 font-body text-xl font-extrabold text-heading">{value}</dd>
      {hint && <p className="mt-0.5 font-body text-xs text-text/50">{hint}</p>}
    </div>
  );
}

function trendLabel(trend: "up" | "down" | "flat" | null | undefined): string | null {
  if (!trend) return null;
  if (trend === "up") return "↑ vs previous week";
  if (trend === "down") return "↓ vs previous week";
  return "≈ similar to previous week";
}

export default async function TherapistPatientDetailPage({
  params,
}: {
  params: { patientId: string };
}) {
  const therapist = await requireTherapist();
  if (!therapist) redirect("/login");

  const overview = await getPatientOverview(
    therapist._id.toString(),
    params.patientId
  );
  if (!overview) notFound();

  const {
    patientUser,
    patientProfile,
    weekNumber,
    weekStart,
    weekEnd,
    weekly,
    lastJournalDate,
    quizThisWeek,
    latestQuiz,
    exerciseCountsThisWeek,
    activeTasks,
    recentCompletedTasks,
    latestReport,
  } = overview;

  const plantLevel = patientProfile?.plant?.level ?? 1;
  const plantGrowth = patientProfile?.plant?.growth ?? 0;
  const nextLevelGrowth = getGrowthForNextLevel(plantLevel);

  const [advice, feedbackHistory, upcomingQuiz] = await Promise.all([
    getAdviceForTherapistPatient(therapist._id.toString(), params.patientId),
    getFeedbackForTherapistPatient(therapist._id.toString(), params.patientId),
    getUpcomingQuizForPatient(therapist._id.toString(), params.patientId).catch(
      () => null
    ),
  ]);

  const activeAdvice = (advice ?? []).filter((a: any) => a.active);
  const thisWeekFeedback =
    (feedbackHistory ?? []).find((f: any) => f.weekNumber === weekNumber) ?? null;

  const exerciseSummary = Object.entries(exerciseCountsThisWeek)
    .map(([type, count]) => `${type.replace("_", " ")} ×${count}`)
    .join(" · ");

  // Top struggling dimensions from the most recent quiz, if there is one
  const topDimensions = latestQuiz?.dimensionScores
    ? Object.entries(latestQuiz.dimensionScores as Record<string, number>)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([dim, score]) => `${dim.replace(/_/g, " ")} ${score}`)
    : [];

  const reportStats = latestReport?.stats ?? null;

  return (
    <div>
      <Link
        href="/therapist/patients"
        className="font-body text-sm text-heading underline-offset-4 hover:underline"
      >
        ← Patients
      </Link>

      <header className="mt-4">
        <h1 className="font-body text-3xl font-extrabold text-heading">
          {patientUser.name}
        </h1>
        <p className="mt-2 font-body text-sm text-text/60">
          {patientProfile?.anxietyType ? (
            <span className="capitalize">{patientProfile.anxietyType} anxiety</span>
          ) : (
            "Anxiety type not set"
          )}
          {patientProfile?.age ? <> · {patientProfile.age} years</> : null}
          <> · connected since {formatDate(overview.assignment.assignedAt ?? overview.assignment.requestedAt)}</>
        </p>
      </header>

      {/* This week */}
      <section className="mt-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-body text-lg font-extrabold text-heading">
            This week
          </h2>
          <p className="font-body text-xs text-text/50">
            Week {weekNumber} · {formatWeekRange(weekStart, weekEnd)} · in progress
          </p>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-x-8 gap-y-5 border-y border-blue/25 py-6 sm:grid-cols-3">
          <Stat
            label="Mood"
            value={weekly.moodAvg !== null ? `${weekly.moodAvg}/5` : "—"}
            hint={trendLabel(reportStats?.moodTrend) ?? (lastJournalDate ? `last journal ${formatRelative(lastJournalDate)}` : undefined)}
          />
          <Stat
            label="Sleep quality"
            value={weekly.sleepAvg !== null ? `${weekly.sleepAvg}/5` : "—"}
            hint={trendLabel(reportStats?.sleepTrend) ?? undefined}
          />
          <Stat label="Journals" value={`${weekly.journalDays}/7 days`} />
          <Stat
            label="Weekly quiz"
            value={
              quizThisWeek
                ? `${quizThisWeek.totalScore}/${quizThisWeek.maxScore}`
                : "Not completed"
            }
            hint={
              quizThisWeek
                ? trendLabel(reportStats?.quizTrend) ?? "completed this week"
                : latestQuiz
                  ? `last completed week score ${latestQuiz.totalScore}/${latestQuiz.maxScore}`
                  : undefined
            }
          />
          <Stat
            label="Exercises"
            value={exerciseSummary || "None yet"}
          />
          <Stat
            label="Growth"
            value={getPlantStageLabel(plantLevel)}
            hint={
              nextLevelGrowth !== null
                ? `${Math.max(nextLevelGrowth - plantGrowth, 0)} more to next stage · ${plantGrowth} points total`
                : `${plantGrowth} points total`
            }
          />
        </dl>
      </section>

      {/* Assigned to-dos */}
      <section className="mt-10">
        <h2 className="font-body text-lg font-extrabold text-heading">
          Assigned to-dos
        </h2>
        <p className="mt-1 font-body text-xs text-text/50">
          The patient sees these in their journal and checks them off there.
        </p>

        {activeTasks.length > 0 ? (
          <div className="mt-4">
            {activeTasks.map((task: any) => (
              <div
                key={task._id.toString()}
                className="border-b border-blue/15 py-3"
              >
                <p className="font-body text-sm font-semibold text-text">
                  {task.text}
                </p>
                <p className="mt-0.5 font-body text-xs text-text/50">
                  assigned {formatShortDate(task.assignedAt)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 font-body text-sm text-text/60">
            No active to-do right now.
          </p>
        )}

        {recentCompletedTasks.length > 0 && (
          <div className="mt-4">
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text/40">
              Recently completed
            </p>
            {recentCompletedTasks.map((task: any) => (
              <div key={task._id.toString()} className="py-2">
                <p className="font-body text-sm text-text/60 line-through">
                  {task.text}
                </p>
                <p className="mt-0.5 font-body text-xs text-text/40">
                  completed {formatShortDate(task.completedAt)} · via journal
                </p>
              </div>
            ))}
          </div>
        )}

        <AssignTaskForm patientId={params.patientId} />
      </section>

      {/* Advice */}
      <section className="mt-12">
        <h2 className="font-body text-lg font-extrabold text-heading">
          Advice
        </h2>
        <p className="mt-1 font-body text-xs text-text/50">
          Shown on the patient&apos;s homepage with a link to the related
          Calmly module.
        </p>

        {activeAdvice.length > 0 ? (
          <div className="mt-4">
            {activeAdvice.map((adv: any) => (
              <div
                key={adv._id.toString()}
                className="flex items-start justify-between gap-4 border-b border-blue/15 py-3"
              >
                <div>
                  <p className="font-body text-sm font-semibold text-text">
                    {adv.text}
                  </p>
                  <p className="mt-0.5 font-body text-xs text-text/50">
                    related to {adv.relatedModule.replace("_", " ")} · shared{" "}
                    {formatShortDate(adv.createdAt)}
                  </p>
                </div>
                <RemoveAdviceButton adviceId={adv._id.toString()} />
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 font-body text-sm text-text/60">
            No active advice right now.
          </p>
        )}

        <AssignAdviceForm patientId={params.patientId} />
      </section>

      {/* Weekly feedback */}
      <section className="mt-12">
        <h2 className="font-body text-lg font-extrabold text-heading">
          Weekly feedback
        </h2>
        <FeedbackForm
          patientId={params.patientId}
          weekNumber={weekNumber}
          existing={
            thisWeekFeedback
              ? {
                  overallObservation: thisWeekFeedback.overallObservation,
                  progressAndStrength: thisWeekFeedback.progressAndStrength,
                  areasToFocusOn: thisWeekFeedback.areasToFocusOn,
                  feedbackAndGuidance: thisWeekFeedback.feedbackAndGuidance,
                }
              : null
          }
        />

        {(feedbackHistory ?? []).filter((f: any) => f.weekNumber !== weekNumber)
          .length > 0 && (
          <div className="mt-8">
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text/40">
              Previous feedback
            </p>
            {(feedbackHistory ?? [])
              .filter((f: any) => f.weekNumber !== weekNumber)
              .map((f: any) => (
                <div key={f._id.toString()} className="border-b border-blue/15 py-3">
                  <p className="font-body text-xs text-text/50">
                    Week {f.weekNumber} · {formatWeekRange(f.weekStart, f.weekEnd)} ·
                    updated {formatShortDate(f.updatedAt)}
                  </p>
                  <p className="mt-1 font-body text-sm leading-relaxed text-text/80">
                    {f.overallObservation}
                  </p>
                </div>
              ))}
          </div>
        )}
      </section>

      {/* Upcoming quiz review */}
      {upcomingQuiz && upcomingQuiz.ok && upcomingQuiz.questions.length > 0 && (
        <section className="mt-12">
          <h2 className="font-body text-lg font-extrabold text-heading">
            Upcoming weekly quiz
          </h2>
          <QuizReviewForm
            patientId={params.patientId}
            weekNumber={upcomingQuiz.weekNumber}
            source={upcomingQuiz.source}
            questions={upcomingQuiz.questions}
          />
        </section>
      )}

      {/* Latest weekly report */}
      <section className="mt-12">
        <div className="flex items-baseline justify-between">
          <h2 className="font-body text-lg font-extrabold text-heading">
            Latest weekly report
          </h2>
          {latestReport && (
            <Link
              href={`/therapist/reports/${latestReport._id.toString()}`}
              className="font-body text-sm font-semibold text-blue hover:underline"
            >
              View full report
            </Link>
          )}
        </div>

        {latestReport ? (
          <div className="mt-4">
            <p className="font-body text-xs text-text/50">
              Week {latestReport.weekNumber} ·{" "}
              {formatWeekRange(latestReport.weekStart, latestReport.weekEnd)}
            </p>
            <p className="mt-3 border-l-2 border-blue/40 pl-4 font-body text-sm leading-relaxed text-text">
              {latestReport.weeklyOverview}
            </p>
          </div>
        ) : (
          <p className="mt-4 font-body text-sm text-text/60">
            No weekly report yet — the first one is generated after a full week
            of Calmly activity.
          </p>
        )}
      </section>

      {/* Quiz dimensions */}
      {topDimensions.length > 0 && (
        <section className="mt-10">
          <h2 className="font-body text-lg font-extrabold text-heading">
            Quiz focus areas
          </h2>
          <p className="mt-1 font-body text-xs text-text/50">
            Highest-scoring dimensions from the most recent weekly quiz.
          </p>
          <p className="mt-3 font-body text-sm capitalize text-text/70">
            {topDimensions.join(" · ")}
          </p>
        </section>
      )}

      {/* Recent journals */}
      <section className="mt-10">
        <h2 className="font-body text-lg font-extrabold text-heading">
          Recent journals
        </h2>

        {weekly.journals.length === 0 ? (
          <p className="mt-4 font-body text-sm text-text/60">
            {lastJournalDate
              ? `No journals this week — the last entry was ${formatRelative(lastJournalDate)}.`
              : "The patient hasn't written any journals yet."}
          </p>
        ) : (
          <div className="mt-4">
            {weekly.journals.map((entry: any) => (
              <article
                key={entry._id.toString()}
                className="border-b border-blue/15 py-4"
              >
                <p className="font-body text-xs font-semibold uppercase tracking-wide text-text/50">
                  {formatDate(entry.date)} · Mood {entry.mood}/5 · Sleep{" "}
                  {entry.sleepQuality}/5
                </p>
                <p className="mt-2 font-body text-sm leading-relaxed text-text">
                  <span className="font-bold text-heading">Feelings</span> —{" "}
                  {entry.feelings}
                </p>
                <p className="mt-1 font-body text-sm leading-relaxed text-text">
                  <span className="font-bold text-heading">Reflection</span> —{" "}
                  {entry.reflection}
                </p>
                {entry.todos?.length > 0 && (
                  <p className="mt-1 font-body text-xs text-text/50">
                    To-do:{" "}
                    {entry.todos
                      .map((t: any) => `${t.done ? "✓" : "○"} ${t.text}`)
                      .join(" · ")}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <p className="mt-10 border-t border-blue/15 pt-4 font-body text-xs italic text-text/40">
        This page summarizes the patient&apos;s logged week. It is not live
        monitoring and not a diagnosis.
      </p>
    </div>
  );
}
