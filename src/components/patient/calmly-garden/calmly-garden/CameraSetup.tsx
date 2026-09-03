"use client";

import { useEffect, useMemo, useState } from "react";
import type { RefObject } from "react";
import {
  Camera,
  CheckCircle2,
  CircleAlert,
  Loader2,
  Leaf,
} from "lucide-react";

import type { PoseSample } from "./types";

const READY_DELAY_MS = 1000;

function isVisible(point: { visibility?: number }) {
  return (point.visibility ?? 0) >= 0.45;
}

function isGoodPosition(pose: PoseSample | null) {
  if (!pose) return false;

  const points = [
    pose.nose,
    pose.leftShoulder,
    pose.rightShoulder,
    pose.leftWrist,
    pose.rightWrist,
    pose.leftHip,
    pose.rightHip,
    pose.leftAnkle,
    pose.rightAnkle,
  ];

  if (!points.every(isVisible)) return false;

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const bodyCenterX = (minX + maxX) / 2;
  const bodyHeight = maxY - minY;

  return (
    minX >= 0.04 &&
    maxX <= 0.96 &&
    minY >= 0.03 &&
    maxY <= 0.98 &&
    bodyCenterX >= 0.22 &&
    bodyCenterX <= 0.78 &&
    bodyHeight >= 0.55
  );
}

export default function CameraSetup({
  videoRef,
  streamRef,
  pose,
  modelStatus,
  modelError,
  onReady,
  onUseDemo,
  onBack,
}: {
  videoRef: RefObject<HTMLVideoElement>;
  streamRef: RefObject<MediaStream | null>;
  pose: PoseSample | null;
  modelStatus: "idle" | "loading" | "ready" | "error";
  modelError: string | null;
  onReady: () => void;
  onUseDemo: () => void;
  onBack?: () => void;
}) {
  const [readyFor, setReadyFor] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    const stream = streamRef.current;

    if (!video || !stream) return;

    video.srcObject = stream;

    void video.play().catch(() => {});

    return () => {
      if (video.srcObject === stream) {
        video.srcObject = null;
      }
    };
  }, [videoRef, streamRef]);

  const goodPosition = useMemo(
    () => isGoodPosition(pose),
    [pose]
  );

  useEffect(() => {
    setReadyFor(0);

    if (!goodPosition || modelStatus !== "ready") {
      return;
    }

    const startedAt = performance.now();

    const timer = window.setInterval(() => {
      const elapsed = performance.now() - startedAt;

      setReadyFor(
        Math.min(elapsed, READY_DELAY_MS)
      );

      if (elapsed >= READY_DELAY_MS) {
        window.clearInterval(timer);
        onReady();
      }
    }, 50);

    return () => {
      window.clearInterval(timer);
    };
  }, [
    goodPosition,
    modelStatus,
    onReady,
  ]);

  const progress = Math.round(
    (readyFor / READY_DELAY_MS) * 100
  );

  let message =
    "Move back so your whole body is visible";

  if (modelStatus === "loading") {
    message =
      "Starting movement detection…";
  } else if (modelStatus === "error") {
    message =
      "Movement detection could not start";
  } else if (!pose && modelStatus === "ready") {
    message = "Looking for you…";
  } else if (
    goodPosition &&
    modelStatus === "ready"
  ) {
    message =
      readyFor >= READY_DELAY_MS
        ? "Ready!"
        : "Perfect — hold still";
  } else if (pose) {
    message =
      "Center yourself and keep your head + feet in frame";
  }

  return (
    <div className="relative flex flex-col items-center gap-3 py-3 px-4 sm:px-8 overflow-hidden">

      {/* Decorative accents, consistent with the other screens */}
      <div className="pointer-events-none absolute -top-12 -left-12 w-40 h-40 rounded-full bg-greensoft/50 blur-2xl" />
      <div className="pointer-events-none absolute -top-12 -right-12 w-40 h-40 rounded-full bg-greensoft/50 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-12 w-48 h-48 rounded-full bg-lavendersoft/30 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-16 -right-12 w-48 h-48 rounded-full bg-greensoft/40 blur-2xl" />

      {/* HEADER — title/subtitle top-left, Back top-right */}
      <div className="relative flex items-start justify-between w-full max-w-3xl mt-1 mb-0.5">
        <div>
          <h2 className="font-heading text-heading text-2xl md:text-3xl flex items-center gap-2">
            Camera Preview
            <Leaf className="w-5 h-5 text-green" />
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

      <div className="relative w-full max-w-lg">
        <h3 className="font-body font-bold text-green text-xl">
          Get into position
        </h3>

        <p className="font-body text-text/60 text-xs mt-1 leading-snug">
          Stand where your head and both feet are visible.
          Once your position is correct, the game starts
          automatically.
        </p>
      </div>

      <div
        className={[
          "relative mx-auto w-full max-w-xs overflow-hidden rounded-[24px] border-[3px] bg-black shadow-lg transition-colors duration-200",
          goodPosition &&
          modelStatus === "ready"
            ? "border-green"
            : "border-red-500",
        ].join(" ")}
        style={{ filter: "drop-shadow(0 10px 20px rgba(140,163,126,0.25))" }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="block aspect-[3/4] w-full object-cover -scale-x-100"
        />

        <div className="pointer-events-none absolute inset-4 rounded-2xl border border-white/30" />

        <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            {goodPosition &&
            modelStatus === "ready" ? (
              <CheckCircle2 className="h-4 w-4 text-green-300" />
            ) : (
              <CircleAlert className="h-4 w-4 text-red-300" />
            )}

            {message}
          </div>
        </div>

        {modelStatus === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="flex items-center gap-2 rounded-full bg-black/65 px-4 py-2 text-sm text-white">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading camera detection
            </div>
          </div>
        )}

        {goodPosition &&
          modelStatus === "ready" && (
            <div className="absolute bottom-3 left-1/2 w-[min(85%,420px)] -translate-x-1/2">
              <div className="mb-1.5 text-center text-sm font-semibold text-white drop-shadow">
                {readyFor < READY_DELAY_MS
                  ? "Starting in 1 second…"
                  : "Starting…"}
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-white/30">
                <div
                  className="h-full rounded-full bg-green-300 transition-[width] duration-75"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>
            </div>
          )}
      </div>

      {modelStatus === "error" && (
        <div className="w-full max-w-sm rounded-2xl bg-peach-soft px-4 py-2.5 text-center">
          <p className="font-body text-sm text-text/70">
            {modelError ??
              "The movement model could not be loaded."}
          </p>
        </div>
      )}

      {modelStatus === "error" && (
        <button
          onClick={onUseDemo}
          className="bg-button-shape bg-contain bg-no-repeat bg-center font-body font-semibold text-sm text-background w-52 py-3 flex items-center justify-center gap-2 transition-all hover:brightness-105"
          style={{ filter: "drop-shadow(0 6px 10px rgba(140,163,126,0.35))" }}
        >
          Continue with Demo Mode
        </button>
      )}

      <div className="flex items-center justify-center gap-2 text-xs text-text/50">
        <Camera className="h-4 w-4" />
        Camera stays on this device and is not recorded or uploaded.
      </div>
    </div>
  );
}