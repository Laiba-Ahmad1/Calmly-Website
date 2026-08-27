// components/Quiz.tsx
"use client";

import { useState } from "react";
import { useQuiz } from "@/hooks/useQuiz";
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
  } = useQuiz();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(var(--color-green))] flex items-center justify-center">
        <div className="text-[rgb(var(--color-heading))] font-[var(--font-body)]">
          Loading your quiz…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[rgb(var(--color-green))] flex items-center justify-center">
        <div className="bg-[rgb(var(--color-background))] rounded-[30px] px-10 py-8 text-center">
          <p className="text-[rgb(var(--color-text))] font-[var(--font-body)]">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[rgb(var(--color-green))] flex items-center justify-center px-6">
        <div className="w-full max-w-3xl bg-[rgb(var(--color-background))] rounded-[38px] p-12 text-center shadow-sm">
          <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-[rgb(var(--color-green))]/30 flex items-center justify-center">
            <span className="text-4xl">🌱</span>
          </div>

          <h2
            className="text-3xl text-[rgb(var(--color-heading))]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Thanks for checking in
          </h2>

          <p
            className="mt-3 text-[rgb(var(--color-text))]/70"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Your answers this week will help shape next week's check-in.
          </p>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-[rgb(var(--color-green))] flex items-center justify-center">
        <div className="bg-[rgb(var(--color-background))] rounded-[30px] px-10 py-8 text-center">
          <p
            className="text-[rgb(var(--color-text))]/70"
            style={{ fontFamily: "var(--font-body)" }}
          >
            No quiz available this week.
          </p>
        </div>
      </div>
    );
  }

  const question = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const selected = answers[question.id];

  function selectOption(option: string) {
    setAnswers((prev) => ({
      ...prev,
      [question.id]: option,
    }));
  }

  async function handleNext() {
    if (isLast) {
      const responses = questions.map((q) => ({
        questionId: q.id,
        selectedOption: answers[q.id],
      }));

      await submit(responses);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  function handleBack() {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--color-green))] px-6 py-10 relative overflow-hidden">
      {/* Decorative background circles */}
      <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-white/10" />
      <div className="absolute -bottom-32 -right-20 w-80 h-80 rounded-full bg-white/10" />

      {/* Menu button — visual only, matching homepage */}
      <button
        className="
          absolute
          top-8
          left-8
          w-12
          h-12
          rounded-full
          bg-[rgb(var(--color-background))]
          flex
          items-center
          justify-center
          text-[rgb(var(--color-text))]
          shadow-sm
        "
        aria-label="Menu"
      >
        <span className="text-xl">☰</span>
      </button>

      {/* Main card */}
      <div
        className="
          relative
          z-10
          max-w-6xl
          mx-auto
          bg-[rgb(var(--color-background))]
          rounded-[38px]
          p-8
          md:p-12
          lg:p-14
          shadow-sm
        "
      >
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12 lg:gap-16">
          {/* LEFT SIDE */}
          <div className="flex flex-col items-center">
            {/* Plant illustration */}
            <div className="w-52 h-52 flex items-center justify-center relative">
              <div className="absolute w-40 h-40 rounded-full bg-[rgb(var(--color-green))]/20" />
              <div className="absolute w-32 h-32 rounded-full bg-[rgb(var(--color-green))]/15 translate-x-10 translate-y-8" />

              <div className="relative text-center">
                <div className="text-7xl">🌱</div>
              </div>
            </div>

            {/* Week */}
            <h3
              className="
                text-xl
                font-medium
                text-[rgb(var(--color-heading))]
                mt-2
              "
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Week {weekNumber} check-in
            </h3>

            {/* Question dots */}
            <div className="flex items-center gap-3 mt-8">
              {questions.map((_, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className={`
                      w-5
                      h-5
                      rounded-full
                      border-2
                      flex
                      items-center
                      justify-center
                      transition-all
                      ${
                        index === currentIndex
                          ? "border-[rgb(var(--color-green))]"
                          : index < currentIndex
                            ? "border-[rgb(var(--color-green))] bg-[rgb(var(--color-green))]"
                            : "border-[rgb(var(--color-green))]/40"
                      }
                    `}
                  >
                    {index <= currentIndex && (
                      <div className="w-2 h-2 rounded-full bg-[rgb(var(--color-green))]" />
                    )}
                  </div>

                  {index < questions.length - 1 && (
                    <div className="w-5 h-px bg-[rgb(var(--color-green))]/30" />
                  )}
                </div>
              ))}
            </div>

            <p
              className="mt-5 text-sm text-[rgb(var(--color-heading))]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Question {currentIndex + 1} of {questions.length}
            </p>

            {/* Encouragement box */}
            <div className="mt-10 w-full max-w-[250px] border border-[rgb(var(--color-green))]/25 rounded-[20px] p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[rgb(var(--color-green))]/20 flex items-center justify-center shrink-0">
                <span className="text-xl">🌿</span>
              </div>

              <div>
                <p
                  className="font-medium text-[rgb(var(--color-text))]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  You're growing
                </p>

                <p
                  className="text-xs mt-1 text-[rgb(var(--color-text))]/60 leading-relaxed"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Keep going, you're doing great!
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex flex-col">
            {/* Heading */}
            <div>
              <h1
                className="
                  text-4xl
                  md:text-5xl
                  text-[rgb(var(--color-heading))]
                "
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Weekly quiz
              </h1>

              <p
                className="
                  mt-2
                  text-base
                  text-[rgb(var(--color-text))]
                  opacity-60
                "
                style={{ fontFamily: "var(--font-body)" }}
              >
                Check in with how you've been feeling
              </p>
            </div>

            {/* Decorative divider */}
            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-[rgb(var(--color-heading))]/20" />

              <span className="text-[rgb(var(--color-green))] text-lg">🌿</span>

              <div className="flex-1 h-px bg-[rgb(var(--color-heading))]/20" />
            </div>

            {/* Question */}
            <h2
              className="
                text-2xl
                md:text-3xl
                leading-relaxed
                text-[rgb(var(--color-text))]
                max-w-3xl
              "
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {question.question}
            </h2>

            {/* Options */}
            <div className="flex flex-col gap-3 mt-8">
              {question.options.map((option) => {
                const isSelected = selected === option;

                return (
                  <button
                    key={option}
                    onClick={() => selectOption(option)}
                    className={`
                      w-full
                      text-left
                      px-5
                      py-4
                      rounded-[16px]
                      border
                      transition-all
                      duration-200
                      flex
                      items-center
                      gap-4
                      ${
                        isSelected
                          ? `
                            border-[rgb(var(--color-green))]
                            bg-[rgb(var(--color-green))]/10
                          `
                          : `
                            border-[rgb(var(--color-heading))]/15
                            hover:border-[rgb(var(--color-green))]/50
                            hover:bg-[rgb(var(--color-green))]/5
                          `
                      }
                    `}
                  >
                    {/* Radio circle */}
                    <span
                      className={`
                        w-7
                        h-7
                        rounded-full
                        border-2
                        shrink-0
                        flex
                        items-center
                        justify-center
                        ${
                          isSelected
                            ? "border-[rgb(var(--color-green))]"
                            : "border-[rgb(var(--color-heading))]/25"
                        }
                      `}
                    >
                      {isSelected && (
                        <span className="w-3 h-3 rounded-full bg-[rgb(var(--color-green))]" />
                      )}
                    </span>

                    <span
                      className="text-[rgb(var(--color-text))]"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-10">
              {/* Back */}
              <button
                onClick={handleBack}
                disabled={currentIndex === 0}
                className="
                  px-6
                  py-3
                  rounded-[14px]
                  bg-[rgb(var(--color-green))]/10
                  text-[rgb(var(--color-heading))]
                  font-medium
                  transition-all
                  hover:bg-[rgb(var(--color-green))]/20
                  disabled:opacity-30
                  disabled:cursor-not-allowed
                "
                style={{ fontFamily: "var(--font-body)" }}
              >
                ← Back
              </button>

              {/* Next */}
              <button
                onClick={handleNext}
                disabled={!selected || submitting}
                className="
                  px-8
                  py-3
                  rounded-[14px]
                  bg-[rgb(var(--color-green))]
                  text-[rgb(var(--color-background))]
                  font-medium
                  transition-all
                  hover:opacity-90
                  disabled:opacity-40
                  disabled:cursor-not-allowed
                "
                style={{ fontFamily: "var(--font-body)" }}
              >
                {submitting ? "Saving…" : isLast ? "Finish →" : "Next →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
