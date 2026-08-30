// src/lib/i18n/server.ts
import db from "@/lib/db";
import PatientProfile from "@/models/PatientProfile";
import TherapistProfile from "@/models/TherapistProfile";
import type { Language } from "@/lib/i18n/dictionaries";
import { tFor, interpolate } from "@/lib/i18n/dictionaries";

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

// Reads the therapist's language preference (TherapistProfile.language);
// falls back to English for profiles created before the field existed.
export async function getTherapistLanguage(userId: string): Promise<Language> {
  await db();
  const profile = await TherapistProfile.findOne({ userId })
    .select("language")
    .lean();
  return profile?.language === "ur" ? "ur" : "en";
}

export async function getTherapistT(userId: string) {
  const language = await getTherapistLanguage(userId);
  return { language, t: tFor(language) };
}

// Language-aware variants of the shared format helpers, used across the
// therapist workspace (the patient side keeps the shared English ones).
export function therapistRelative(
  language: Language,
  date: Date | string | null | undefined
): string {
  if (!date) return "—";
  const t = tFor(language);
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
  if (days <= 0) return t("t_rel_today");
  if (days === 1) return t("t_rel_yesterday");
  if (days < 30) return interpolate(t("t_rel_days_ago"), { days });
  const months = Math.floor(days / 30);
  return interpolate(
    months === 1 ? t("t_rel_month_ago") : t("t_rel_months_ago"),
    { months }
  );
}

export function therapistGreeting(
  language: Language,
  date: Date = new Date()
): string {
  const t = tFor(language);
  const h = date.getHours();
  if (h < 12) return t("t_greet_morning");
  if (h < 18) return t("t_greet_afternoon");
  return t("t_greet_evening");
}
