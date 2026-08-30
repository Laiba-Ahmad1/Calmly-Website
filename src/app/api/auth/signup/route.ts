// POST /api/auth/signup — create user (defaults to patient role unless invited as therapist)
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db  from "@/lib/db";
import User from "@/models/User";
import  { AnxietyType } from "@/lib/anxiety";
import PatientProfile from "@/models/PatientProfile";
import TherapistProfile from "@/models/TherapistProfile";
import { saveUploadedFile } from "@/lib/uploadFile"; // helper, see below

export async function POST(request: NextRequest) {
  try {
    await db();

    const formData = await request.formData();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as "patient" | "therapist";
    const gender = formData.get("gender") as string;


    if (!name || !email || !password || !role || !gender) {
      return NextResponse.json(
        { error: "Missing required fields" },
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
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }

        // create the shared User first
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
      gender,
    });

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

    return NextResponse.json(
      {
        message:
          role === "therapist"
            ? "Account created. Your document is under review."
            : "Account created successfully.",
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