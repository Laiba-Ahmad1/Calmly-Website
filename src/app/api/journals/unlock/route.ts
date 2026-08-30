// POST /api/journals/unlock — verify the account password to open the
// private journal history for 15 minutes. Server-side bcrypt check only;
// the hash never leaves the database.
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getCurrentUser } from "@/lib/auth";
import db from "@/lib/db";
import Users from "@/models/User";
import {
  mintUnlockToken,
  unlockCookieOptions,
  JOURNAL_UNLOCK_COOKIE,
} from "@/lib/journalLock";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "patient") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const password = typeof body?.password === "string" ? body.password : "";

    if (!password) {
      return NextResponse.json(
        { error: "Please enter your password." },
        { status: 400 }
      );
    }

    await db();

    // re-fetch with the hash — getCurrentUser deliberately excludes it
    const record = await Users.findById(user._id).select("passwordHash");
    if (!record?.passwordHash) {
      return NextResponse.json(
        { error: "Could not verify your password." },
        { status: 500 }
      );
    }

    const matches = await bcrypt.compare(password, record.passwordHash);
    if (!matches) {
      return NextResponse.json(
        { error: "That password doesn't match. Please try again." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(
      JOURNAL_UNLOCK_COOKIE,
      mintUnlockToken(user._id.toString()),
      unlockCookieOptions()
    );
    return response;
  } catch (error) {
    console.error("Journal unlock error:", error);
    return NextResponse.json(
      { error: "Could not unlock your journals right now." },
      { status: 500 }
    );
  }
}
