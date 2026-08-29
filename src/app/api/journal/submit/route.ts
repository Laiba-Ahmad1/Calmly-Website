// app/api/journal/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import Journal from "@/models/Journal";
import { getCurrentUser } from "@/lib/auth";
import { sleepQualityToNumber, moodToNumber } from "@/lib/journal/mappings";
import { calculateJournalGrowth } from "@/lib/plant/growth/calculateJournalGrowth";
import { incrementPlantGrowth } from "@/lib/plant/incrementGrowth";

export async function POST(req: NextRequest) {
  try {
    await db();

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reflection, feelings, sleepQuality, mood, todos } = await req.json();

    if (!reflection?.trim() || !feelings?.trim() || !sleepQuality || !mood) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const moodNumber = moodToNumber(mood);
    const sleepQualityNumber = sleepQualityToNumber(sleepQuality);

    const entry = await Journal.create({
      patientId: user._id,
      date: new Date(),
      mood: moodNumber,
      sleepQuality: sleepQualityNumber,
      feelings,
      reflection,
      todos: todos ?? [],
    });

    const growthAwarded = calculateJournalGrowth({
      mood: moodNumber,
      sleepQuality: sleepQualityNumber,
      feelings,
      reflection,
    });

    const plant = await incrementPlantGrowth(user._id, growthAwarded);

    return NextResponse.json({ success: true, entry, plant, growthAwarded });
  } catch (err) {
    console.error("Error saving journal entry:", err);
    return NextResponse.json({ error: "Failed to save journal entry" }, { status: 500 });
  }
}