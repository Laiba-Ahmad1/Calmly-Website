// src/components/patient/BreathingExercise.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Leaf, Sparkles } from "lucide-react";

type Phase =
  | "idle"
  | "inhale"
  | "holdAfterInhale"
  | "exhale"
  | "holdAfterExhale";

// [inhale, holdAfterInhale, exhale, holdAfterExhale] in seconds
const PATTERNS: {
  label: string;
  seq: [number, number, number, number];
}[] = [
  { label: "Box Breathing", seq: [4, 4, 4, 4] },
  { label: "4-7-8", seq: [4, 7, 8, 0] },
  { label: "Simple 5-5", seq: [5, 0, 5, 0] },
];

const phaseLabel = (p: Phase) =>
  p === "inhale"
    ? "Breathe in"
    : p === "exhale"
      ? "Breathe out"
      : p === "idle"
        ? "Ready"
        : "Hold";

const PHASE_TONE: Record<
  Phase,
  { core: string; halo: string; ring: string; soft: string }
> = {
  idle: {
    core: "bg-green",
    halo: "bg-greensoft",
    ring: "text-green",
    soft: "bg-greensoft/60",
  },
  inhale: {
    core: "bg-green",
    halo: "bg-greensoft",
    ring: "text-green",
    soft: "bg-greensoft/60",
  },
  holdAfterInhale: {
    core: "bg-lavender",
    halo: "bg-lavendersoft",
    ring: "text-lavender",
    soft: "bg-lavendersoft/60",
  },
  exhale: {
    core: "bg-peach",
    halo: "bg-peachsoft",
    ring: "text-peach",
    soft: "bg-peachsoft/60",
  },
  holdAfterExhale: {
    core: "bg-lavender",
    halo: "bg-lavendersoft",
    ring: "text-lavender",
    soft: "bg-lavendersoft/60",
  },
};

const PATTERN_DOT = [
  "bg-green",
  "bg-lavender",
  "bg-peach",
];

const RING_R = 100;
const RING_C = 2 * Math.PI * RING_R;

const MIN_CYCLES = 1;
const MAX_CYCLES = 12;

// ---- tiny inline icons for the phase step cards ----

