// src/app/therapist/patients/[patientId]/page.tsx
// One connected patient: this week at a glance, assigned to-dos, advice,
// weekly feedback, quiz review, latest weekly report, and recent journals.
// Relationship is verified server-side. The workspace language (English/
// Urdu) comes from the therapist's profile; patient-authored content
// (journals, names) is never translated.
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
import { formatDate, formatShortDate, formatWeekRange } from "@/lib/format";
import { getGrowthForNextLevel } from "@/lib/plant/growth";
import { getTherapistT, therapistRelative } from "@/lib/i18n/server";
import { interpolate, type TFunction } from "@/lib/i18n/dictionaries";
import { MODULE_KEYS, isModuleKey } from "@/lib/modules";

// Translated module name when the key is a known Calmly module; otherwise
// fall back to the raw stored value with underscores as spaces.
function moduleDisplay(key: string, t: TFunction): string {
  return isModuleKey(key) ? t(`module_${key}`) : key.replace(/_/g, " ");
}

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

export default async function TherapistPatientDetailPage({
  params,
}: {
  params: { patientId: string };
}) {
  const therapist = await requireTherapist();
  if (!therapist) redirect("/login");

  const { language, t } = await getTherapistT(therapist._id.toString());

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

  const trendLabel = (trend: "up" | "down" | "flat" | null | undefined): string | null => {
    if (!trend) return null;
    if (trend === "up") return t("t_trend_up");
    if (trend === "down") return t("t_trend_down");
    return t("t_trend_flat");
  };

  // Top struggling dimensions from the most recent quiz, if there is one
  const topDimensions = latestQuiz?.dimensionScores
    ? Object.entries(latestQuiz.dimensionScores as Record<string, number>)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([dim, score]) => `${dim.replace(/_/g, " ")} ${score}`)
    : [];

  const reportStats = latestReport?.stats ?? null;

  const taskLabels = {
    placeholder: t("t_task_placeholder"),
    assign: t("t_task_assign"),
    assigning: t("t_task_assigning"),
    assigned: t("t_task_assigned"),
    error: t("t_task_error"),
  };

  const adviceLabels = {
    newAdvice: t("t_advice_new"),
    relatedTo: t("t_advice_related"),
    share: t("t_advice_share"),
    sharing: t("t_advice_sharing"),
    placeholder: t("t_advice_placeholder"),
    hint: t("t_advice_hint"),
    error: t("t_advice_error"),
    errorGeneric: t("t_advice_error_generic"),
  };

  const moduleLabels = Object.fromEntries(
    MODULE_KEYS.map((key) => [key, t(`module_${key}`)])
  );

  const feedbackLabels = {
    hint: t("t_fb_hint"),
    saved: t("t_fb_saved"),
    saving: t("t_fb_saving"),
    saveFor: t("t_fb_save_for"),
    error: t("t_fb_error"),
    errorGeneric: t("t_fb_error_generic"),
    sections: [
      {
        key: "overallObservation",
        label: t("feedback_section_1"),
        placeholder: t("t_fb_placeholder_1"),
      },
      {
        key: "progressAndStrength",
        label: t("feedback_section_2"),
        placeholder: t("t_fb_placeholder_2"),
      },
      {
        key: "areasToFocusOn",
        label: t("feedback_section_3"),
        placeholder: t("t_fb_placeholder_3"),
      },
      {
        key: "feedbackAndGuidance",
        label: t("feedback_section_4"),
        placeholder: t("t_fb_placeholder_4"),
      },
    ],
  };

  const quizReviewLabels = {
    intro:
      upcomingQuiz && upcomingQuiz.ok && upcomingQuiz.source === "therapist"
        ? t("t_qr_intro_edited")
        : t("t_qr_intro_ai"),
    hint: t("t_qr_hint"),
    question: t("t_qr_question"),
    options: t("t_qr_options"),
    save: t("t_qr_save"),
    saving: t("t_qr_saving"),
    saved: t("t_qr_saved"),
    unsaved: t("t_qr_unsaved"),
    error: t("t_qr_error"),
    errorGeneric: t("t_qr_error_generic"),
  };

  return (
    <div>
      <Link
        href="/therapist/patients"
        className="font-body text-sm text-heading underline-offset-4 hover:underline"
      >
        ← {t("t_nav_patients")}
      </Link>

      <header className="mt-4">
        <h1 className="font-body text-3xl font-extrabold text-heading">
          {patientUser.name}
        </h1>
        <p className="mt-2 font-body text-sm text-text/60">
          {patientProfile?.anxietyType ? (
            <span className="capitalize">
              {interpolate(t("t_patients_anxiety"), {
                type: patientProfile.anxietyType,
              })}
            </span>
          ) : (
            t("t_patients_anxiety_not_set")
          )}
          {patientProfile?.age ? (
            <> · {interpolate(t("t_pd_years"), { age: patientProfile.age })}</>
          ) : null}
          <> · {interpolate(t("t_pd_connected_since"), {
            date: formatDate(
              overview.assignment.assignedAt ?? overview.assignment.requestedAt
            ),
          })}</>
        </p>
      </header>

      {/* This week */}
      <section className="mt-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-body text-lg font-extrabold text-heading">
            {t("t_pd_this_week")}
          </h2>
          <p className="font-body text-xs text-text/50">
            {interpolate(t("t_pd_week_line"), {
              week: weekNumber,
              range: formatWeekRange(weekStart, weekEnd),
            })}
          </p>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-x-8 gap-y-5 border-y border-blue/25 py-6 sm:grid-cols-3">
          <Stat
            label={t("t_pd_stat_mood")}
            value={weekly.moodAvg !== null ? `${weekly.moodAvg}/5` : "—"}
            hint={
              trendLabel(reportStats?.moodTrend) ??
              (lastJournalDate
                ? interpolate(t("t_patients_last_journal"), {
                    when: therapistRelative(language, lastJournalDate),
                  })
                : undefined)
            }
          />
          <Stat
            label={t("t_pd_stat_sleep")}
            value={weekly.sleepAvg !== null ? `${weekly.sleepAvg}/5` : "—"}
            hint={trendLabel(reportStats?.sleepTrend) ?? undefined}
          />
          <Stat
            label={t("t_pd_stat_journals")}
            value={interpolate(t("t_pd_days"), { days: weekly.journalDays })}
          />
          <Stat
            label={t("t_pd_stat_quiz")}
            value={
              quizThisWeek
                ? `${quizThisWeek.totalScore}/${quizThisWeek.maxScore}`
                : t("t_pd_quiz_not_completed")
            }
            hint={
              quizThisWeek
                ? trendLabel(reportStats?.quizTrend) ?? t("t_pd_completed_this_week")
                : latestQuiz
                  ? interpolate(t("t_pd_last_quiz_score"), {
                      score: latestQuiz.totalScore,
                      max: latestQuiz.maxScore,
                    })
                  : undefined
            }
          />
          <Stat
            label={t("t_pd_stat_exercises")}
            value={exerciseSummary || t("t_pd_exercises_none")}
          />
          <Stat
            label={t("t_pd_stat_growth")}
            value={
              nextLevelGrowth === null
                ? t("t_pd_fully_grown")
                : interpolate(t("t_pd_stage"), { n: plantLevel })
            }
            hint={
              nextLevelGrowth !== null
                ? interpolate(t("t_pd_more_to_next"), {
                    count: Math.max(nextLevelGrowth - plantGrowth, 0),
                    total: plantGrowth,
                  })
                : interpolate(t("t_pd_points_total"), { total: plantGrowth })
            }
          />
        </dl>
      </section>

      {/* Assigned to-dos */}
      <section className="mt-10">
        <h2 className="font-body text-lg font-extrabold text-heading">
          {t("t_pd_tasks_title")}
        </h2>
        <p className="mt-1 font-body text-xs text-text/50">
          {t("t_pd_tasks_hint")}
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
                  {interpolate(t("t_pd_assigned"), {
                    date: formatShortDate(task.assignedAt),
                  })}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 font-body text-sm text-text/60">
            {t("t_pd_tasks_none")}
          </p>
        )}

        {recentCompletedTasks.length > 0 && (
          <div className="mt-4">
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text/40">
              {t("t_pd_recently_completed")}
            </p>
            {recentCompletedTasks.map((task: any) => (
              <div key={task._id.toString()} className="py-2">
                <p className="font-body text-sm text-text/60 line-through">
                  {task.text}
                </p>
                <p className="mt-0.5 font-body text-xs text-text/40">
                  {interpolate(t("t_pd_completed_via_journal"), {
                    date: formatShortDate(task.completedAt),
                  })}
                </p>
              </div>
            ))}
          </div>
        )}

        <AssignTaskForm patientId={params.patientId} labels={taskLabels} />
      </section>

      {/* Advice */}
      <section className="mt-12">
        <h2 className="font-body text-lg font-extrabold text-heading">
          {t("t_pd_advice_title")}
        </h2>
        <p className="mt-1 font-body text-xs text-text/50">
          {t("t_pd_advice_hint")}
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
                    {interpolate(t("t_pd_related_to"), {
                      module: moduleDisplay(adv.relatedModule, t),
                    })}{" "}
                    ·{" "}
                    {interpolate(t("t_pd_shared"), {
                      date: formatShortDate(adv.createdAt),
                    })}
                  </p>
                </div>
                <RemoveAdviceButton
                  adviceId={adv._id.toString()}
                  removeLabel={t("t_pd_remove")}
                  removingLabel={t("t_pd_removing")}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 font-body text-sm text-text/60">
            {t("t_pd_advice_none")}
          </p>
        )}

        <AssignAdviceForm
          patientId={params.patientId}
          labels={adviceLabels}
          moduleLabels={moduleLabels}
        />
      </section>

      {/* Weekly feedback */}
      <section className="mt-12">
        <h2 className="font-body text-lg font-extrabold text-heading">
          {t("t_pd_feedback_title")}
        </h2>
        <FeedbackForm
          patientId={params.patientId}
          weekNumber={weekNumber}
          labels={feedbackLabels}
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
              {t("t_pd_previous_feedback")}
            </p>
            {(feedbackHistory ?? [])
              .filter((f: any) => f.weekNumber !== weekNumber)
              .map((f: any) => (
                <div key={f._id.toString()} className="border-b border-blue/15 py-3">
                  <p className="font-body text-xs text-text/50">
                    {interpolate(t("t_pd_feedback_week_line"), {
                      week: f.weekNumber,
                      range: formatWeekRange(f.weekStart, f.weekEnd),
                      date: formatShortDate(f.updatedAt),
                    })}
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
            {t("t_pd_quiz_title")}
          </h2>
          <QuizReviewForm
            patientId={params.patientId}
            weekNumber={upcomingQuiz.weekNumber}
            source={upcomingQuiz.source}
            questions={upcomingQuiz.questions}
            labels={quizReviewLabels}
          />
        </section>
      )}

      {/* Latest weekly report */}
      <section className="mt-12">
        <div className="flex items-baseline justify-between">
          <h2 className="font-body text-lg font-extrabold text-heading">
            {t("t_pd_latest_report")}
          </h2>
          {latestReport && (
            <Link
              href={`/therapist/reports/${latestReport._id.toString()}`}
              className="font-body text-sm font-semibold text-blue hover:underline"
            >
              {t("t_pd_view_full_report")}
            </Link>
          )}
        </div>

        {latestReport ? (
          <div className="mt-4">
            <p className="font-body text-xs text-text/50">
              {interpolate(t("t_pd_report_week"), {
                week: latestReport.weekNumber,
                range: formatWeekRange(latestReport.weekStart, latestReport.weekEnd),
              })}
            </p>
            <p className="mt-3 border-l-2 border-blue/40 pl-4 font-body text-sm leading-relaxed text-text">
              {latestReport.weeklyOverview}
            </p>
          </div>
        ) : (
          <p className="mt-4 font-body text-sm text-text/60">
            {t("t_pd_no_report")}
          </p>
        )}
      </section>

      {/* Quiz dimensions */}
      {topDimensions.length > 0 && (
        <section className="mt-10">
          <h2 className="font-body text-lg font-extrabold text-heading">
            {t("t_pd_focus_title")}
          </h2>
          <p className="mt-1 font-body text-xs text-text/50">
            {t("t_pd_focus_desc")}
          </p>
          <p className="mt-3 font-body text-sm capitalize text-text/70">
            {topDimensions.join(" · ")}
          </p>
        </section>
      )}

      {/* Recent journals */}
      <section className="mt-10">
        <h2 className="font-body text-lg font-extrabold text-heading">
          {t("t_pd_journals_title")}
        </h2>

        {weekly.journals.length === 0 ? (
          <p className="mt-4 font-body text-sm text-text/60">
            {lastJournalDate
              ? interpolate(t("t_pd_no_journals_week"), {
                  when: therapistRelative(language, lastJournalDate),
                })
              : t("t_pd_no_journals")}
          </p>
        ) : (
          <div className="mt-4">
            {weekly.journals.map((entry: any) => (
              <article
                key={entry._id.toString()}
                className="border-b border-blue/15 py-4"
              >
                <p className="font-body text-xs font-semibold uppercase tracking-wide text-text/50">
                  {interpolate(t("t_pd_journal_meta"), {
                    date: formatDate(entry.date),
                    mood: entry.mood,
                    sleep: entry.sleepQuality,
                  })}
                </p>
                <p className="mt-2 font-body text-sm leading-relaxed text-text">
                  <span className="font-bold text-heading">
                    {t("t_pd_feelings")}
                  </span>{" "}
                  — {entry.feelings}
                </p>
                <p className="mt-1 font-body text-sm leading-relaxed text-text">
                  <span className="font-bold text-heading">
                    {t("t_pd_reflection")}
                  </span>{" "}
                  — {entry.reflection}
                </p>
                {entry.todos?.length > 0 && (
                  <p className="mt-1 font-body text-xs text-text/50">
                    {t("t_pd_todo")}{" "}
                    {entry.todos
                      .map((tk: any) => `${tk.done ? "✓" : "○"} ${tk.text}`)
                      .join(" · ")}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <p className="mt-10 border-t border-blue/15 pt-4 font-body text-xs italic text-text/40">
        {t("t_pd_disclaimer")}
      </p>
    </div>
  );
}
