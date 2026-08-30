// POST /api/therapist/advice — create advice for a connected patient
// DELETE /api/therapist/advice?id=... — archive advice (sets active=false)
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createAdvice, deactivateAdvice } from "@/lib/therapist/advice";
import { createNotification } from "@/lib/notifications";
import { CALMLY_MODULES, ModuleKey } from "@/lib/modules";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "therapist") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { patientId, text, relatedModule } = await req.json();

  const result = await createAdvice(user._id, patientId, text, relatedModule);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  // module-aware deep link so the CTA opens the exact exercise
  const module_ = CALMLY_MODULES[result.advice.relatedModule as ModuleKey];
  await createNotification({
    recipientId: patientId,
    type: "therapist_advice",
    title: "New advice from your therapist",
    message: result.advice.text.slice(0, 200),
    link: module_.href,
    dedupeKey: `advice:${result.advice._id}`,
  }).catch(() => null); // notification failure must not fail the advice creation

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "therapist") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing advice id" }, { status: 400 });
  }

  const removed = await deactivateAdvice(user._id, id);
  if (!removed) {
    return NextResponse.json({ error: "Advice not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
