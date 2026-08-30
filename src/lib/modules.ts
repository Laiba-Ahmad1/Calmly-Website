// src/lib/modules.ts
// Single source of truth for Calmly's patient-facing modules/exercises.
// Used by therapist advice ("Related to"), patient advice CTAs, and
// notifications so module names and routes are never duplicated.
import type { TFunction } from "@/lib/i18n/dictionaries";

export type ModuleKey =
  | "breathing"
  | "sound"
  | "memory_match"
  | "garden"
  | "journal"
  | "quiz";

export interface CalmlyModule {
  key: ModuleKey;
  // ExerciseSession type when the module is a scored exercise
  exerciseType?: "breathing" | "sound" | "memory_match" | "garden";
  href: string;
}

// memory_match is exercised through the Color Match game (ExerciseKey "colorMatch")
export const CALMLY_MODULES: Record<ModuleKey, CalmlyModule> = {
  breathing: { key: "breathing", exerciseType: "breathing", href: "/exercises?start=breathing" },
  sound: { key: "sound", exerciseType: "sound", href: "/exercises?start=sound" },
  memory_match: { key: "memory_match", exerciseType: "memory_match", href: "/exercises?start=colorMatch" },
  garden: { key: "garden", exerciseType: "garden", href: "/exercises?start=calmlyGarden" },
  journal: { key: "journal", href: "/journal" },
  quiz: { key: "quiz", href: "/quiz" },
};

export const MODULE_KEYS = Object.keys(CALMLY_MODULES) as ModuleKey[];

export function isModuleKey(value: unknown): value is ModuleKey {
  return typeof value === "string" && value in CALMLY_MODULES;
}

// Display name for a module in the given language ("Breathing" / "سانس کی مشق")
export function moduleLabel(key: ModuleKey, t: TFunction): string {
  return t(`module_${key}`);
}
