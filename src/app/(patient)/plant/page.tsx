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
      "Showing up regularly — check-ins, exercises, daily journals, small daily visits — keeps your plant growing steadily.",
  },
  {
    icon: "✎",
    title: "Self-awareness in journal",
    description:
      "Writing honestly about how you feel, recognizing patterns in your anxiety , self awareness — helps your plant grow deeper roots, not just taller leaves.",
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
      <style>{`
        @keyframes drift-cloud {
          0%   { transform: translateX(0); }
          50%  { transform: translateX(18px); }
          100% { transform: translateX(0); }
        }
        @keyframes drift-cloud-slow {
          0%   { transform: translateX(0); }
          50%  { transform: translateX(-14px); }
          100% { transform: translateX(0); }
        }
        @keyframes sway-plant {
          0%   { transform: translateX(-50%) rotate(0deg); }
          50%  { transform: translateX(-50%) rotate(1.2deg); }
          100% { transform: translateX(-50%) rotate(0deg); }
        }
        @keyframes bob-leaf {
          0%   { transform: translateY(0) rotate(-6deg); }
          50%  { transform: translateY(-6px) rotate(2deg); }
          100% { transform: translateY(0) rotate(-6deg); }
        }
      `}</style>

      <div className="overflow-hidden rounded-[2.5rem] bg-background shadow-sm">
        {/* ---------- sky ---------- */}
        <div className="relative h-80 overflow-hidden bg-gradient-to-b from-bluesoft via-bluesoft to-background sm:h-96">
          {/* soft sun glow, upper corner */}
          <div className="absolute -top-10 right-6 h-40 w-40 rounded-full bg-white/40 blur-2xl sm:h-52 sm:w-52" />

          {/* clouds — layered, varying opacity/size, gentle drift */}
          <div
            className="absolute left-[8%] top-10 h-8 w-20 rounded-full bg-background/70 blur-[1px] motion-safe:[animation:drift-cloud_9s_ease-in-out_infinite]"
            aria-hidden
          />
          <div
            className="absolute left-[6%] top-14 h-6 w-14 rounded-full bg-background/50 motion-safe:[animation:drift-cloud_9s_ease-in-out_infinite]"
            aria-hidden
          />
          <div
            className="absolute right-[18%] top-6 h-6 w-16 rounded-full bg-background/40 blur-[1px] motion-safe:[animation:drift-cloud-slow_13s_ease-in-out_infinite]"
            aria-hidden
          />
          <div
            className="absolute left-[38%] top-24 h-5 w-12 rounded-full bg-background/30 motion-safe:[animation:drift-cloud-slow_16s_ease-in-out_infinite]"
            aria-hidden
          />
          <div
            className="absolute right-[8%] top-32 h-7 w-16 rounded-full bg-background/55 blur-[1px] motion-safe:[animation:drift-cloud_11s_ease-in-out_infinite]"
            aria-hidden
          />

          {/* a small, dim counterweight on the left — balances the plant
              art's own butterfly, which sits baked into the top-right of
              the source image */}
          <div
            className="absolute left-[16%] top-16 text-lg opacity-30 motion-safe:[animation:bob-leaf_6s_ease-in-out_infinite]"
            aria-hidden
          >
            🍃
          </div>

          {/* ground — soft rounded hill instead of a hard rectangle cut,
              so the sky blends into the card rather than slicing across it */}
          <svg
            className="absolute bottom-0 left-0 w-full"
            viewBox="0 0 400 40"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              d="M0 40 L0 22 Q100 4 200 16 Q300 28 400 10 L400 40 Z"
              fill="rgb(var(--color-background))"
            />
          </svg>

          {/* plant — nudged slightly right of true-center to counterbalance
              the butterfly's visual weight in the top-right of the artwork */}
          <div
            className="absolute bottom-2 left-[54%] z-10 motion-safe:[animation:sway-plant_5s_ease-in-out_infinite]"
            style={{ transformOrigin: "bottom center" }}
          >
            <Plant level={level} size={280} className="h-64 w-auto sm:h-72" />
          </div>
        </div>

        {/* ---------- stage + growth ---------- */}
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
                className="flex flex-col gap-3 rounded-2xl border border-green/20 bg-green/10 p-5 transition hover:-translate-y-0.5 hover:bg-green/15 hover:shadow-sm"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green/20 text-lg text-green">
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