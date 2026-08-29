// src/components/patient/SoundTherapy.tsx
"use client";

import { useRef, useState } from "react";
import { Leaf, CloudRain } from "lucide-react";
import type { ElementType } from "react";

type SoundKey = "nature" | "rain";

const SOUNDS: {
  key: SoundKey;
  label: string;
  tagline: string;
  src: string;
  icon: ElementType;
  iconBg: string;
  iconText: string;
  playBg: string;
  barBg: string;
}[] = [
  {
    key: "nature",
    label: "Nature",
    tagline: "Birdsong & breeze",
    src: "/sounds/nature.mp3",
    icon: Leaf,
    iconBg: "bg-greensoft",
    iconText: "text-green",
    playBg: "bg-green",
    barBg: "bg-green",
  },
  {
    key: "rain",
    label: "Rain",
    tagline: "Steady, soft rainfall",
    src: "/sounds/rain.mp3",
    icon: CloudRain,
    iconBg: "bg-lavendersoft",
    iconText: "text-lavender",
    playBg: "bg-lavender",
    barBg: "bg-lavender",
  },
];

const BAR_HEIGHTS = [40, 70, 100, 65, 45];

export default function SoundTherapy({ onBack }: { onBack?: () => void }) {
  const audioRefs = useRef<Record<SoundKey, HTMLAudioElement | null>>({
    nature: null,
    rain: null,
  });
  const [playing, setPlaying] = useState<Record<SoundKey, boolean>>({
    nature: false,
    rain: false,
  });

  const play = (key: SoundKey) => {
    const audio = audioRefs.current[key];
    if (!audio) return;
    audio.currentTime = 0;
    audio.play();
    setPlaying((p) => ({ ...p, [key]: true }));
  };

  const stop = (key: SoundKey) => {
    const audio = audioRefs.current[key];
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setPlaying((p) => ({ ...p, [key]: false }));
  };

  return (
    <div className="flex flex-col items-center gap-7 bg-background rounded-3xl p-6 md:p-10">
      <div className="flex items-start justify-between w-full max-w-md">
        <div>
          <h2 className="font-logo text-heading text-3xl md:text-4xl">Sound Therapy</h2>
          <p className="font-body text-text/55 text-sm mt-1">Ambient soundscapes to settle into.</p>
        </div>
        {onBack && (
          <button onClick={onBack} className="font-body text-sm text-heading underline underline-offset-4 shrink-0 mt-1">
            Back
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {SOUNDS.map(({ key, label, tagline, src, icon: Icon, iconBg, iconText, playBg, barBg }) => {
          const isPlaying = playing[key];
          return (
            <div
              key={key}
              className={`relative flex flex-col items-center gap-3 rounded-2xl px-4 py-6 border transition-all ${
                isPlaying ? "border-green/25 bg-white/85 shadow-md" : "border-text/10 bg-white/60"
              }`}
            >
              <audio
                ref={(el) => {
                  audioRefs.current[key] = el;
                }}
                src={src}
                loop
              />
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBg}`}>
                <Icon className={`w-5 h-5 ${iconText}`} />
              </div>

              <div className="text-center">
                <span className="font-body font-semibold text-heading block">{label}</span>
                <span className="font-body text-text/50 text-xs block mt-0.5">{tagline}</span>
              </div>

              <div className="flex items-end gap-1 h-8">
                {BAR_HEIGHTS.map((h, i) => (
                  <span
                    key={i}
                    className={`w-1 rounded-full ${barBg} ${isPlaying ? "wave-bar" : "opacity-25"}`}
                    style={{
                      height: isPlaying ? undefined : `${h * 0.25}%`,
                      animationDelay: `${i * 0.12}s`,
                      ["--bar-h" as string]: `${h}%`,
                    }}
                  />
                ))}
              </div>

              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => play(key)}
                  disabled={isPlaying}
                  className={`font-body text-xs text-background rounded-full px-3.5 py-1.5 disabled:opacity-40 transition-opacity outline-none [-webkit-tap-highlight-color:transparent] ${playBg}`}
                >
                  Play
                </button>
                <button
                  onClick={() => stop(key)}
                  disabled={!isPlaying}
                  className="font-body text-xs text-heading border border-heading/30 rounded-full px-3.5 py-1.5 disabled:opacity-40 hover:bg-white/60 transition-colors outline-none [-webkit-tap-highlight-color:transparent]"
                >
                  Stop
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="font-body text-text/50 text-xs text-center max-w-md">
        Add nature.mp3 and rain.mp3 to your public/sounds folder for playback.
      </p>

      <style>{`
        .wave-bar {
          animation: wave-bar 900ms ease-in-out infinite;
        }
        @keyframes wave-bar {
          0%, 100% { height: 20%; }
          50% { height: var(--bar-h, 100%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .wave-bar { animation: none; height: 60%; }
        }
      `}</style>
    </div>
  );
}