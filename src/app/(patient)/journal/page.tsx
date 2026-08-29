// src/app/(patient)/journal/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import db from "@/lib/db";
import Journal from "@/models/Journal";
import { getPakistanDayStart, getPakistanDayEnd } from "@/lib/journal/today";
import JournalForm from "@/components/patient/Journal";

export default async function JournalPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await db();

  const todaysJournal = await Journal.findOne({
    patientId: user._id,
    date: { $gte: getPakistanDayStart(), $lt: getPakistanDayEnd() },
  }).select("_id");

  if (todaysJournal) {
    return (
      <div className="relative mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center text-center">
        <div className="rounded-[2rem] bg-background/90 px-8 py-10 shadow-sm">
          <p className="text-4xl">🌱</p>
          <h1 className="mt-4 font-heading text-2xl font-bold text-heading">
            You already wrote today's journal
          </h1>
          <p className="mt-2 font-body text-sm text-text/60">
            Come back tomorrow to write again.
          </p>
        </div>
      </div>
    );
  }

  return <JournalForm />;
}