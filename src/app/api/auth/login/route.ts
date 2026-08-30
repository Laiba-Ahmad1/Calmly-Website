// POST /api/auth/login
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "@/lib/db";
import User from "@/models/User";
import TherapistProfile from "@/models/TherapistProfile";
import {
  normalizeEmail,
  validateEmail,
  validateLoginPassword,
} from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    await db();

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Please fill in both fields." },
        { status: 400 }
      );
    }

    const email = normalizeEmail(body.email);
    const password = typeof body.password === "string" ? body.password : "";

    const emailError = validateEmail(email);
    if (emailError) {
      return NextResponse.json({ error: emailError }, { status: 400 });
    }
    const passwordError = validateLoginPassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // pre-existing accounts have no emailVerified field — treated as verified
    if (user.emailVerified === false) {
      return NextResponse.json(
        {
          error: "Please verify your email before logging in.",
          needsVerification: true,
        },
        { status: 403 }
      );
    }

    let verificationStatus: string | null = null;

    if (user.role === "therapist") {
      const profile = await TherapistProfile.findOne({ userId: user._id });
      verificationStatus = profile?.verificationStatus ?? "pending";
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET_KEY!,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({
      role: user.role,
      verificationStatus,
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days, matches JWT expiresIn
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
