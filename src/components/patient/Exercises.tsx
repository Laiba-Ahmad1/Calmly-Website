// src/components/patient/Exercises.tsx
"use client";

import { useState } from "react";
import type { ElementType } from "react";
import {
  Leaf,
  Sparkles,
  Music2,
  Puzzle,
  Wind,
  ArrowRight,
  Flower2,
  CheckCircle2,
} from "lucide-react";
import BreathingExercise from "./BreathingExercise";
import ColorMatch from "./ColorMatch";
import SoundTherapy from "./SoundTherapy";
import CalmlyGarden from "./calmly-garden/CalmlyGarden";

type ExerciseKey = "breathing" | "colorMatch" | "sound" | "calmlyGarden";
type AccentKey = "green" | "lavender" | "peach";

const ACCENTS: Record<AccentKey, { row: string; icon: string; text: string }> =
  {
    green: { row: "bg-greensoft", icon: "bg-green", text: "text-green" },
    lavender: {
      row: "bg-lavendersoft",
      icon: "bg-lavender",
      text: "text-lavender",
    },
    peach: { row: "bg-peachsoft", icon: "bg-peach", text: "text-peach" },
  };

const EXERCISES: {
  key: ExerciseKey;
  title: string;
  description: string;
  cta: string;
  accent: AccentKey;
  icon: ElementType;
  titleIcon: ElementType;
  meta?: string;
}[] = [
  {
    key: "breathing",
    title: "Breathing",
    description: "Guided breathing patterns to slow down and reset.",
    cta: "Start Exercise",
    accent: "green",
    icon: Wind,
    titleIcon: Leaf,
  },
  {
    key: "colorMatch",
    title: "Color Match",
    description: "A calming color memory matching game.",
    cta: "Start Game",
    accent: "green",
    icon: Puzzle,
    titleIcon: Sparkles,
  },
  {
    key: "sound",
    title: "Sound Therapy",
    description: "Ambient music and rain soundscapes to relax.",
    cta: "Start Session",
    accent: "green",
    icon: Music2,
    titleIcon: Music2,
  },
  {
    key: "calmlyGarden",
    title: "Calmly Garden",
    description: "Move gently through a peaceful world.",
    cta: "Enter Garden",
    accent: "green",
    icon: Flower2,
    titleIcon: Sparkles,
    meta: "5–10 min • Movement",
  },
];

// Left-panel illustration — shown ONLY on the Exercises list.
function PottedPlantScene() {
  return (
    <svg
      viewBox="0 0 320 520"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      <rect width="320" height="520" fill="rgb(var(--color-greensoft))" />

      {/* wavy cream edge that bleeds into the right panel */}
      <path
        d="M320 0 C 250 60, 300 140, 240 210 C 190 270, 260 330, 300 380 C 330 420, 260 470, 320 520 L320 0 Z"
        fill="rgb(var(--color-background))"
      />

      {/* soft ambient circles */}
      <circle
        cx="245"
        cy="120"
        r="70"
        fill="rgb(var(--color-green))"
        opacity="0.14"
      />

      <circle
        cx="90"
        cy="200"
        r="46"
        fill="rgb(var(--color-lavendersoft))"
        opacity="0.55"
      />

      {/* pot */}
      <path
        d="M120 430 L200 430 L188 480 Q160 490 132 480 Z"
        fill="rgb(var(--color-heading))"
      />

      <ellipse
        cx="160"
        cy="430"
        rx="40"
        ry="9"
        fill="rgb(var(--color-text))"
        opacity="0.85"
      />

      {/* stem */}
      <path
        d="M160 428 C158 360 162 300 160 250"
        stroke="rgb(var(--color-green))"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />

      {/* leaves */}
      <path
        d="M160 340 C120 330 100 290 108 255 C148 258 168 300 160 340Z"
        fill="rgb(var(--color-green))"
      />

      <path
        d="M160 300 C200 288 222 250 214 214 C174 220 152 260 160 300Z"
        fill="rgb(var(--color-greensoft))"
        stroke="rgb(var(--color-green))"
        strokeWidth="2.5"
      />

      <path
        d="M160 260 C124 250 106 214 114 182 C150 188 168 224 160 260Z"
        fill="rgb(var(--color-green))"
      />

      {/* a tiny second plant, low-left, for a little life */}
      <path
        d="M52 470 C50 445 54 425 52 405"
        stroke="rgb(var(--color-green))"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />

      <path
        d="M52 430 C34 424 26 404 30 386 C50 390 58 410 52 430Z"
        fill="rgb(var(--color-green))"
        opacity="0.85"
      />

      <path
        d="M52 415 C70 408 78 390 74 374 C56 378 48 396 52 415Z"
        fill="rgb(var(--color-green))"
        opacity="0.7"
      />

      <ellipse
        cx="52"
        cy="472"
        rx="26"
        ry="7"
        fill="rgb(var(--color-heading))"
        opacity="0.7"
      />

      {/* floating dot accent */}
      <circle
        cx="255"
        cy="230"
        r="2.5"
        fill="rgb(var(--color-background))"
        opacity="0.9"
      />
    </svg>
  );
}

