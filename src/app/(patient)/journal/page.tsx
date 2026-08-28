

// src/app/(patient)/journal/page.tsx
"use client";

import { useEffect, useState } from "react";
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

// TODO: replace with real assignments once therapist-side task assignment exists.
const MOCK_TODOS: TodoItem[] = [
  { id: "1", text: "Practice the 4-7-8 breathing exercise before bed", done: false },
  { id: "2", text: "Write down one thing that went well today", done: false },
  { id: "3", text: "Take a 10 minute walk outside", done: false },
];

export default function JournalPage() {
  const [reflection, setReflection] = useState("");
  const [feelings, setFeelings] = useState("");
  const [sleepQuality, setSleepQuality] = useState<SleepQuality | null>(null);
  const [mood, setMood] = useState<Mood | null>(null);
  const [todos, setTodos] = useState<TodoItem[]>(MOCK_TODOS);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

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
      });
  }, []);

  function toggleTodo(id: string) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }

  async function handleSubmit() {
    setError("");
    setSaved(false);

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
          todos: todos.map((t) => ({ text: t.text, done: t.done })),
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-green p-4 sm:p-8">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-white/10" />

      <div className="relative mx-auto max-w-4xl">
        <div className="mb-4 flex items-center justify-between px-2">
          <button
            aria-label="Open menu"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-background text-lg shadow-sm transition hover:scale-105"
          >
            ☰
          </button>
        </div>

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
                  placeholder="What's on your mind today?"
                  rows={10}
                  className="h-56 w-full resize-none rounded-2xl border border-green/30 bg-green/10 p-4 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/30"
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
                      onClick={() => setSleepQuality(opt.value)}
                      className={`flex flex-col items-center gap-0.5 rounded-lg border px-1 py-1.5 transition ${
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
                      onClick={() => setMood(opt.value)}
                      className={`flex flex-col items-center gap-0.5 rounded-lg border px-1 py-1.5 transition ${
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
                  className="h-56 w-full resize-none rounded-2xl border border-green/30 bg-green/10 p-4 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/30"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium tracking-wide text-text/60 uppercase">
                  To-do
                </label>
                <div className="flex flex-col gap-1 rounded-2xl border border-green/30 bg-green/5 p-3">
                  {todos.map((todo) => (
                    <button
                      key={todo.id}
                      type="button"
                      onClick={() => toggleTodo(todo.id)}
                      className="flex items-center gap-3 rounded-lg p-2 text-left transition hover:bg-green/10"
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                          todo.done
                            ? "border-green bg-green text-white"
                            : "border-green/40 bg-white"
                        }`}
                      >
                        {todo.done && "✓"}
                      </span>
                      <span
                        className={`text-sm ${
                          todo.done ? "text-text/40 line-through" : "text-text"
                        }`}
                      >
                        {todo.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-auto flex flex-col gap-3">
                {error && <p className="text-sm text-red-600">{error}</p>}
                {saved && <p className="text-sm text-heading">Saved for today ✓</p>}

                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "Saving..." : "Submit"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}