// POST /api/auth/forgot-password — email a password-reset OTP.
// Always returns generic success so it can't be used to probe accounts.
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

    const user = await User.findOne({ email }).select("_id");

    if (user) {
      const result = await issueOtp(email, "password_reset");
      if (!result.ok) {
        // surface rate limits (the only response that varies)
        return NextResponse.json({ error: result.error }, { status: result.status });
      }
    } else {
      // unknown email: same shape + rough timing as the real path
      await new Promise((r) => setTimeout(r, 150));
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists for that email, a reset code is on its way.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Could not send a reset code right now." },
      { status: 500 }
    );
  }
}
