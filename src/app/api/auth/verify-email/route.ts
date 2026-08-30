// POST /api/auth/verify-email — confirm signup with the emailed one-time code
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import User from "@/models/User";
import { normalizeEmail, validateEmail, validateOtp } from "@/lib/validation";
import { verifyOtp } from "@/lib/otp";

export async function POST(request: NextRequest) {
  try {
    await db();

    const body = await request.json().catch(() => null);
    const email = normalizeEmail(body?.email);
    const code = typeof body?.code === "string" ? body.code.trim() : "";

    const emailError = validateEmail(email);
    if (emailError) {
      return NextResponse.json({ error: emailError }, { status: 400 });
    }
    const codeError = validateOtp(code);
    if (codeError) {
      return NextResponse.json({ error: codeError }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // don't reveal whether the account exists
      return NextResponse.json(
        { error: "This code is invalid." },
        { status: 400 }
      );
    }

    const result = await verifyOtp(email, "email_verification", code);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    await User.updateOne(
      { _id: user._id },
      { $set: { emailVerified: true } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json(
      { error: "Could not verify your email right now." },
      { status: 500 }
    );
  }
}
