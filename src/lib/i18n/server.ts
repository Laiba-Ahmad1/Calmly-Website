// src/lib/i18n/server.ts
import db from "@/lib/db";
import PatientProfile from "@/models/PatientProfile";
import type { Language } from "@/lib/i18n/dictionaries";
import { tFor } from "@/lib/i18n/dictionaries";

// Reads the patient's language preference; falls back to English when the
// profile doesn't exist yet (e.g. during onboarding).
export async function getPatientLanguage(userId: string): Promise<Language> {
  await db();
  const profile = await PatientProfile.findOne({ userId })
    .select("language")
    .lean();
  return profile?.language === "ur" ? "ur" : "en";
}

export async function getPatientT(userId: string) {
  const language = await getPatientLanguage(userId);
  return { language, t: tFor(language) };
}
