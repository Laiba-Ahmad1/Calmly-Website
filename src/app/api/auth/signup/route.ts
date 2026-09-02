// POST /api/auth/signup — create user (defaults to patient role unless invited as therapist).
// New accounts start unverified: a one-time code is emailed and must be
// entered before the account can log in.
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db  from "@/lib/db";
import User from "@/models/User";
import  { AnxietyType } from "@/lib/anxiety";
import PatientProfile from "@/models/PatientProfile";
import TherapistProfile from "@/models/TherapistProfile";
import { saveUploadedFile } from "@/lib/uploadFile";
import {
  normalizeEmail,
  validateEmail,
  validateName,
  validatePassword,
} from "@/lib/validation";
import { issueOtp } from "@/lib/otp";

export async function POST(request: NextRequest) {
  try {
    await db();

    const formData = await request.formData();

    const name = (formData.get("name") as string) ?? "";
    const email = normalizeEmail(formData.get("email"));
    const password = (formData.get("password") as string) ?? "";
    const role = formData.get("role") as "patient" | "therapist";
    const gender = formData.get("gender") as string;

    if (!name || !email || !password || !role || !gender) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const nameError = validateName(name);
    if (nameError) {
      return NextResponse.json({ error: nameError }, { status: 400 });
    }

    const emailError = validateEmail(email);
    if (emailError) {
      return NextResponse.json({ error: emailError }, { status: 400 });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    if (role !== "patient" && role !== "therapist") {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    const validGenders = ["Male", "Female"];
    if (!validGenders.includes(gender)) {
      return NextResponse.json(
        { error: "Invalid gender" },
        { status: 400 }
      );
    }

    // check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.emailVerified) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }

        // create the shared User first
    const passwordHash = await bcrypt.hash(password, 10);
let user;
    if (existingUser) {
  // unverified account with this email — treat as a fresh signup attempt,
  // overwriting the stale pending data rather than blocking
  existingUser.name = name.trim();
  existingUser.passwordHash = passwordHash;
  existingUser.role = role;
  existingUser.gender = gender;
  await existingUser.save();
  user = existingUser;

  // clear out any old role-specific profile so we don't end up with
  // duplicates or mismatched leftover data if the role changed
  await PatientProfile.findOneAndDelete({ userId: user._id });
  await TherapistProfile.findOneAndDelete({ userId: user._id });
} else {
  user = await User.create({
    name: name.trim(),
    email,
    passwordHash,
    role,
    gender,
    emailVerified: false,
  });
}

    // now branch based on role
    if (role === "patient") {
      const rawAnxietyType = formData.get("anxietyType") as string;
      const rawAge = formData.get("age") as string;

      const validAnxietyTypes: AnxietyType[] = ["social", "health", "panic attacks", "general"];
      const age = Number(rawAge);

      if (!validAnxietyTypes.includes(rawAnxietyType as AnxietyType)) {
        await User.findByIdAndDelete(user._id);
        return NextResponse.json(
          { error: "Invalid anxiety type" },
          { status: 400 }
        );
      }
      if (!age || age < 1 || age > 120) {
  await User.findByIdAndDelete(user._id);
  return NextResponse.json({ error: "Invalid age" }, { status: 400 });
}

      const anxietyType = rawAnxietyType as AnxietyType;

      await PatientProfile.create({
        userId: user._id,
        anxietyType,
          age,
      });
    }


    if (role === "therapist") {
      const document = formData.get("document") as File | null;

      if (!document) {
        await User.findByIdAndDelete(user._id);
        return NextResponse.json(
          { error: "Verification document is required" },
          { status: 400 }
        );
      }

      // save file to disk/cloud, get back a URL
      const documentUrl = await saveUploadedFile(document);

      await TherapistProfile.create({
        userId: user._id,
        documentUrl,
        documentName: document.name,
        verificationStatus: "pending",
      });
    }

    // email a one-time verification code — best-effort: the account exists
    // and can request a resend if delivery fails
    const otpResult = await issueOtp(email, "email_verification");

return NextResponse.json(
  {
    message:
      role === "therapist"
        ? "Account created. Your document is under review."
        : otpResult.ok
          ? "Account created successfully."
          : "Account created. A code was already sent recently — check your email or wait a moment to resend.",
    userId: user._id,
  },
  { status: 201 }
);
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Signup failed" },
      { status: 500 }
    );
  }
}
