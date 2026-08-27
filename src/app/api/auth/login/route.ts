// POST /api/auth/login
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "@/lib/db";
import User from "@/models/User";
import TherapistProfile from "@/models/TherapistProfile";

export async function POST(request: NextRequest) {
  try {
    await db();

    const { email, password } = await request.json();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
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