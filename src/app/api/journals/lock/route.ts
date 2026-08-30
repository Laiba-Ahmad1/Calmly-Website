// POST /api/journals/lock — close the protected journal session early
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { JOURNAL_UNLOCK_COOKIE } from "@/lib/journalLock";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(JOURNAL_UNLOCK_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
