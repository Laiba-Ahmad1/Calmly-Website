// src/app/(patient)/journals/page.tsx
// "My Journals" — the patient's private journal history. Behind a password
// verification gate: the page only renders entries when a short-lived
// server-side unlock token (issued after a bcrypt password check) is valid.
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import db from "@/lib/db";
import Journal from "@/models/Journal";
import { hasJournalUnlock } from "@/lib/journalLock";
import JournalUnlockForm from "@/components/patient/JournalUnlockForm";
import JournalLockButton from "@/components/patient/JournalLockButton";
import { formatDate } from "@/lib/format";

// mood/sleep are stored as numbers; show them the way the journal page does
const MOOD_DISPLAY: Record<number, { emoji: string; label: string }> = {
  1: { emoji: "😢", label: "Sad" },
  2: { emoji: "😕", label: "Low" },
  3: { emoji: "😐", label: "Okay" },
  4: { emoji: "🙂", label: "Good" },
  5: { emoji: "😄", label: "Happy" },
};

const SLEEP_DISPLAY: Record<number, { emoji: string; label: string }> = {
  1: { emoji: "😣", label: "Restless" },
  2: { emoji: "😐", label: "Okay" },
  3: { emoji: "😐", label: "Okay" },
  4: { emoji: "🙂", label: "Good" },
  5: { emoji: "😌", label: "Refreshing" },
};

export default async function MyJournalsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const unlocked = await hasJournalUnlock(user._id.toString());

  if (!unlocked) {
    return <JournalUnlockForm />;
  }

  await db();

  // patientId comes from the session — never from the client
  const entries = await Journal.find({ patientId: user._id })
    .sort({ date: -1 })
    .select("date mood sleepQuality feelings reflection todos")
    .lean();

  return (
    <div className="relative mx-auto max-w-4xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-2 text-center sm:px-0">
        <div className="mx-auto sm:mx-0">
          <h1 className="font-heading text-4xl text-white drop-shadow-sm">
            my journals
          </h1>
          <p className="mt-1 text-sm text-white/80">
            {entries.length === 0
              ? "Every entry you write will be kept here."
              : entries.length === 1
                ? "1 entry, kept safe."
                : `${entries.length} entries, kept safe.`}
          </p>
        </div>
        <div className="mx-auto sm:mx-0">
          <JournalLockButton />
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="relative">
          <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-[2rem] bg-background/50" />
          <div className="relative rounded-[2rem] bg-background p-8 text-center shadow-xl">
            <p className="text-4xl">🌱</p>
            <h2 className="mt-4 font-heading text-xl font-bold text-heading">
              No journals yet
            </h2>
            <p className="mt-2 font-body text-sm text-text/60">
              Write your first entry from the journal page — it will appear
              here once saved.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {entries.map((entry: any) => {
            const mood = MOOD_DISPLAY[entry.mood] ?? MOOD_DISPLAY[3];
            const sleep = SLEEP_DISPLAY[entry.sleepQuality] ?? SLEEP_DISPLAY[3];
            const hasTodos = entry.todos?.length > 0;

            return (
              <div key={entry._id.toString()} className="relative">
                <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-[2rem] bg-background/50" />
                <div className="absolute inset-0 translate-x-6 translate-y-6 rounded-[2rem] bg-background/25" />

                <article className="relative rounded-[2rem] bg-background p-6 shadow-xl sm:p-8">
                  <header className="flex flex-wrap items-center justify-between gap-3 border-b border-green/15 pb-4">
                    <p className="font-heading text-lg font-bold text-heading">
                      {formatDate(entry.date)}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 rounded-full border border-green/25 bg-green/10 px-3 py-1 font-body text-xs font-medium text-text/80">
                        <span>{mood.emoji}</span> {mood.label}
                      </span>
                      <span className="flex items-center gap-1.5 rounded-full border border-green/25 bg-green/10 px-3 py-1 font-body text-xs font-medium text-text/80">
                        <span>{sleep.emoji}</span> {sleep.label}
                      </span>
                    </div>
                  </header>

                  <div className="mt-5 grid gap-6 lg:grid-cols-2">
                    <section>
                      <h3 className="mb-2 text-xs font-medium tracking-wide text-text/60 uppercase">
                        feelings
                      </h3>
                      <p className="whitespace-pre-line font-body text-sm leading-relaxed text-text/85">
                        {entry.feelings}
                      </p>
                    </section>

                    <section>
                      <h3 className="mb-2 text-xs font-medium tracking-wide text-text/60 uppercase">
                        reflections
                      </h3>
                      <p className="whitespace-pre-line font-body text-sm leading-relaxed text-text/85">
                        {entry.reflection}
                      </p>
                    </section>
                  </div>

                  {hasTodos && (
                    <section className="mt-6">
                      <h3 className="mb-2 text-xs font-medium tracking-wide text-text/60 uppercase">
                        To-do
                      </h3>
                      <div className="flex flex-col gap-1 rounded-2xl border border-green/30 bg-green/5 p-3">
                        {entry.todos.map(
                          (todo: { text: string; done: boolean }, i: number) => (
                            <div
                              key={i}
                              className="flex items-center gap-3 rounded-lg p-2"
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
                                className={`font-body text-sm ${
                                  todo.done
                                    ? "text-text/40 line-through"
                                    : "text-text"
                                }`}
                              >
                                {todo.text}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </section>
                  )}
                </article>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
