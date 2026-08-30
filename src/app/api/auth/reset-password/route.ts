// POST /api/auth/reset-password — verify the reset OTP and set a new password.
// The OTP is consumed on success (verifyOtp) and can never be reused.
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import User from "@/models/User";
import {
  normalizeEmail,
  validateEmail,
  validateOtp,
  validatePassword,
} from "@/lib/validation";
import { verifyOtp } from "@/lib/otp";

export async function POST(request: NextRequest) {
  try {
    await db();

    const body = await request.json().catch(() => null);
    const email = normalizeEmail(body?.email);
    const code = typeof body?.code === "string" ? body.code.trim() : "";
    const newPassword =
      typeof body?.newPassword === "string" ? body.newPassword : "";

    const emailError = validateEmail(email);
    if (emailError) {
      return NextResponse.json({ error: emailError }, { status: 400 });
    }
    const codeError = validateOtp(code);
    if (codeError) {
      return NextResponse.json({ error: codeError }, { status: 400 });
    }
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "This code is invalid." },
        { status: 400 }
      );
    }

    const result = await verifyOtp(email, "password_reset", code);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ _id: user._id }, { $set: { passwordHash } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Could not reset your password right now." },
      { status: 500 }
    );
  }
}
