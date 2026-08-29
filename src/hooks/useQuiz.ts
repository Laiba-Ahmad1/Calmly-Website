// hooks/useQuiz.ts
import { useEffect, useState, useCallback } from "react";

interface QuizQuestionDTO {
  id: string;
  question: string;
  dimension: string;
  options: string[];
}

export function useQuiz() {
  const [questions, setQuestions] = useState<QuizQuestionDTO[]>([]);
  const [weekNumber, setWeekNumber] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [completedScore, setCompletedScore] = useState<{ totalScore: number; maxScore: number } | null>(null);
  const [nextAvailableAt, setNextAvailableAt] = useState<Date | null>(null);

  useEffect(() => {
    fetch("/api/quiz/current")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setWeekNumber(data.weekNumber);

        if (data.alreadyCompleted) {
          setAlreadyCompleted(true);
          setCompletedScore({ totalScore: data.totalScore, maxScore: data.maxScore });
          setNextAvailableAt(new Date(data.nextAvailableAt));
        } else {
          setQuestions(data.questions);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const submit = useCallback(
    async (responses: { questionId: string; selectedOption: string }[]) => {
      setSubmitting(true);
      setError(null);
      try {
        const res = await fetch("/api/quiz/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ responses }),
        });
        const data = await res.json();

        if (!res.ok) {
          if (res.status === 409) setAlreadyCompleted(true);
          throw new Error(data.error);
        }

        setSubmitted(true);
        return data.result;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    []
  );

  return {
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
  };
}