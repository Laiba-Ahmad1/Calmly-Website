"use client";

import { useEffect, useMemo, useState } from "react";
import type { RefObject } from "react";
import {
  Camera,
  CheckCircle2,
  CircleAlert,
  Loader2,
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
}: {
  videoRef: RefObject<HTMLVideoElement>;
  streamRef: RefObject<MediaStream | null>;
  pose: PoseSample | null;
  modelStatus: "idle" | "loading" | "ready" | "error";
  modelError: string | null;
  onReady: () => void;
  onUseDemo: () => void;
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
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="font-body font-bold text-text text-xl">
          Get into position
        </h3>

        <p className="font-body text-text/60 text-sm mt-1">
          Stand where your head and both feet are visible.
          Once your position is correct, the game starts
          automatically.
        </p>
      </div>

      <div
        className={[
          "relative w-full overflow-hidden rounded-3xl border-4 bg-black shadow-sm transition-colors duration-200",
          goodPosition &&
          modelStatus === "ready"
            ? "border-green"
            : "border-red-500",
        ].join(" ")}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="block aspect-video w-full object-cover -scale-x-100"
        />

        <div className="pointer-events-none absolute inset-5 rounded-2xl border border-white/30" />

        <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 backdrop-blur">
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
            <div className="absolute bottom-5 left-1/2 w-[min(85%,420px)] -translate-x-1/2">
              <div className="mb-2 text-center text-sm font-semibold text-white drop-shadow">
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
        <div className="rounded-2xl bg-peach-soft px-4 py-3 text-center">
          <p className="font-body text-sm text-text/70">
            {modelError ??
              "The movement model could not be loaded."}
          </p>
        </div>
      )}

      {modelStatus === "error" && (
        <button
          onClick={onUseDemo}
          className="mx-auto rounded-full bg-green px-5 py-2.5 font-body text-sm font-semibold text-background"
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