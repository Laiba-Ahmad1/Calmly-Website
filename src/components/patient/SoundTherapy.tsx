// src/components/patient/SoundTherapy.tsx
"use client";

import { useRef, useState } from "react";
import {
  Leaf,
  CloudRain,
  Waves,
  Play,
  Square,
} from "lucide-react";
import type { ElementType } from "react";

type SoundKey = "nature" | "rain" | "ocean";

type Sound = {
  key: SoundKey;
  label: string;
  tagline: string;
  src: string;
  icon: ElementType;
  iconBg: string;
  iconText: string;
  playBg: string;
  barBg: string;
  headingText: string;
  stopBorder: string;
  stopText: string;
};

const SOUNDS: Sound[] = [
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
    headingText: "text-heading",
    stopBorder: "border-heading/20",
    stopText: "text-heading",
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
    headingText: "text-lavender",
    stopBorder: "border-lavender/40",
    stopText: "text-lavender",
  },
  {
    key: "ocean",
    label: "Ocean Waves",
    tagline: "Gentle, rhythmic waves",
    src: "/sounds/ocean.mp3",
    icon: Waves,
    iconBg: "bg-bluesoft",
    iconText: "text-blue",
    playBg: "bg-blue",
    barBg: "bg-blue",
    headingText: "text-blue",
    stopBorder: "border-blue/40",
    stopText: "text-blue",
  },
];

const BAR_HEIGHTS = [30, 55, 40, 75, 45, 65, 35];

const LEAVES = [
  { left: "8%", delay: "0s", duration: "6s", size: 15 },
  { left: "23%", delay: "1.4s", duration: "7s", size: 12 },
  { left: "42%", delay: "0.7s", duration: "6.5s", size: 17 },
  { left: "61%", delay: "2.2s", duration: "7.5s", size: 13 },
  { left: "80%", delay: "1s", duration: "6.8s", size: 16 },
];

const RAINDROPS = [
  { left: "8%", delay: "0s", duration: "1.2s" },
  { left: "18%", delay: "0.4s", duration: "1.4s" },
  { left: "28%", delay: "0.8s", duration: "1.1s" },
  { left: "39%", delay: "0.2s", duration: "1.3s" },
  { left: "50%", delay: "0.6s", duration: "1.2s" },
  { left: "61%", delay: "0.1s", duration: "1.4s" },
  { left: "72%", delay: "0.5s", duration: "1.15s" },
  { left: "83%", delay: "0.9s", duration: "1.3s" },
  { left: "93%", delay: "0.3s", duration: "1.2s" },
];

// Sessions shorter than this earn nothing — mirrors MIN_SECONDS on the backend
const MIN_SESSION_SECONDS = 20;

