// src/components/patient/Exercises.tsx
"use client";

import { useState } from "react";
import type { ElementType } from "react";
import { useRouter } from "next/navigation";
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

const ACCENTS: Record<
  AccentKey,
  { row: string; icon: string; text: string }
> = {
  green: {
    row: "bg-greensoft",
    icon: "bg-green",
    text: "text-green",
  },
  lavender: {
    row: "bg-lavendersoft",
    icon: "bg-lavender",
    text: "text-lavender",
  },
  peach: {
    row: "bg-peachsoft",
    icon: "bg-peach",
    text: "text-peach",
  },
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
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <rect
        width="320"
        height="520"
        fill="rgb(var(--color-greensoft))"
      />

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

      {/* tiny second plant */}
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

interface ExercisesProps {
  initialExercise?: ExerciseKey | null;
}

export default function Exercises({ initialExercise = null }: ExercisesProps) {
  const router = useRouter();

  const [active, setActive] = useState<ExerciseKey | null>(initialExercise);
  const [completed, setCompleted] = useState<Set<ExerciseKey>>(new Set());

  const markDone = (key: ExerciseKey) => {
    setCompleted((prev) => new Set(prev).add(key));
    setActive(null);
  };

  const renderActive = () => {
    if (active === "breathing") {
      return (
        <BreathingExercise
          onBack={() => markDone("breathing")}
        />
      );
    }

    if (active === "colorMatch") {
      return (
        <ColorMatch
          onBack={() => markDone("colorMatch")}
        />
      );
    }

    if (active === "sound") {
      return (
        <SoundTherapy
          onBack={() => markDone("sound")}
        />
      );
    }

    if (active === "calmlyGarden") {
      return (
        <CalmlyGarden
          onBack={() => markDone("calmlyGarden")}
        />
      );
    }

    return null;
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-green p-4 sm:p-6 md:p-8">
      {/* Decorative background */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10" />

      <div className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-white/10" />

      <div className="relative mx-auto w-full max-w-5xl">
        {/* EXERCISES LIST */}
        {active === null && (
          <div className="relative w-full overflow-hidden rounded-[2rem] bg-background shadow-xl ring-1 ring-text/5 md:flex">
            {/* BACK BUTTON */}
            <button
              type="button"
              onClick={() => router.push("/home")}
              className="
                absolute
                right-5
                top-5
                z-20
                rounded
                px-1
                py-1
                font-body
                text-sm
                font-medium
                text-green
                underline
                underline-offset-4
                transition-opacity
                hover:opacity-70
                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-green/30
                sm:right-7
                sm:top-6
                md:right-9
                md:top-7
              "
            >
              Back
            </button>

            {/* LEFT — brand + potted plant panel */}
            <div className="relative hidden min-h-[640px] shrink-0 md:block md:w-[38%]">
              <PottedPlantScene />

              <div className="absolute left-8 top-8 flex items-center gap-2.5">
                <Leaf className="h-5 w-5 text-green" />

                <p className="font-logo text-xl leading-tight text-heading">
                  Calmly
                </p>
              </div>
            </div>

            {/* RIGHT — content panel */}
            <div className="flex min-w-0 flex-1 flex-col bg-background px-6 py-8 sm:px-7 sm:py-9 md:px-10 md:py-12">
              <div className="flex flex-1 flex-col">
                <div className="relative">
                  <h2 className="relative flex items-center gap-2 font-heading text-3xl text-heading md:text-4xl">
                    Exercises

                    <Leaf className="h-5 w-5 shrink-0 text-green" />
                  </h2>

                  <p className="relative mt-2 max-w-sm text-sm opacity-60">
                    Take a moment for yourself. Choose an exercise to relax,
                    focus, and feel better.
                  </p>
                </div>

                <div className="mt-6 flex flex-col gap-3.5">
                  {EXERCISES.map((ex) => {
                    const a = ACCENTS[ex.accent];
                    const Icon = ex.icon;
                    const TitleIcon = ex.titleIcon;
                    const isDone = completed.has(ex.key);

                    return (
                      <div
                        key={ex.key}
                        className={`
                          relative
                          flex
                          min-w-0
                          items-center
                          gap-3
                          overflow-hidden
                          rounded-2xl
                          p-3.5
                          outline-none
                          ring-1
                          ring-black/5
                          transition-all
                          duration-300
                          hover:-translate-y-0.5
                          hover:shadow-md
                          sm:gap-4
                          sm:p-4
                          md:p-5
                          ${a.row}
                        `}
                      >
                        {/* decorative sparkles */}
                        <Sparkles
                          className={`absolute left-3 top-3 h-3 w-3 ${a.text} opacity-40`}
                        />

                        <Sparkles
                          className={`absolute bottom-3 right-24 h-2.5 w-2.5 ${a.text} opacity-30`}
                        />

                        {/* exercise icon */}
                        <div
                          className={`
                            flex
                            h-11
                            w-11
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            shadow-sm
                            sm:h-12
                            sm:w-12
                            md:h-14
                            md:w-14
                            ${a.icon}
                          `}
                        >
                          <Icon className="h-5 w-5 text-background sm:h-6 sm:w-6" />
                        </div>

                        {/* text */}
                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-text sm:text-base md:text-lg">
                            <span className="min-w-0 truncate">
                              {ex.title}
                            </span>

                            <TitleIcon
                              className={`h-4 w-4 shrink-0 ${a.text}`}
                            />

                            {isDone && (
                              <CheckCircle2 className="ml-0.5 h-4 w-4 shrink-0 text-green" />
                            )}
                          </div>

                          <div className="mt-0.5 text-xs opacity-60 sm:text-sm">
                            {ex.description}
                          </div>

                          {ex.meta && (
                            <div className="mt-1 text-[11px] opacity-40">
                              {ex.meta}
                            </div>
                          )}
                        </div>

                        {/* start/restart button */}
                        <button
                          type="button"
                          onClick={() => setActive(ex.key)}
                          className="
                            flex
                            w-28
                            shrink-0
                            items-center
                            justify-center
                            gap-1.5
                            bg-button-shape
                            bg-contain
                            bg-center
                            bg-no-repeat
                            py-2.5
                            font-body
                            text-[11px]
                            font-semibold
                            text-background
                            outline-none
                            sm:w-32
                            sm:text-xs
                            md:w-36
                            md:py-3
                            md:text-sm
                          "
                        >
                          <span className="min-w-0 truncate">
                            {isDone ? "Restart" : ex.cta}
                          </span>

                          <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ACTIVE EXERCISE */}
        {active !== null && (
          <div className="relative w-full overflow-hidden rounded-[2rem] bg-background shadow-xl ring-1 ring-text/5">
            {renderActive()}
          </div>
        )}
      </div>
    </div>
  );
}