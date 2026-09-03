
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/shared/Button";
import { getJournalGreeting } from "@/lib/journal/greeting";
import { SleepQuality, Mood } from "@/lib/journal/mappings";

interface TodoItem {
  id: string;
  text: string;
  done: boolean;
}

const SLEEP_OPTIONS: { value: SleepQuality; emoji: string; label: string }[] = [
  { value: "restless", emoji: "😣", label: "Restless" },
  { value: "okay", emoji: "😐", label: "Okay" },
  { value: "good", emoji: "🙂", label: "Good" },
  { value: "refreshing", emoji: "😌", label: "Refreshing" },
];

const MOOD_OPTIONS: { value: Mood; emoji: string; label: string }[] = [
  { value: "sad", emoji: "😢", label: "Sad" },
  { value: "low", emoji: "😕", label: "Low" },
  { value: "okay", emoji: "😐", label: "Okay" },
  { value: "good", emoji: "🙂", label: "Good" },
  { value: "happy", emoji: "😄", label: "Happy" },
];

// To-dos are now written by the patient themselves — always exactly 3
// slots. "id" is a local slot id (todo-0/1/2), not a PatientTask _id;
// the submit payload keeps the same {taskId, text, done} shape as before
// so the scoring logic on the backend (1 checked todo = 1 point) doesn't
// need to change.