function IconInhale({ className = "" }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M3 15c2 0 2-6 4.5-6S9.5 15 12 15s2.5-6 4.5-6 2.5 6 4.5 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconExhale({ className = "" }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M3 9.5h13.5a3 3 0 1 0-2.4-4.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 14.5h10a2.5 2.5 0 1 1-2 4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconHold({ className = "" }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <rect
        x="7"
        y="5"
        width="3.2"
        height="14"
        rx="1.4"
        fill="currentColor"
      />
      <rect
        x="13.8"
        y="5"
        width="3.2"
        height="14"
        rx="1.4"
        fill="currentColor"
      />
    </svg>
  );
}

const PHASE_STEPS: {
  key: Exclude<Phase, "idle">;
  label: string;
  icon: (props: { className?: string }) => JSX.Element;
}[] = [
  { key: "inhale", label: "Inhale", icon: IconInhale },
  { key: "holdAfterInhale", label: "Hold", icon: IconHold },
  { key: "exhale", label: "Exhale", icon: IconExhale },
  { key: "holdAfterExhale", label: "Hold", icon: IconHold },
];

export default function BreathingExercise({
  onBack,
}: {
  onBack?: () => void;
}) {
  const [patternIndex, setPatternIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [phaseSeconds, setPhaseSeconds] = useState(0);
  const [phaseElapsedMs, setPhaseElapsedMs] = useState(0);
  const [sessionMs, setSessionMs] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [targetCycles, setTargetCycles] = useState(6);
  const [running, setRunning] = useState(false);
  const [scale, setScale] = useState(1);
  const [pickerOpen, setPickerOpen] = useState(false);

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pickerRef = useRef<HTMLDivElement | null>(null);

  const pattern = PATTERNS[patternIndex].seq;

  const clearTick = () => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  };

  const startPhase = (p: Phase) => {
    setPhase(p);
    setPhaseElapsedMs(0);

    const [inhale, hold1, exhale, hold2] = pattern;

    if (p === "inhale") {
      setPhaseSeconds(inhale);
      setScale(1.4);
    } else if (p === "exhale") {
      setPhaseSeconds(exhale);
      setScale(1);
    } else if (p === "holdAfterInhale") {
      setPhaseSeconds(hold1);
    } else if (p === "holdAfterExhale") {
      setPhaseSeconds(hold2);
    }
  };

  const nextPhase = () => {
    const [, hold1, , hold2] = pattern;
    const isSimple = hold1 === 0 && hold2 === 0;

    setPhase((current) => {
      if (current === "inhale") {
        startPhase(
          hold1 > 0
            ? "holdAfterInhale"
            : "exhale"
        );
      } else if (current === "holdAfterInhale") {
        startPhase("exhale");
      } else if (current === "exhale") {
        if (isSimple || hold2 === 0) {
          setCycleCount((c) => c + 1);
        }

        startPhase(
          hold2 > 0
            ? "holdAfterExhale"
            : "inhale"
        );
      } else if (current === "holdAfterExhale") {
        setCycleCount((c) => c + 1);
        startPhase("inhale");
      }

      return current;
    });
  };

  useEffect(() => {
    if (!running) return;

    clearTick();

    tickRef.current = setInterval(() => {
      setSessionMs((s) => s + 100);

      setPhaseElapsedMs((prevElapsed) => {
        const next = prevElapsed + 100;

        if (next >= phaseSeconds * 1000) {
          nextPhase();
          return 0;
        }

        return next;
      });
    }, 100);

    return clearTick;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phaseSeconds, phase]);

  // auto-stop once the session hits the target cycle count
  useEffect(() => {
    if (running && cycleCount > 0 && cycleCount >= targetCycles) {
      setRunning(false);
      clearTick();
      setPhase("idle");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycleCount, targetCycles]);

  const handleStart = () => {
    setSessionMs(0);
    setCycleCount(0);
    setRunning(true);
    startPhase("inhale");
  };

  const handleStop = () => {
    setRunning(false);
    clearTick();
    setPhase("idle");
  };

  const handlePatternChange = (idx: number) => {
    handleStop();
    setPatternIndex(idx);
    setPhaseElapsedMs(0);
    setScale(1);
    setPickerOpen(false);
  };

  const adjustTargetCycles = (delta: number) => {
    if (running) return;
    setTargetCycles((c) =>
      Math.min(MAX_CYCLES, Math.max(MIN_CYCLES, c + delta))
    );
  };

  useEffect(() => {
    if (!pickerOpen) return;

    const handleClick = (e: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(
          e.target as Node
        )
      ) {
        setPickerOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClick
      );
    };
  }, [pickerOpen]);

  const pct =
    phaseSeconds === 0
      ? 100
      : Math.min(
          100,
          (phaseElapsedMs /
            (phaseSeconds * 1000)) *
            100
        );

  const tone = PHASE_TONE[phase];

  const remaining = running
    ? Math.max(
        0,
        Math.ceil(
          (phaseSeconds * 1000 -
            phaseElapsedMs) /
            1000
        )
      )
    : null;

  const ringOffset =
    RING_C * (1 - pct / 100);

  const activeSteps = PHASE_STEPS.filter(
    (step) => pattern[PHASE_STEPS.findIndex((s) => s.key === step.key)] > 0
  );

  return (
    // Single container — this fills the one bg-background card that
    // Exercises.tsx already renders around active exercises. No nested
    // panels, no duplicate backgrounds. Padding is symmetric top/bottom
    // (py-7 sm:py-8 applies equally to both).
    <div className="relative w-full flex flex-col items-center gap-4 sm:gap-5 px-6 py-7 sm:px-10 sm:py-8">

      {/* theme-consistent decorative accents — all absolute, add zero height */}
      <div className="pointer-events-none absolute -top-12 -left-12 w-40 h-40 rounded-full bg-greensoft/50 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-16 -right-12 w-48 h-48 rounded-full bg-peachsoft/40 blur-2xl" />
      <div className="pointer-events-none absolute top-1/3 -right-8 w-28 h-28 rounded-full bg-lavendersoft/40 blur-2xl" />
      <Sparkles className="pointer-events-none absolute top-5 right-6 w-4 h-4 text-green/40" />
      <Sparkles className="pointer-events-none absolute bottom-6 left-6 w-3 h-3 text-lavender/40" />

      {/* HEADER — font-heading now matches the "Exercises" title */}
      <div className="relative flex items-start justify-between w-full max-w-md">
        <div>
          <h2 className="font-heading text-heading text-3xl md:text-4xl flex items-center gap-2">
            Breathing
            <Leaf className="w-5 h-5 text-green" />
          </h2>

          <p className="font-body text-text/55 text-sm mt-1">
            Follow the shape, find your rhythm.
          </p>
        </div>

        {onBack && (
          <button
            onClick={onBack}
            className="font-body text-sm text-heading underline underline-offset-4 shrink-0 mt-1"
          >
            Back
          </button>
        )}
      </div>

      {/* PATTERN PICKER */}
      <div
        className="relative w-full max-w-md flex justify-center"
        ref={pickerRef}
      >
        <button
          type="button"
          onClick={() =>
            setPickerOpen((v) => !v)
          }
          aria-haspopup="listbox"
          aria-expanded={pickerOpen}
          className="flex items-center gap-2.5 font-body text-sm text-text bg-white/70 rounded-full pl-2 pr-4 py-2 outline-none border border-green/30 shadow-sm hover:bg-white/90 transition-colors"
        >
          <span
            className={`w-2.5 h-2.5 rounded-full ${PATTERN_DOT[patternIndex]}`}
          />

          <span className="font-semibold text-heading">
            {PATTERNS[patternIndex].label}
          </span>

          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            className={`text-heading/60 transition-transform duration-200 ${
              pickerOpen
                ? "rotate-180"
                : ""
            }`}
          >
            <path
              d="M2.5 4.5L6 8L9.5 4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {pickerOpen && (
          <ul
            role="listbox"
            className="absolute top-full mt-2 w-64 bg-white rounded-2xl shadow-lg border border-green/15 overflow-hidden z-10 picker-pop"
          >
            {PATTERNS.map((p, i) => {
              const [
                inhale,
                hold1,
                exhale,
                hold2,
              ] = p.seq;

              const rhythm = [
                inhale,
                hold1,
                exhale,
                hold2,
              ]
                .filter((n) => n > 0)
                .join(" · ");

              const selected =
                i === patternIndex;

              return (
                <li
                  key={p.label}
                  role="option"
                  aria-selected={selected}
                >
                  <button
                    type="button"
                    onClick={() =>
                      handlePatternChange(i)
                    }
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      selected
                        ? "bg-greensoft/60"
                        : "hover:bg-greensoft/25"
                    }`}
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${PATTERN_DOT[i]}`}
                    />

                    <span className="flex-1">
                      <span className="block font-body font-semibold text-heading text-sm">
                        {p.label}
                      </span>

                      <span className="block font-body text-xs text-text/60">
                        {rhythm}s rhythm
                      </span>
                    </span>

                    {selected && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        className="text-heading shrink-0"
                      >
                        <path
                          d="M3 7.5L5.5 10L11 4"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* BREATHING ORB — slightly smaller so everything fits without a scrollbar */}
      <div className="relative w-52 h-52 sm:w-56 sm:h-56 md:w-60 md:h-60 flex items-center justify-center">

        <div className="absolute -top-3 -left-5 w-24 h-24 rounded-full bg-greensoft/50 blur-md" />

        <div className="absolute -bottom-2 -right-6 w-28 h-28 rounded-full bg-peachsoft/40 blur-md" />

        <div className="absolute top-1/2 -right-3 w-16 h-16 rounded-full bg-lavendersoft/40 blur-md" />

        <svg
          viewBox="0 0 220 220"
          className="absolute inset-0 w-full h-full -rotate-90"
        >
          <circle
            cx="110"
            cy="110"
            r={RING_R}
            fill="none"
            stroke="white"
            strokeOpacity="0.55"
            strokeWidth="8"
          />

          <circle
            cx="110"
            cy="110"
            r={RING_R}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={RING_C}
            strokeDashoffset={ringOffset}
            className={`transition-[stroke-dashoffset,color] duration-150 linear ${tone.ring}`}
          />
        </svg>

        <div
          className={`absolute blob-shape blob-drift transition-colors duration-700 ${tone.halo}`}
          style={{
            width: `${(scale + 0.2) * 88}px`,
            height: `${(scale + 0.2) * 88}px`,
            transitionProperty:
              "width, height, background-color",
            transitionDuration:
              `${phaseSeconds}s, ${phaseSeconds}s, 700ms`,
            transitionTimingFunction:
              "ease-in-out",
          }}
        />

        <div
          className={`absolute blob-shape flex flex-col items-center justify-center gap-0.5 shadow-lg transition-colors duration-700 ${tone.core}`}
          style={{
            width: `${scale * 88}px`,
            height: `${scale * 88}px`,
            transitionProperty:
              "width, height, background-color",
            transitionDuration:
              `${phaseSeconds}s, ${phaseSeconds}s, 700ms`,
            transitionTimingFunction:
              "ease-in-out",
          }}
        >
          <span className="font-body font-semibold text-background text-lg tracking-wide">
            {phaseLabel(phase)}
          </span>

          {remaining !== null && (
            <span className="font-body text-background/80 text-xs">
              {remaining}s
            </span>
          )}
        </div>
      </div>

      {/* CYCLE TARGET + SESSION STATS */}
      <div className="flex flex-wrap items-center justify-center gap-3.5">
        <div className="flex flex-col items-center gap-1 rounded-2xl bg-white/70 border border-white/80 px-5 py-2 shadow-sm">
          <span className="font-body text-xs text-text/70">
            Cycles
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => adjustTargetCycles(-1)}
              disabled={running || targetCycles <= MIN_CYCLES}
              aria-label="Fewer cycles"
              className="w-6 h-6 rounded-full bg-greensoft/70 text-heading font-semibold flex items-center justify-center leading-none disabled:opacity-30 hover:bg-greensoft transition-colors"
            >
              −
            </button>

            <span className="font-body font-bold text-heading text-xl tabular-nums min-w-[2.5ch] text-center">
              {running ? `${cycleCount}/${targetCycles}` : targetCycles}
            </span>

            <button
              type="button"
              onClick={() => adjustTargetCycles(1)}
              disabled={running || targetCycles >= MAX_CYCLES}
              aria-label="More cycles"
              className="w-6 h-6 rounded-full bg-greensoft/70 text-heading font-semibold flex items-center justify-center leading-none disabled:opacity-30 hover:bg-greensoft transition-colors"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 rounded-2xl bg-white/70 border border-white/80 px-7 py-2 shadow-sm">
          <span className="font-body text-xs text-text/70">
            Session
          </span>

          <span className="font-body font-bold text-heading text-xl tabular-nums">
            {Math.floor(
              sessionMs / 1000
            )}
            s
          </span>
        </div>
      </div>

      {/* CONTROLS — Stop now shares the exact same pill style as Start */}
      <div className="flex gap-4">
        <button
          onClick={handleStart}
          disabled={running}
          className="bg-button-shape bg-contain bg-no-repeat bg-center font-body font-semibold text-background w-36 py-3 disabled:opacity-50"
        >
          Start
        </button>

        <button
          onClick={handleStop}
          disabled={!running}
          className="bg-button-shape bg-contain bg-no-repeat bg-center font-body font-semibold text-background w-36 py-3 disabled:opacity-50"
        >
          Stop
        </button>
      </div>

      {/* PROCESS / PHASE STEP CARDS */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3">
        {activeSteps.map((step) => {
          const isActive = running && phase === step.key;
          const stepTone = PHASE_TONE[step.key];
          const Icon = step.icon;
          const seconds =
            pattern[PHASE_STEPS.findIndex((s) => s.key === step.key)];

          return (
            <div
              key={step.key}
              className={`flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-3 transition-all duration-300 ${
                isActive
                  ? `${stepTone.soft} border-white/80 shadow-md scale-[1.03]`
                  : "bg-white/55 border-white/60"
              }`}
            >
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isActive
                    ? `${stepTone.core} text-background`
                    : "bg-white/80 text-heading/60"
                }`}
              >
                <Icon />
              </span>

              <span className="font-body text-sm font-semibold text-heading">
                {step.label}
              </span>

              <span className="font-body text-xs text-text/60">
                {seconds} sec
              </span>
            </div>
          );
        })}
      </div>

      <style>{`
        .blob-shape {
          border-radius: 42% 58% 65% 35% / 45% 40% 60% 55%;
        }

        .blob-drift {
          animation: blob-morph 9s ease-in-out infinite;
        }

        @keyframes blob-morph {
          0% {
            border-radius: 42% 58% 65% 35% / 45% 40% 60% 55%;
          }

          33% {
            border-radius: 60% 40% 45% 55% / 55% 60% 40% 45%;
          }

          66% {
            border-radius: 48% 52% 38% 62% / 40% 55% 45% 60%;
          }

          100% {
            border-radius: 42% 58% 65% 35% / 45% 40% 60% 55%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .blob-drift {
            animation: none;
          }
        }

        .picker-pop {
          animation: picker-pop 140ms ease-out;
          transform-origin: top center;
        }

        @keyframes picker-pop {
          0% {
            opacity: 0;
            transform: scaleY(0.9) translateY(-4px);
          }

          100% {
            opacity: 1;
            transform: scaleY(1) translateY(0);
          }
        }
      `}</style>

    </div>
  );
}