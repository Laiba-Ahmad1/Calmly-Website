// app/api/journal/history/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getJournalHistory } from "@/lib/journal/streak";

export async function GET() {
  try {
    await db();

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const history = await getJournalHistory(user._id.toString());
    return NextResponse.json(history);
  } catch (err) {
    console.error("Error fetching journal history:", err);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}