export default function JournalForm() {
  const router = useRouter();
  const [reflection, setReflection] = useState("");
  const [feelings, setFeelings] = useState("");
  const [sleepQuality, setSleepQuality] = useState<SleepQuality | null>(null);
  const [mood, setMood] = useState<Mood | null>(null);
  const [todos, setTodos] = useState<TodoItem[]>([
    { id: "todo-0", text: "", done: false },
    { id: "todo-1", text: "", done: false },
    { id: "todo-2", text: "", done: false },
  ]);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const [greeting, setGreeting] = useState("Welcome to your journal — this is where it starts.");

  useEffect(() => {
    fetch("/api/journal/history")
      .then((res) => res.json())
      .then((data) => {
        const lastEntryDate = data.lastEntryDate ? new Date(data.lastEntryDate) : null;
        setGreeting(getJournalGreeting(lastEntryDate, data.currentStreak ?? 0));
      
      })
      .catch(() => {
        // history fetch failing shouldn't block journaling — keep default greeting
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  function updateTodoText(id: string, text: string) {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, text } : t)));
  }

  function toggleTodo(id: string) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }

  async function handleSubmit() {
    setError("");

    if (!reflection.trim() || !feelings.trim()) {
      setError("Fill in both reflections and feelings before submitting.");
      return;
    }
    if (!sleepQuality || !mood) {
      setError("Pick a sleep quality and mood for today.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/journal/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reflection,
          feelings,
          sleepQuality,
          mood,
          // taskId lets the backend mark therapist tasks completed when checked
          todos: todos.map((t) => ({ taskId: t.id, text: t.text, done: t.done })),
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      setSaved(true);
    } catch {
      setError("Couldn't save right now — try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  }

  if(loading) {
    return (
      <div className="flex h-96 items-center justify-center text-heading/70">
        Loading...
      </div>
    );
  }
  return (
    <div className="relative mx-auto max-w-4xl">
      <div className="mb-4 px-2 text-center">
        <h1 className="font-heading text-4xl text-white drop-shadow-sm">
          my journal
        </h1>
        <p className="mt-1 text-sm text-white/80">{greeting}</p>
      </div>

      <div className="relative">
        <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-[2rem] bg-background/50" />
        <div className="absolute inset-0 translate-x-6 translate-y-6 rounded-[2rem] bg-background/25" />

        <div className="relative grid overflow-hidden rounded-[2rem] shadow-xl lg:grid-cols-2">
          <div
            className="flex flex-col gap-6 rounded-[2rem] bg-background p-6 sm:p-8
                       shadow-[inset_-18px_0_24px_-20px_rgba(0,0,0,0.18)]
                       lg:rounded-tl-[3.5rem] lg:rounded-bl-[1.25rem] lg:rounded-tr-none lg:rounded-br-none"
          >
            <div>
              <label className="mb-2 block text-xs font-medium tracking-wide text-text/60 uppercase">
                reflections
              </label>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="What did you notice about your anxiety today?"
                rows={10}
                disabled={saved}
                className="h-56 w-full resize-none rounded-2xl border border-green/30 bg-green/10 p-4 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/30 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium tracking-wide text-text/60 uppercase">
                Sleep quality
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {SLEEP_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={saved}
                    onClick={() => setSleepQuality(opt.value)}
                    className={`flex flex-col items-center gap-0.5 rounded-lg border px-1 py-1.5 transition disabled:opacity-60 ${
                      sleepQuality === opt.value
                        ? "border-green bg-green/20"
                        : "border-green/30 bg-green/5 hover:bg-green/10"
                    }`}
                  >
                    <span className="text-base">{opt.emoji}</span>
                    <span className="text-[9px] font-medium text-text/70">
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium tracking-wide text-text/60 uppercase">
                Mood
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {MOOD_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={saved}
                    onClick={() => setMood(opt.value)}
                    className={`flex flex-col items-center gap-0.5 rounded-lg border px-1 py-1.5 transition disabled:opacity-60 ${
                      mood === opt.value
                        ? "border-green bg-green/20"
                        : "border-green/30 bg-green/5 hover:bg-green/10"
                    }`}
                  >
                    <span className="text-base">{opt.emoji}</span>
                    <span className="text-[9px] font-medium text-text/70">
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-10 -translate-x-1/2 bg-gradient-to-r from-black/10 via-black/[0.03] to-black/10 lg:block" />

          <div
            className="flex flex-col gap-6 rounded-[2rem] bg-background p-6 sm:p-8
                       shadow-[inset_18px_0_24px_-20px_rgba(0,0,0,0.18)]
                       lg:rounded-tr-[3.5rem] lg:rounded-br-[1.25rem] lg:rounded-tl-none lg:rounded-bl-none"
          >
            <div>
              <label className="mb-2 block text-xs font-medium tracking-wide text-text/60 uppercase">
                feelings
              </label>
              <textarea
                value={feelings}
                onChange={(e) => setFeelings(e.target.value)}
                placeholder="How did today make you feel?"
                rows={10}
                disabled={saved}
                className="h-56 w-full resize-none rounded-2xl border border-green/30 bg-green/10 p-4 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/30 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium tracking-wide text-text/60 uppercase">
                To-do
              </label>
              <div className="flex flex-col gap-1 rounded-2xl border border-green/30 bg-green/5 p-3">
                {todos.map((todo, i) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-green/10"
                  >
                    <button
                      type="button"
                      disabled={saved}
                      onClick={() => toggleTodo(todo.id)}
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition disabled:opacity-60 ${
                        todo.done
                          ? "border-green bg-green text-white"
                          : "border-green/40 bg-white"
                      }`}
                    >
                      {todo.done && "✓"}
                    </button>
                    <input
                      type="text"
                      value={todo.text}
                      onChange={(e) => updateTodoText(todo.id, e.target.value)}
                      placeholder={`To-do #${i + 1}`}
                      disabled={saved}
                      className={`flex-1 bg-transparent text-sm outline-none placeholder:text-text/40 disabled:opacity-60 ${
                        todo.done ? "text-text/40 line-through" : "text-text"
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto flex flex-col gap-3">
              {error && <p className="text-sm text-red-600">{error}</p>}
              {saved && (
                <p className="text-sm text-heading">
                  Saved for today, your plant grew a little! 🌱
                </p>
              )}

              <Button onClick={handleSubmit} disabled={submitting || saved}>
                {saved ? "Saved ✓" : submitting ? "Saving..." : "Submit"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}