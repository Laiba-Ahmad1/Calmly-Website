// src/app/(patient)/feedback/page.tsx
// Therapist-written weekly feedback (four sections, in the therapist's own
// words). NOT the AI weekly report — that stays therapist-side.
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getFeedbackForPatient } from "@/lib/therapist/feedback";
import { getPatientT } from "@/lib/i18n/server";
import { interpolate } from "@/lib/i18n/dictionaries";
import { formatWeekRange } from "@/lib/format";

const SECTIONS = [
  { key: "overallObservation", labelKey: "feedback_section_1" },
  { key: "progressAndStrength", labelKey: "feedback_section_2" },
  { key: "areasToFocusOn", labelKey: "feedback_section_3" },
  { key: "feedbackAndGuidance", labelKey: "feedback_section_4" },
] as const;

export default async function FeedbackPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [feedback, { t }] = await Promise.all([
    getFeedbackForPatient(user._id),
    getPatientT(user._id.toString()),
  ]);

  return (
    <div className="relative mx-auto max-w-2xl">
      <h1 className="font-body text-3xl font-extrabold text-heading">
        {t("feedback_title")}
      </h1>
      <p className="mt-2 font-body text-sm text-text/60">
        {t("feedback_subtitle")}
      </p>

      {feedback.length === 0 ? (
        <p className="mt-8 font-body text-sm text-text/60">
          {t("feedback_empty")}
        </p>
      ) : (
        <div className="mt-8 flex flex-col gap-10">
          {feedback.map((f) => (
            <article
              key={f._id.toString()}
              className="rounded-2xl border border-green/20 bg-background p-6 shadow-sm"
            >
              <p className="font-body text-xs font-semibold uppercase tracking-wide text-text/50">
                {interpolate(t("feedback_week"), { week: f.weekNumber })} ·{" "}
                {formatWeekRange(f.weekStart, f.weekEnd)}
              </p>

              {SECTIONS.map((section) => (
                <div key={section.key} className="mt-5 first:mt-4">
                  <h2 className="font-body text-sm font-extrabold text-heading">
                    {t(section.labelKey)}
                  </h2>
                  {/* the therapist's own words — never translated */}
                  <p className="mt-1.5 whitespace-pre-line font-body text-sm leading-relaxed text-text/85">
                    {(f as any)[section.key]}
                  </p>
                </div>
              ))}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
