// src/components/patient/GuideToCalmly.tsx
"use client";

import { useState } from "react";
import type { ElementType } from "react";
import {
  Leaf,
  Compass,
  LayoutDashboard,
  NotebookPen,
  ClipboardList,
  Wind,
  Sprout,
  UserRound,
  Bell,
  ChevronDown,
} from "lucide-react";

type AccentKey = "green" | "lavender" | "peach";

const ACCENTS: Record<AccentKey, { row: string; icon: string; text: string; ring: string }> = {
  green: { row: "bg-greensoft", icon: "bg-green", text: "text-green", ring: "ring-green/15" },
  lavender: { row: "bg-lavendersoft", icon: "bg-lavender", text: "text-lavender", ring: "ring-lavender/15" },
  peach: { row: "bg-peachsoft", icon: "bg-peach", text: "text-peach", ring: "ring-peach/15" },
};

type Section = {
  key: string;
  title: string;
  icon: ElementType;
  accent: AccentKey;
  points: string[];
};

const SECTIONS: Section[] = [
  {
    key: "dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
    accent: "green",
    points: [
      "Your home base after login.",
      "Jump to Journal, Quiz, Exercises, Plant, Therapist, or Notifications.",
      "Not sure where to go? Start here.",
    ],
  },
  {
    key: "journal",
    title: "Journal",
    icon: NotebookPen,
    accent: "lavender",
    points: [
      "Log your mood, sleep, and feelings each day.",
      "Reflection is where you write specifically about your anxiety — not just general feelings or thoughts.",
      "Therapist-assigned tasks show up here too.",
      "Private — you can lock it with an extra password.",
    ],
  },
  {
    key: "quiz",
    title: "Weekly Quiz",
    icon: ClipboardList,
    accent: "peach",
    points: [
      "One short check-in a week, adjusts to your past answers.",
      "Your therapist may customize it — otherwise you get Calmly's version.",
      "No right or wrong answers.",
    ],
  },
  {
    key: "exercises",
    title: "Exercises",
    icon: Wind,
    accent: "green",
    points: [
      "🌬️ Breathing — slow, guided breaths.",
      "🔊 Sound Therapy — calming audio.",
      "🧠 Memory Matcher — light focus game.",
      "🌿 Calmly Garden — relaxing interactive space.",
    ],
  },
  {
    key: "plant",
    title: "Your Plant",
    icon: Sprout,
    accent: "lavender",
    points: [
      "Grows as you journal, quiz, and do exercises.",
      "Not a score — just a gentle nudge for consistency.",
    ],
  },
  {
    key: "therapist",
    title: "Therapist",
    icon: UserRound,
    accent: "peach",
    points: [
      "Search verified therapists, send a connection request.",
      "They can send advice, assign tasks, and share weekly feedback.",
      "They only see summaries — never your raw entries.",
    ],
  },
  {
    key: "other",
    title: "Notifications & Language",
    icon: Bell,
    accent: "green",
    points: [
      "Notified for new quizzes, journal reminders, advice, and feedback.",
      "Switch English ⇄ اردو anytime in Settings — your own writing is never translated.",
    ],
  },
];

const NAV: { want: string; go: string }[] = [
  { want: "Write how you're feeling", go: "Journal" },
  { want: "Take this week's quiz", go: "Weekly Quiz" },
  { want: "Calm down right now", go: "Exercises" },
  { want: "See your progress", go: "Plant" },
  { want: "Talk to a therapist", go: "Therapist" },
  { want: "Change language", go: "Settings" },
];

