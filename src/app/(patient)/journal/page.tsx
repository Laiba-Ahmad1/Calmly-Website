

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import db from "@/lib/db";
import Journal from "@/models/Journal";
import { getPakistanDayStart, getPakistanDayEnd } from "@/lib/journal/today";
import JournalPageClient from "@/components/patient/JournalPageClient";

export default async function JournalPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await db();

  const todaysJournal = await Journal.findOne({
    patientId: user._id,
    date: { $gte: getPakistanDayStart(), $lt: getPakistanDayEnd() },
  }).select("_id");

  return <JournalPageClient initialHasJournaledToday={!!todaysJournal} />;
}