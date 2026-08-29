// src/lib/plant/incrementGrowth.ts
import db from "@/lib/db";
import PatientProfile from "@/models/PatientProfile";
import { calculateLevel } from "@/lib/plant/growth";
import mongoose from "mongoose";

export async function incrementPlantGrowth(userId: mongoose.Types.ObjectId | string, amount: number) {
  await db();

  const profile = await PatientProfile.findOne({ userId });
  if (!profile) return null;

  profile.plant.growth = Math.max(0, profile.plant.growth + amount);
  profile.plant.level = calculateLevel(profile.plant.growth);

  await profile.save();
  return profile.plant;
}