export default function SoundTherapy({
  onBack,
}: {
  onBack?: () => void;
}) {
  const audioRefs = useRef<Record<SoundKey, HTMLAudioElement | null>>({
    nature: null,
    rain: null,
    ocean: null,
  });

  // Tracks when each sound started playing, so we can compute session length on stop/switch/end
  const startTimeRef = useRef<Record<SoundKey, number | null>>({
    nature: null,
    rain: null,
    ocean: null,
  });

  const [playing, setPlaying] = useState<SoundKey | null>(null);

  const submitSoundSession = (key: SoundKey) => {
    const startedAt = startTimeRef.current[key];
    if (!startedAt) return;

    const sessionSeconds = (Date.now() - startedAt) / 1000;
    startTimeRef.current[key] = null;

    if (sessionSeconds < MIN_SESSION_SECONDS) return;

    fetch("/api/exercises/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "sound",
        payload: { soundKey: key, sessionSeconds },
      }),
    });
  };

  const play = async (key: SoundKey) => {
    const audio = audioRefs.current[key];

    if (!audio) {
      console.error("Audio element not found:", key);
      return;
    }

    try {
      Object.entries(audioRefs.current).forEach(
        ([otherKey, otherAudio]) => {
          if (otherKey !== key && otherAudio) {
            otherAudio.pause();
            otherAudio.currentTime = 0;
            submitSoundSession(otherKey as SoundKey);
          }
        }
      );

      audio.currentTime = 0;
      audio.volume = 1;

      await audio.play();

      startTimeRef.current[key] = Date.now();
      setPlaying(key);
    } catch (error) {
      console.error(`Could not play ${key}:`, error);
    }
  };

  const stop = (key: SoundKey) => {
    const audio = audioRefs.current[key];

    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;

    submitSoundSession(key);

    if (playing === key) {
      setPlaying(null);
    }
  };

  return (
    <div className="relative flex flex-col items-center gap-3 sm:gap-4 px-6 py-4 mt-6 sm:px-10 sm:py-5 sm:mt-10">

      {/* Header */}
      <div className="relative flex items-start justify-between w-full max-w-5xl">
        <div>
          <h2 className="font-heading text-heading text-3xl md:text-4xl flex items-center gap-2">
            Sound Therapy
            <Leaf className="w-5 h-5 text-green" />
          </h2>

          <p className="font-body text-text/55 text-sm mt-1">
            Let gentle sounds create a little space for you to breathe.
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

      {/* Sound Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-5xl">

        {SOUNDS.map(
          ({
            key,
            label,
            tagline,
            src,
            icon: Icon,
            iconBg,
            iconText,
            playBg,
            barBg,
            headingText,
            stopBorder,
            stopText,
          }) => {
            const isPlaying = playing === key;

            return (
              <div
                key={key}
                className={`relative overflow-hidden rounded-3xl border transition-all duration-500 ${
                  isPlaying
                    ? "bg-white/85 border-heading/20 shadow-xl -translate-y-1"
                    : "bg-white/55 border-text/10"
                }`}
              >

                <div
                  className={`relative h-32 overflow-hidden ${
                    key === "nature"
                      ? "bg-greensoft/70"
                      : key === "rain"
                      ? "bg-lavendersoft/80"
                      : "bg-bluesoft/80"
                  }`}
                >

                  {key === "nature" && (
                    <>
                      {isPlaying &&
                        LEAVES.map((leaf, index) => (
                          <Leaf
                            key={index}
                            className="falling-leaf absolute text-green/55"
                            style={{
                              left: leaf.left,
                              top: "-20px",
                              width: leaf.size,
                              height: leaf.size,
                              animationDelay: leaf.delay,
                              animationDuration: leaf.duration,
                            }}
                          />
                        ))}

                      {isPlaying && (
                        <>
                          <span className="breeze-line breeze-a" />
                          <span className="breeze-line breeze-b" />
                        </>
                      )}
                    </>
                  )}

                  {key === "rain" && (
                    <>
                      {isPlaying &&
                        RAINDROPS.map((drop, index) => (
                          <span
                            key={index}
                            className="raindrop absolute top-[15px] bg-lavender/55"
                            style={{
                              left: drop.left,
                              animationDelay: drop.delay,
                              animationDuration: drop.duration,
                            }}
                          />
                        ))}

                      <div className="absolute bottom-0 left-0 right-0 h-6 bg-lavender/10 rounded-t-[50%]" />

                      {isPlaying && (
                        <>
                          <span className="rain-ripple ripple-a" />
                          <span className="rain-ripple ripple-b" />
                          <span className="rain-ripple ripple-c" />
                        </>
                      )}
                    </>
                  )}

                  {key === "ocean" && (
                    <>
                      <div className="absolute inset-0 bg-blue/5" />

                      <div
                        className={`absolute top-5 right-8 w-11 h-11 rounded-full bg-blue/15 transition-all duration-700 ${
                          isPlaying ? "scale-110" : ""
                        }`}
                      />

                      <div className="absolute left-0 right-0 bottom-[42px] h-px bg-blue/15" />

                      <div className="absolute top-7 left-[18%] text-blue/25 text-xs">
                        ︵ ︵
                      </div>

                      <div className="absolute top-12 left-[28%] text-blue/20 text-[9px]">
                        ︵
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 h-12 bg-blue/10" />

                      <div
                        className={`absolute bottom-5 left-[-10%] w-[120%] h-8 rounded-[50%] border-t-2 border-blue/30 ${
                          isPlaying ? "ocean-wave-one" : ""
                        }`}
                      />

                      <div
                        className={`absolute bottom-2 left-[-15%] w-[130%] h-8 rounded-[50%] border-t-2 border-blue/20 ${
                          isPlaying ? "ocean-wave-two" : ""
                        }`}
                      />

                      <div
                        className={`absolute bottom-[-4px] left-[-5%] w-[115%] h-8 rounded-[50%] border-t border-blue/15 ${
                          isPlaying ? "ocean-wave-three" : ""
                        }`}
                      />

                      {isPlaying && (
                        <>
                          <span className="ocean-foam foam-a" />
                          <span className="ocean-foam foam-b" />
                          <span className="ocean-foam foam-c" />
                        </>
                      )}
                    </>
                  )}

                  <div
                    className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full ${iconBg} backdrop-blur-sm flex items-center justify-center shadow-sm transition-all duration-500 ${
                      isPlaying ? "scale-110" : ""
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${iconText}`} />

                    {isPlaying && (
                      <span className="absolute inset-0 rounded-full art-pulse border border-heading/10" />
                    )}
                  </div>
                </div>

                <div className="relative flex flex-col items-center px-5 py-6">

                  <audio
                    ref={(element) => {
                      audioRefs.current[key] = element;
                    }}
                    src={src}
                    loop
                    preload="auto"
                    onEnded={() => {
                      submitSoundSession(key);
                      if (playing === key) {
                        setPlaying(null);
                      }
                    }}
                  />

                  <h3 className={`font-heading font-semibold text-lg ${headingText}`}>
                    {label}
                  </h3>

                  <p className="font-body text-text/50 text-xs mt-1">
                    {tagline}
                  </p>

                  <div className="flex items-center gap-1.5 h-5 mt-3">
                    {isPlaying ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-green status-dot" />

                        <span className="font-body text-[10px] text-heading/55">
                          Playing gently
                        </span>
                      </>
                    ) : (
                      <span className="font-body text-[10px] text-text/30">
                        Ready when you are
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-1.5 h-9 mt-2">

                    {BAR_HEIGHTS.map((height, index) => (
                      <span
                        key={index}
                        className={`w-1 rounded-full ${
                          isPlaying
                            ? `${barBg} sound-bar-playing`
                            : `${barBg} opacity-20`
                        }`}
                        style={{
                          height: `${Math.max(height * 0.28, 7)}px`,
                          animationDelay: `${index * 0.1}s`,
                        }}
                      />
                    ))}

                  </div>

                  <div className="flex items-center gap-2 mt-4">

                    <button
                      onClick={() => play(key)}
                      disabled={isPlaying}
                      className={`flex items-center gap-1.5 font-body text-xs text-background rounded-full px-4 py-2 shadow-sm disabled:opacity-35 hover:scale-105 active:scale-95 transition-all ${playBg}`}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      Play
                    </button>

                    <button
                      onClick={() => stop(key)}
                      disabled={!isPlaying}
                      className={`flex items-center gap-1.5 font-body text-xs rounded-full px-4 py-2 border disabled:opacity-30 hover:bg-white/70 hover:scale-105 active:scale-95 transition-all ${stopBorder} ${stopText}`}
                    >
                      <Square className="w-3 h-3 fill-current" />
                      Stop
                    </button>

                  </div>
                </div>

                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 transition-all duration-500 ${
                    isPlaying
                      ? `${playBg} opacity-70`
                      : "opacity-0"
                  }`}
                />
              </div>
            );
          }
        )}

      </div>

      {/* Decorative divider */}
      <div className="flex items-center gap-3">
        <div className="w-16 h-px bg-heading/15" />
        <Leaf className="w-4 h-4 text-green/50" />
        <div className="w-16 h-px bg-heading/15" />
      </div>

      <style>{`

        .art-pulse {
          animation: art-pulse 2s ease-out infinite;
        }

        @keyframes art-pulse {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(1.45); opacity: 0; }
        }

        .sound-bar-playing {
          animation: sound-bars 850ms ease-in-out infinite;
          transform-origin: center;
        }

        @keyframes sound-bars {
          0%, 100% { transform: scaleY(0.45); }
          50% { transform: scaleY(1.4); }
        }

        .falling-leaf {
          animation-name: leaf-fall;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }

        @keyframes leaf-fall {
          0% { transform: translate3d(0, -20px, 0) rotate(0deg); opacity: 0; }
          12% { opacity: 0.8; }
          30% { transform: translate3d(22px, 35px, 0) rotate(80deg); }
          55% { transform: translate3d(-18px, 75px, 0) rotate(170deg); }
          75% { transform: translate3d(25px, 105px, 0) rotate(250deg); }
          100% { transform: translate3d(-10px, 145px, 0) rotate(340deg); opacity: 0; }
        }

        .breeze-line {
          position: absolute;
          width: 55px;
          height: 1px;
          border-radius: 999px;
          background: rgb(var(--color-green) / 0.22);
          transform: rotate(-8deg);
          opacity: 0;
        }

        .breeze-a { top: 40%; left: -60px; animation: breeze 4s ease-in-out infinite; }
        .breeze-b { top: 62%; left: -80px; animation: breeze 5s ease-in-out 1.5s infinite; }

        @keyframes breeze {
          0% { transform: translateX(0) rotate(-8deg); opacity: 0; }
          25% { opacity: 0.7; }
          75% { opacity: 0.35; }
          100% { transform: translateX(320px) rotate(-8deg); opacity: 0; }
        }

        .raindrop {
          width: 1px;
          height: 17px;
          border-radius: 999px;
          animation: rain-fall linear infinite;
        }

        @keyframes rain-fall {
          0% { transform: translateY(-10px) rotate(8deg); opacity: 0; }
          15% { opacity: 0.65; }
          85% { opacity: 0.55; }
          100% { transform: translateY(115px) rotate(8deg); opacity: 0; }
        }

        .rain-ripple {
          position: absolute;
          bottom: 7px;
          width: 18px;
          height: 6px;
          border: 1px solid rgb(var(--color-lavender) / 0.35);
          border-radius: 50%;
          opacity: 0;
          animation: rain-ripple 1.8s ease-out infinite;
        }

        .ripple-a { left: 22%; animation-delay: 0.2s; }
        .ripple-b { left: 51%; animation-delay: 0.9s; }
        .ripple-c { left: 77%; animation-delay: 1.4s; }

        @keyframes rain-ripple {
          0% { transform: scale(0.3); opacity: 0; }
          30% { opacity: 0.7; }
          100% { transform: scale(2.2); opacity: 0; }
        }

        .ocean-wave-one { animation: ocean-one 4s ease-in-out infinite; }
        .ocean-wave-two { animation: ocean-two 5s ease-in-out infinite; }
        .ocean-wave-three { animation: ocean-three 6s ease-in-out infinite; }

        @keyframes ocean-one {
          0%, 100% { transform: translateX(-20px) rotate(1deg); }
          50% { transform: translateX(25px) rotate(-1deg); }
        }

        @keyframes ocean-two {
          0%, 100% { transform: translateX(25px) rotate(-1deg); }
          50% { transform: translateX(-30px) rotate(1deg); }
        }

        @keyframes ocean-three {
          0%, 100% { transform: translateX(-15px); }
          50% { transform: translateX(20px); }
        }

        .ocean-foam {
          position: absolute;
          width: 5px;
          height: 2px;
          border-radius: 999px;
          background: rgb(var(--color-blue) / 0.3);
          animation: foam 3s ease-in-out infinite;
        }

        .foam-a { left: 22%; bottom: 28px; }
        .foam-b { left: 58%; bottom: 20px; animation-delay: 1s; }
        .foam-c { left: 78%; bottom: 31px; animation-delay: 1.8s; }

        @keyframes foam {
          0%, 100% { transform: translateX(-5px); opacity: 0.2; }
          50% { transform: translateX(10px); opacity: 0.7; }
        }

        .status-dot {
          animation: status-dot 1.5s ease-in-out infinite;
        }

        @keyframes status-dot {
          0%, 100% { opacity: 0.35; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        @media (prefers-reduced-motion: reduce) {
          .falling-leaf, .breeze-line, .raindrop, .rain-ripple,
          .ocean-wave-one, .ocean-wave-two, .ocean-wave-three,
          .ocean-foam, .sound-bar-playing, .art-pulse, .status-dot {
            animation: none;
          }
        }

      `}</style>
    </div>
  );
}