export default function Exercises() {
  const [active, setActive] = useState<ExerciseKey | null>(null);
  const [completed, setCompleted] = useState<Set<ExerciseKey>>(new Set());

  const markDone = (key: ExerciseKey) => {
    setCompleted((prev) => new Set(prev).add(key));
    setActive(null);
  };

  const renderActive = () => {
    if (active === "breathing") {
      return <BreathingExercise onBack={() => markDone("breathing")} />;
    }

    if (active === "colorMatch") {
      return <ColorMatch onBack={() => markDone("colorMatch")} />;
    }

    if (active === "sound") {
      return <SoundTherapy onBack={() => markDone("sound")} />;
    }

    if (active === "calmlyGarden") {
      return <CalmlyGarden onBack={() => markDone("calmlyGarden")} />;
    }

    return null;
  };

  return (
    <div>
     

      <div className="relative mx-auto max-w-5xl">
        {/* EXERCISES LIST */}
        {active === null && (
          <div className="relative w-full rounded-[2rem] overflow-hidden shadow-xl md:flex bg-background ring-1 ring-text/5">
            {/* LEFT — brand + potted plant panel */}
            <div className="hidden md:block relative md:w-[38%] shrink-0 min-h-[640px]">
              <PottedPlantScene />

              <div className="absolute top-8 left-8 flex items-center gap-2.5">
                <Leaf className="w-5 h-5 text-green" />
                <p className="font-logo text-heading text-xl leading-tight">
                  Calmly
                </p>
              </div>
            </div>

            {/* RIGHT — content panel */}
            <div className="flex-1 bg-background px-6 md:px-10 py-8 md:py-12 flex flex-col">
              <div className="flex-1 flex flex-col">
                <div className="relative">
                  <h2 className="font-heading text-heading text-3xl md:text-4xl flex items-center gap-2 relative">
                    Exercises
                    <Leaf className="w-5 h-5 text-green" />
                  </h2>

                  <p className="mt-2 max-w-sm relative text-sm opacity-60">
                    Take a moment for yourself. Choose an exercise to relax,
                    focus, and feel better.
                  </p>
                </div>

                <div className="flex flex-col gap-3.5 mt-6">
                  {EXERCISES.map((ex) => {
                    const a = ACCENTS[ex.accent];
                    const Icon = ex.icon;
                    const TitleIcon = ex.titleIcon;
                    const isDone = completed.has(ex.key);

                    return (
                      <div
                        key={ex.key}
                        className={`relative overflow-hidden rounded-2xl p-4 md:p-5 flex items-center gap-4 ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md outline-none [-webkit-tap-highlight-color:transparent] ${a.row}`}
                      >
                        <Sparkles
                          className={`absolute top-3 left-3 w-3 h-3 ${a.text} opacity-40`}
                        />

                        <Sparkles
                          className={`absolute bottom-3 right-24 w-2.5 h-2.5 ${a.text} opacity-30`}
                        />

                        <div
                          className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shrink-0 shadow-sm ${a.icon}`}
                        >
                          <Icon className="w-6 h-6 text-background" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-text text-base md:text-lg flex items-center gap-1.5">
                            {ex.title}

                            <TitleIcon className={`w-4 h-4 ${a.text}`} />

                            {isDone && (
                              <CheckCircle2 className="w-4 h-4 text-green ml-0.5" />
                            )}
                          </div>

                          <div className="text-sm opacity-60 mt-0.5">
                            {ex.description}
                          </div>

                          {ex.meta && (
                            <div className="text-[11px] opacity-40 mt-1">
                              {ex.meta}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => setActive(ex.key)}
                          className="shrink-0 flex items-center justify-center gap-1.5 bg-button-shape bg-contain bg-no-repeat bg-center font-body font-semibold text-background text-xs md:text-sm w-36 py-3 outline-none [-webkit-tap-highlight-color:transparent]"
                        >
                          {isDone ? "Restart" : ex.cta}

                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ACTIVE EXERCISE — NO PLANT PANEL */}
        {active !== null && (
          <div className="relative w-full rounded-[2rem] overflow-hidden shadow-xl bg-background ring-1 ring-text/5">
            {renderActive()}
          </div>
        )}
      </div>
    </div>
  );
}
