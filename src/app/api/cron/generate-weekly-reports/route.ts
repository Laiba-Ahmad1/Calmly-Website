// src/app/api/cron/generate-weekly-reports/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import PatientProfile from "@/models/PatientProfile";
import { generatePatientReport } from "@/lib/ai/generatePatientReport";

export async function GET(req: NextRequest) {
  // Protects this from being publicly triggerable — Vercel Cron sends this header automatically
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db();

  const patients = await PatientProfile.find({}).select("userId");

  const results = await Promise.allSettled(
    patients.map((p) => generatePatientReport(p.userId.toString()))
  );

  const generated = results.filter((r) => r.status === "fulfilled" && r.value !== null).length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return NextResponse.json({ total: patients.length, generated, failed });
}