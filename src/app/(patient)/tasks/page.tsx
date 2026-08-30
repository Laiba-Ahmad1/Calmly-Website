// src/app/(patient)/tasks/page.tsx
// Therapist-assigned to-dos for the logged-in patient. To-dos are checked off
// while writing the daily journal — that's what marks them completed.
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getPatientTasks } from "@/lib/tasks";
import { getPatientT } from "@/lib/i18n/server";
import { formatDate } from "@/lib/format";

export default async function TasksPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [{ active, completed }, { t }] = await Promise.all([
    getPatientTasks(user._id.toString()),
    getPatientT(user._id.toString()),
  ]);

  return (
    <div className="relative mx-auto max-w-3xl">
      <div className="rounded-[2.5rem] bg-background p-8 shadow-sm sm:p-12">
        <h1 className="font-heading text-3xl font-bold text-heading">
          {t("todos_title")}
        </h1>
        <p className="mt-2 font-body text-sm text-text/60">
          {t("todos_journal_hint")}
        </p>

        <section className="mt-8">
          <h2 className="font-body text-sm font-extrabold uppercase tracking-wide text-text/50">
            {t("todos_current")}
          </h2>

          {active.length === 0 ? (
            <p className="mt-3 font-body text-sm text-text/60">
              {t("todos_empty_current")}
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {active.map((task: any) => (
                <li
                  key={task._id.toString()}
                  className="flex items-start gap-3 rounded-2xl border border-green/30 bg-green/5 p-4"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-green/40 bg-white" />
                  <div>
                    <p className="font-body text-sm font-semibold text-text">
                      {task.text}
                    </p>
                    <p className="mt-0.5 font-body text-xs text-text/50">
                      {formatDate(task.assignedAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {completed.length > 0 && (
          <section className="mt-10">
            <h2 className="font-body text-sm font-extrabold uppercase tracking-wide text-text/50">
              {t("todos_completed")}
            </h2>
            <ul className="mt-3 flex flex-col gap-1">
              {completed.map((task: any) => (
                <li
                  key={task._id.toString()}
                  className="flex items-center justify-between gap-3 border-b border-green/15 py-2"
                >
                  <span className="font-body text-sm text-text/50 line-through">
                    {task.text}
                  </span>
                  <span className="shrink-0 font-body text-xs text-text/40">
                    {formatDate(task.completedAt)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
