// src/components/patient/calmly-garden/CameraPermission.tsx
"use client";

import type { RefObject } from "react";
import { Camera, Keyboard, ShieldCheck, Loader2, Leaf, Sparkles } from "lucide-react";

type Status = "idle" | "requesting" | "granted" | "denied" | "unsupported";

export default function CameraPermission({
  status,
  error,
  videoRef,
  onStartCamera,
  onUseDemo,
  onBack,
}: {
  status: Status;
  error: string | null;
  videoRef: React.RefObject<HTMLVideoElement>;
  onStartCamera: () => void;
  onUseDemo: () => void;
  onBack?: () => void;
}) {
  return (
    <div className="relative flex flex-col items-center text-center py-8 px-4 sm:px-10 gap-6 min-h-[600px] justify-center overflow-hidden">

      {/* Decorative accents, consistent with the other screens */}
      <div className="pointer-events-none absolute -top-12 -left-12 w-40 h-40 rounded-full bg-greensoft/50 blur-2xl" />
      <div className="pointer-events-none absolute -top-12 -right-12 w-40 h-40 rounded-full bg-greensoft/50 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-12 w-48 h-48 rounded-full bg-lavendersoft/30 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-16 -right-12 w-48 h-48 rounded-full bg-greensoft/40 blur-2xl" />
      <Sparkles className="pointer-events-none absolute top-1/3 left-10 w-4 h-4 text-green/30" />
      <Sparkles className="pointer-events-none absolute top-1/3 right-10 w-4 h-4 text-green/30" />

      {/* HEADER — title/subtitle top-left, Back top-right */}
      <div className="absolute top-6 left-0 right-0 flex items-start justify-between">
        <div>
          <h2 className="font-heading text-heading text-3xl md:text-4xl flex items-center gap-2">
            Calmly Garden
            <Leaf className="w-6 h-6 text-green" />
          </h2>
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

      {/* ICON BADGE */}
      <div className="relative w-16 h-16 rounded-full bg-green-soft flex items-center justify-center shadow-md ring-4 ring-white/70 mt-16">
        <Camera className="w-7 h-7 text-green" />
      </div>

      <div className="max-w-md">
        <h3 className="font-body font-bold text-green text-2xl">Enter the garden</h3>
        <p className="font-body text-text/60 text-sm mt-2 leading-relaxed">
          Calmly Garden uses your camera to gently sense your movements — lean, reach, squat, and jump — and
          turns them into a peaceful walk through a growing garden.
        </p>
      </div>

      {/* PRIVACY NOTE */}
      <div className="flex items-start gap-3 rounded-2xl border border-green/15 bg-green-soft/40 shadow-sm p-4 w-full max-w-md text-left">
        <ShieldCheck className="w-4 h-4 text-green mt-0.5 shrink-0" />
        <p className="font-body text-text/60 text-xs leading-relaxed">
          Camera access is needed to detect your movements. Your camera feed is processed locally on your
          device and isn&apos;t recorded, saved, or uploaded anywhere.
        </p>
      </div>

      {status === "granted" && (
        <video
          ref={videoRef}
          muted
          playsInline
          className="w-40 h-28 rounded-xl object-cover -scale-x-100 bg-text/10 shadow-md ring-2 ring-white/70"
        />
      )}
      {status !== "granted" && (
        // Kept mounted (hidden) so the stream can attach as soon as permission is granted.
        <video ref={videoRef} muted playsInline className="hidden" />
      )}

      {status === "denied" && (
        <p className="font-body text-peach text-sm max-w-md">
          {error ?? "Camera access was denied."} No problem — you can use the keyboard demo mode instead.
        </p>
      )}
      {status === "unsupported" && (
        <p className="font-body text-peach text-sm max-w-md">
          This device or browser doesn&apos;t support camera movement tracking. You can still play with the
          keyboard demo mode below.
        </p>
      )}

      {/* ACTIONS — both styled as pills, side by side */}
      <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-md mt-1">
        <button
          onClick={onStartCamera}
          disabled={status === "requesting" || status === "unsupported"}
          className="bg-button-shape bg-contain bg-no-repeat bg-center font-body font-semibold text-sm text-background w-48 py-3 flex items-center justify-center gap-2 transition-all hover:brightness-105 disabled:opacity-60"
          style={{ filter: "drop-shadow(0 6px 10px rgba(140,163,126,0.35))" }}
        >
          {status === "requesting" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Requesting…
            </>
          ) : (
            <>
              <Camera className="w-4 h-4" /> Start Camera
            </>
          )}
        </button>

        <button
          onClick={onUseDemo}
          className="bg-button-shape bg-contain bg-no-repeat bg-center font-body font-semibold text-sm text-background w-48 py-3 flex items-center justify-center gap-2 transition-all hover:brightness-105"
          style={{ filter: "drop-shadow(0 6px 10px rgba(140,163,126,0.35))" }}
        >
          <Keyboard className="w-4 h-4" /> Use Demo Mode
        </button>
      </div>
    </div>
  );
}