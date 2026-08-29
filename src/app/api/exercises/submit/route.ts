// src/app/api/exercises/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth"; // adjust path to wherever your auth file lives
import Exercise from "@/models/Exercise";
import ExerciseSession from "@/models/ExerciseSession";
import { incrementPlantGrowth } from "@/lib/plant/incrementGrowth";
import {
  scoreBreathing,
  scoreMemoryMatch,
  scoreSound,
  scoreGarden,
} from "@/lib/plant/growth/calculate";
import type { ExercisePayload } from "@/lib/plant/growth/types";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as ExercisePayload;
  if (!body?.type || !body?.payload) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await db();

  let result: { growth: number; completed: boolean };
  let sessionSeconds: number;

  switch (body.type) {
    case "breathing":
      result = scoreBreathing(body.payload);
      sessionSeconds = body.payload.sessionSeconds;
      break;
    case "memory_match":
      result = scoreMemoryMatch(body.payload);
      sessionSeconds = body.payload.sessionSeconds;
      break;
    case "sound":
      result = scoreSound(body.payload);
      sessionSeconds = body.payload.sessionSeconds;
      break;
    case "garden":
      result = scoreGarden(body.payload);
      sessionSeconds = body.payload.sessionSeconds;
      break;
    default:
      return NextResponse.json({ error: "Unknown exercise type" }, { status: 400 });
  }

  const exercise = await Exercise.findOne({ type: body.type, active: true });

  const session = await ExerciseSession.create({
    userId: user._id,
    exerciseId: exercise?._id,
    type: body.type,
    durationSeconds: sessionSeconds,
    completed: result.completed,
    growthAwarded: result.growth,
    stats: body.payload,
    completedAt: new Date(),
  });

  const plant = await incrementPlantGrowth(user._id, result.growth);

  return NextResponse.json({ session, plant, growthAwarded: result.growth });
}