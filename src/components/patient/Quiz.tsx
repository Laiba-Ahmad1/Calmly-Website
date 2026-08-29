// components/Quiz.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useQuiz } from "@/hooks/useQuiz";
import { formatTimeUntil } from "@/lib/quiz/countdown";
import Button from "@/components/shared/Button";

export default function Quiz() {
  const {
    questions,
    weekNumber,
    loading,
    error,
    submit,
    submitting,
    submitted,
    alreadyCompleted,
    completedScore,
    nextAvailableAt,
  } = useQuiz();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [countdown, setCountdown] = useState("");
  const [lastResult, setLastResult] = useState<{ totalScore: number; maxScore: number } | null>(
    null
  );

  // tick the countdown every minute while showing the "already completed" state
  useEffect(() => {
    if (!nextAvailableAt) return;

    function tick() {
      setCountdown(formatTimeUntil(nextAvailableAt!));
    }

    tick();
    const interval = setInterval(tick, 60 * 1000);
    return () => clearInterval(interval);
  }, [nextAvailableAt]);

  async function handleNext() {
    const question = questions[currentIndex];
    const isLast = currentIndex === questions.length - 1;

    if (isLast) {
      const responses = questions.map((q) => ({
        questionId: q.id,
        selectedOption: answers[q.id],
      }));
      const result = await submit(responses);
      if (result) {
        setLastResult({ totalScore: result.totalScore, maxScore: result.maxScore });
      }
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  function selectOption(questionId: string, option: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-green p-4 sm:p-8">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-white/10" />

      <div className="relative mx-auto max-w-2xl">
        <div className="mb-4 flex items-center justify-between px-2">
          <button
            aria-label="Open menu"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-background text-lg shadow-sm transition hover:scale-105"
          >
            ☰
          </button>
        </div>

        <div className="relative overflow-hidden rounded-[2.5rem] bg-background p-8 shadow-sm sm:p-12">
          {loading && (
            <p className="py-16 text-center font-body text-sm text-text/60">
              Loading your check-in…
            </p>
          )}

          {!loading && error && (
            <p className="py-16 text-center font-body text-sm text-red-400">{error}</p>
          )}

          {!loading && !error && (alreadyCompleted || submitted) && (
            <CompletedState
              submitted={submitted}
              score={submitted ? lastResult ?? completedScore : completedScore}
              weekNumber={weekNumber}
              nextAvailableAt={nextAvailableAt}
              countdown={countdown}
            />
          )}

          {!loading && !error && !alreadyCompleted && !submitted && questions.length === 0 && (
            <p className="py-16 text-center font-body text-sm text-text/60">
              No quiz available this week.
            </p>
          )}

          {!loading && !error && !alreadyCompleted && !submitted && questions.length > 0 && (
            <ActiveQuiz
              question={questions[currentIndex]}
              currentIndex={currentIndex}
              total={questions.length}
              weekNumber={weekNumber}
              selected={answers[questions[currentIndex].id]}
              submitting={submitting}
              onSelect={(option) => selectOption(questions[currentIndex].id, option)}
              onNext={handleNext}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   COMPLETED / ALREADY-CHECKED-IN STATE
========================================================= */

function CompletedState({
  submitted,
  score,
  weekNumber,
  nextAvailableAt,
  countdown,
}: {
  submitted: boolean;
  score: { totalScore: number; maxScore: number } | null;
  weekNumber: number | null;
  nextAvailableAt: Date | null;
  countdown: string;
}) {
  return (
    <div className="relative py-4 text-center">
      {/* decorative plant, tucked in the corner */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 opacity-15 sm:h-48 sm:w-48">
        <Image src="/plant.png" alt="" fill className="object-contain" />
      </div>

      <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-green/30 bg-green/10 text-3xl shadow-sm">
        🌱
      </div>

      <h2 className="relative font-heading text-2xl font-bold text-heading">
        {submitted ? "Thanks for checking in" : "You've already checked in this week"}
      </h2>
      <p className="relative mx-auto mt-2 max-w-xs font-body text-sm text-text/70">
        {submitted
          ? "Your answers this week will help shape next week's check-in."
          : "Come back for your next weekly check-in."}
      </p>

      

      {nextAvailableAt && !submitted && (
        <>
          <div className=" relative mx-auto mt-8 h-0 w-16 border-t-[3px] border-dotted border-green/50" />
          <div className=" relative mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-green/30 bg-green/10 px-4 py-2 font-body text-xs font-medium text-text/70">
            <ClockIcon />
            <p className="text-xl">Next check-in in {countdown}</p>
          </div>
        </>
      )}

      <div className="relative mt-8 flex justify-center">
        <Link href="/home">
          <Button width="w-52">Back to home</Button>
        </Link>
      </div>
    </div>
  );
}

/* =========================================================
   ACTIVE QUIZ STATE
========================================================= */

function ActiveQuiz({
  question,
  currentIndex,
  total,
  weekNumber,
  selected,
  submitting,
  onSelect,
  onNext,
}: {
  question: { id: string; question: string; options: string[] };
  currentIndex: number;
  total: number;
  weekNumber: number | null;
  selected: string | undefined;
  submitting: boolean;
  onSelect: (option: string) => void;
  onNext: () => void;
}) {
  const isLast = currentIndex === total - 1;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <span className="font-body text-xs font-semibold uppercase tracking-wide text-text/50">
          Week {weekNumber} check-in
        </span>
        <span className="font-body text-xs font-semibold text-heading">
          {currentIndex + 1}/{total}
        </span>
      </div>

      <div className="mb-8 h-1.5 w-full rounded-full bg-green/15">
        <div
          className="h-1.5 rounded-full bg-green transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
        />
      </div>

      <h2 className="mb-6 font-heading text-lg font-bold text-heading">{question.question}</h2>

      <div className="flex flex-col gap-3">
        {question.options.map((option) => (
          <button
            key={option}
            onClick={() => onSelect(option)}
            className={`rounded-2xl border px-4 py-3 text-left font-body text-sm transition-colors ${
              selected === option
                ? "border-green bg-green/15 text-text"
                : "border-green/20 text-text/80 hover:border-green/50"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Button
          onClick={onNext}
          disabled={!selected || submitting}
          width="w-full"
          className="disabled:pointer-events-none disabled:opacity-40"
        >
          {submitting ? "Saving…" : isLast ? "Finish" : "Next"}
        </Button>
      </div>
    </div>
  );
}

function ClockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-heading/70"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}