// A literal little trail map — parchment texture, contour rings, compass
// rose, and a dashed path linking numbered waypoints down the page.
function GuideMapBackground({ count }: { count: number }) {
  const pathD =
    "M60 20 C 20 90, 90 130, 50 200 S 100 320, 55 400 S 95 520, 60 620 S 90 740, 55 840 S 90 950, 60 1040";

  // evenly space waypoint dots along the visual length of the trail
  const stops = Array.from({ length: count }, (_, i) => 20 + (i * 1000) / (count - 1 || 1));

  return (
    <svg
      viewBox="0 0 120 1080"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      {/* parchment base */}
      <rect width="120" height="1080" fill="rgb(var(--color-background))" />

      {/* fine dot grid, like graph/survey paper */}
      <pattern id="mapDots" width="6" height="6" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="0.4" fill="rgb(var(--color-text))" opacity="0.08" />
      </pattern>
      <rect width="120" height="1080" fill="url(#mapDots)" />

      {/* topographic contour rings */}
      <circle cx="15" cy="60" r="22" fill="none" stroke="rgb(var(--color-green))" strokeWidth="0.6" opacity="0.18" />
      <circle cx="15" cy="60" r="34" fill="none" stroke="rgb(var(--color-green))" strokeWidth="0.6" opacity="0.12" />
      <circle cx="108" cy="300" r="20" fill="none" stroke="rgb(var(--color-lavender))" strokeWidth="0.6" opacity="0.18" />
      <circle cx="108" cy="300" r="32" fill="none" stroke="rgb(var(--color-lavender))" strokeWidth="0.6" opacity="0.12" />
      <circle cx="10" cy="620" r="24" fill="none" stroke="rgb(var(--color-peach))" strokeWidth="0.6" opacity="0.16" />
      <circle cx="10" cy="620" r="36" fill="none" stroke="rgb(var(--color-peach))" strokeWidth="0.6" opacity="0.1" />
      <circle cx="105" cy="900" r="22" fill="none" stroke="rgb(var(--color-green))" strokeWidth="0.6" opacity="0.16" />

      {/* the trail */}
      <path
        d={pathD}
        fill="none"
        stroke="rgb(var(--color-green))"
        strokeWidth="1.4"
        strokeDasharray="0.5 5"
        strokeLinecap="round"
        opacity="0.55"
      />

      {/* waypoint pins along the trail */}
      {stops.map((y, i) => (
        <g key={i} transform={`translate(${58 + (i % 2 === 0 ? -6 : 6)}, ${y})`}>
          <circle r="3.2" fill="rgb(var(--color-green))" opacity="0.7" />
          <circle r="1.2" fill="rgb(var(--color-background))" />
        </g>
      ))}

      {/* small compass rose, top right */}
      <g transform="translate(100, 30)" opacity="0.35">
        <circle r="12" fill="none" stroke="rgb(var(--color-heading))" strokeWidth="0.6" />
        <path d="M0 -12 L2.4 0 L0 12 L-2.4 0 Z" fill="rgb(var(--color-heading))" opacity="0.5" />
        <path d="M-12 0 L0 -2.4 L12 0 L0 2.4 Z" fill="rgb(var(--color-heading))" opacity="0.3" />
      </g>

      {/* little leaf/foliage marks, like a map legend */}
      <path d="M20 950 C 15 940, 5 940, 3 955 C 14 958, 22 956, 20 950Z" fill="rgb(var(--color-green))" opacity="0.25" />
      <path d="M100 500 C 95 490, 85 490, 83 505 C 94 508, 102 506, 100 500Z" fill="rgb(var(--color-lavender))" opacity="0.25" />
    </svg>
  );
}

export default function GuideToCalmly() {
  const [open, setOpen] = useState<string | null>("dashboard");

  return (
    <div className="relative mx-auto max-w-4xl">
      <div className="relative w-full rounded-[2rem] overflow-hidden shadow-xl bg-background ring-1 ring-text/5">
        <GuideMapBackground count={SECTIONS.length} />

        <div className="relative z-10 px-6 sm:px-10 py-8 sm:py-10">
          {/* header */}
          <div className="flex items-center gap-2 mb-1.5">
            <Compass className="w-4 h-4 text-green" />
            <span className="text-xs uppercase tracking-wide text-green font-semibold">
              Guide
            </span>
          </div>
          <h1 className="font-heading text-heading text-2xl sm:text-3xl flex items-center gap-2">
            Guide to Calmly
            <Leaf className="w-5 h-5 text-green" />
          </h1>
          <p className="text-sm text-text opacity-70 mt-2 max-w-md leading-relaxed">
            A daily wellness space — journal, quiz, exercises, and a therapist
            if you want one. Not a crisis tool — reach out to someone if
            you're in serious distress.
          </p>

          {/* accordion */}
          <div className="flex flex-col gap-3 mt-6">
            {SECTIONS.map((s, idx) => {
              const a = ACCENTS[s.accent];
              const Icon = s.icon;
              const isOpen = open === s.key;

              return (
                <div
                  key={s.key}
                  className={`rounded-2xl overflow-hidden ring-1 ${a.ring} shadow-sm transition-all duration-300 ${a.row}`}
                >
                  <button
                    onClick={() => setOpen(isOpen ? null : s.key)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left outline-none [-webkit-tap-highlight-color:transparent]"
                  >
                    <div className={`relative w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${a.icon}`}>
                      <Icon className="w-4 h-4 text-background" />
                      <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-background text-[9px] font-bold text-heading flex items-center justify-center ring-1 ring-black/5">
                        {idx + 1}
                      </span>
                    </div>
                    <span className="flex-1 text-sm font-semibold text-text">
                      {s.title}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 ${a.text} transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isOpen && (
                    <ul className="px-4 pb-3.5 pl-[3.4rem] space-y-1.5">
                      {s.points.map((p, i) => (
                        <li
                          key={i}
                          className="text-xs leading-snug text-text opacity-80 list-disc marker:opacity-40"
                        >
                          {p}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>

          {/* quick nav */}
          <div className="mt-6 rounded-2xl bg-canvas ring-1 ring-text/10 px-4 py-4">
            <div className="flex items-center gap-1.5 mb-3">
              <Compass className="w-3.5 h-3.5 text-green" />
              <span className="text-xs font-semibold text-heading uppercase tracking-wide">
                Find your way
              </span>
            </div>
            <div className="space-y-2">
              {NAV.map((n, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs text-text opacity-80"
                >
                  <span>{n.want}</span>
                  <span className={`font-medium ${i % 2 === 0 ? "text-green" : "text-lavender"}`}>
                    → {n.go}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-text opacity-50 text-center mt-6">
            Small steps, every day — that's all Calmly asks of you.
          </p>
        </div>
      </div>
    </div>
  );
}   