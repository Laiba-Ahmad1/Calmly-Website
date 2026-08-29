// src/components/patient/calmly-garden/CameraPermission.tsx
"use client";

import type { RefObject } from "react";
import { Camera, Keyboard, ShieldCheck, Loader2 } from "lucide-react";

type Status = "idle" | "requesting" | "granted" | "denied" | "unsupported";

export default function CameraPermission({
  status,
  error,
  videoRef,
  onStartCamera,
  onUseDemo,
}: {
  status: Status;
  error: string | null;
  videoRef: React.RefObject<HTMLVideoElement>;
  onStartCamera: () => void;
  onUseDemo: () => void;
}) {
  return (
    <div className="flex flex-col items-center text-center py-6 px-4 gap-5">
      <div className="w-14 h-14 rounded-full bg-green-soft flex items-center justify-center">
        <Camera className="w-7 h-7 text-green" />
      </div>

      <div>
        <h3 className="font-body font-bold text-text text-xl">Enter the garden</h3>
        <p className="font-body text-text/60 text-sm mt-1 max-w-sm">
          Calmly Garden uses your camera to gently sense your movements — lean, reach, squat, and jump — and
          turns them into a peaceful walk through a growing garden.
        </p>
      </div>

      <div className="flex items-start gap-2 bg-text/5 rounded-2xl p-3 max-w-sm text-left">
        <ShieldCheck className="w-4 h-4 text-green mt-0.5 shrink-0" />
        <p className="font-body text-text/60 text-xs">
          Camera access is needed to detect your movements. Your camera feed is processed locally on your
          device and isn&apos;t recorded, saved, or uploaded anywhere.
        </p>
      </div>

      {status === "granted" && (
        <video
          ref={videoRef}
          muted
          playsInline
          className="w-40 h-28 rounded-xl object-cover -scale-x-100 bg-text/10"
        />
      )}
      {status !== "granted" && (
        // Kept mounted (hidden) so the stream can attach as soon as permission is granted.
        <video ref={videoRef} muted playsInline className="hidden" />
      )}

      {status === "denied" && (
        <p className="font-body text-peach text-xs max-w-sm">
          {error ?? "Camera access was denied."} No problem — you can use the keyboard demo mode instead.
        </p>
      )}
      {status === "unsupported" && (
        <p className="font-body text-peach text-xs max-w-sm">
          This device or browser doesn&apos;t support camera movement tracking. You can still play with the
          keyboard demo mode below.
        </p>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm">
        <button
          onClick={onStartCamera}
          disabled={status === "requesting" || status === "unsupported"}
          className="flex-1 flex items-center justify-center gap-2 font-body font-semibold text-background text-sm px-5 py-3 rounded-full bg-green hover:brightness-95 disabled:opacity-60 w-full"
        >
          {status === "requesting" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Requesting camera…
            </>
          ) : (
            <>
              <Camera className="w-4 h-4" /> Start Camera
            </>
          )}
        </button>
        <button
          onClick={onUseDemo}
          className="flex-1 flex items-center justify-center gap-2 font-body font-semibold text-text text-sm px-5 py-3 rounded-full bg-text/5 hover:bg-text/10 w-full"
        >
          <Keyboard className="w-4 h-4" /> Use Demo Mode
        </button>
      </div>
    </div>
  );
}