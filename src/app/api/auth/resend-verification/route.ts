// POST /api/auth/resend-verification — re-send the signup OTP (rate-limited).
// Always answers success so the endpoint can't be used to probe accounts.
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import User from "@/models/User";
import { normalizeEmail, validateEmail } from "@/lib/validation";
import { issueOtp } from "@/lib/otp";

export async function POST(request: NextRequest) {
  try {
    await db();

    const body = await request.json().catch(() => null);
    const email = normalizeEmail(body?.email);

    const emailError = validateEmail(email);
    if (emailError) {
      return NextResponse.json({ error: emailError }, { status: 400 });
    }

    const user = await User.findOne({ email }).select("emailVerified");
    if (user && user.emailVerified !== false) {
      // already verified (or pre-existing account) — nothing to send
      return NextResponse.json({ success: true });
    }

    // rate limiting happens inside issueOtp; for unknown accounts we still
    // run it so response timing doesn't reveal account existence
    const result = await issueOtp(email, "email_verification");

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Could not send a new code right now." },
      { status: 500 }
    );
  }
}
