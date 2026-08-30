// GET /api/journals — the logged-in patient's own journal history.
// Requires a valid journal-unlock token in addition to the session —
// patientId is ALWAYS taken from the session, never from the client.
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import db from "@/lib/db";
import Journal from "@/models/Journal";
import { hasJournalUnlock } from "@/lib/journalLock";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "patient") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const unlocked = await hasJournalUnlock(user._id.toString());
  if (!unlocked) {
    return NextResponse.json(
      { error: "Locked", needsUnlock: true },
      { status: 401 }
    );
  }

  await db();

  const entries = await Journal.find({ patientId: user._id })
    .sort({ date: -1 })
    .select("date mood sleepQuality feelings reflection todos")
    .lean();

  return NextResponse.json({ entries });
}
