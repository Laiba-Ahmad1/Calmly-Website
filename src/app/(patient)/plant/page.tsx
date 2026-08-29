// src/app/(patient)/plant/page.tsx
import { redirect } from "next/navigation";
import Plant from "@/components/shared/Plant";
import { getCurrentUser } from "@/lib/auth";
import db from "@/lib/db";
import PatientProfile from "@/models/PatientProfile";
import { getPlantStageLabel } from "@/lib/plant/growth";

const GROWTH_CARDS = [
  {
    icon: "◉",
    title: "Consistency in the app",
    description:
      "Showing up regularly — check-ins, exercises, small daily visits — keeps your plant growing steadily.",
  },
  {
    icon: "✎",
    title: "Self-awareness in journal",
    description:
      "Writing honestly about how you feel helps your plant grow deeper roots, not just taller leaves.",
  },
  {
    icon: "♡",
    title: "Completing tasks",
    description:
      "Finishing the exercises your therapist assigns gives your plant an extra boost each week.",
  },
];

export default async function PlantPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await db();
  const patientProfile = await PatientProfile.findOne({ userId: user._id });
  if (!patientProfile) redirect("/onboarding");

  const level = patientProfile.plant.level;
  const growth = patientProfile.plant.growth;

  return (
    <div className="relative mx-auto max-w-4xl">
      <div className="overflow-hidden rounded-[2.5rem] bg-background shadow-sm">
        {/* ---------- sky + plant ---------- */}
        <div className="relative h-80 overflow-hidden bg-sky-100 sm:h-96">
          <Plant
            level={level}
            size={280}
            className="absolute bottom-0 left-1/2 z-10 h-72 w-auto -translate-x-1/2"
          />
        </div>

        <div className="flex flex-col items-center gap-1 px-8 py-6 text-center">
          <p className="font-body text-xs font-semibold uppercase tracking-wide text-text/50">
            {getPlantStageLabel(level)}
          </p>
          <p className="font-body text-sm text-text/60">Growth score: {growth}</p>
        </div>

        {/* ---------- what makes your plant grow ---------- */}
        <div className="px-8 pb-12 sm:px-12">
          <h2 className="mb-6 text-center font-heading text-2xl font-bold text-heading">
            What makes your plant grow?
          </h2>

          <div className="grid gap-4 sm:grid-cols-3">
            {GROWTH_CARDS.map((card) => (
              <div
                key={card.title}
                className="flex flex-col gap-3 rounded-2xl border border-green/30 bg-green/10 p-5"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green/20 text-green">
                  {card.icon}
                </div>
                <p className="font-semibold text-text">{card.title}</p>
                <p className="text-sm opacity-60">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}