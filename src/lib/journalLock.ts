// src/lib/journalLock.ts
// Short-lived server-side authorization for the patient's private journal
// history. Unlocking = verifying the account password once; success mints a
// 15-minute signed JWT in an httpOnly cookie so the patient doesn't re-enter
// the password for every entry during the same protected session.
import { cookies } from "next/headers";
import jwt, { JwtPayload } from "jsonwebtoken";

const COOKIE_NAME = "journal_unlock";
const UNLOCK_TTL_SECONDS = 15 * 60;

interface UnlockPayload extends JwtPayload {
  purpose: "journal-unlock";
  userId: string;
}

export function mintUnlockToken(userId: string): string {
  return jwt.sign(
    { purpose: "journal-unlock", userId },
    process.env.JWT_SECRET_KEY as string,
    { expiresIn: UNLOCK_TTL_SECONDS }
  );
}

export function unlockCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: UNLOCK_TTL_SECONDS,
  };
}

export const JOURNAL_UNLOCK_COOKIE = COOKIE_NAME;

// True when the CURRENT logged-in user holds a valid, unexpired unlock token.
export async function hasJournalUnlock(userId: string): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return false;

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY as string
    ) as UnlockPayload;
    return (
      decoded.purpose === "journal-unlock" &&
      decoded.userId === userId.toString()
    );
  } catch {
    return false;
  }
}
