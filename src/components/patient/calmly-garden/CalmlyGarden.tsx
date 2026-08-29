"use client";

import { useCallback, useEffect, useState } from "react";

import { useCamera } from "./useCamera";
import { usePoseLandmarker } from "./usePoseLandmarker";
import { useMovementRecognition } from "./useMovementRecognition";

import CameraPermission from "./CameraPermission";
import CameraSetup from "./CameraSetup";
import CameraPreview from "./CameraPreview";
import GardenGame from "./GardenGame";
import GardenSummary from "./GardenSummary";

import type {
  GardenStats,
  InputMode,
} from "./types";

import { EMPTY_STATS } from "./types";

type Screen =
  | "intro"
  | "setup"
  | "playing"
  | "summary";

const TARGET_SESSION_SECONDS = 5 * 60;

export default function CalmlyGarden({
  onBack,
}: {
  onBack: () => void;
}) {
  const [screen, setScreen] =
    useState<Screen>("intro");

  const [mode, setMode] =
    useState<InputMode>("camera");

  const [liveStats, setLiveStats] =
    useState<GardenStats>({
      ...EMPTY_STATS,
    });

  const [finalStats, setFinalStats] =
    useState<GardenStats>({
      ...EMPTY_STATS,
    });

  const [finishSignal, setFinishSignal] =
    useState(0);

  const camera = useCamera();

  const posePipelineEnabled =
    mode === "camera" &&
    (screen === "setup" ||
      screen === "playing");

  const {
    pose,
    status: modelStatus,
    error: modelError,
  } = usePoseLandmarker(
    camera.videoRef,
    posePipelineEnabled
  );

  const movementRef =
    useMovementRecognition(
      mode,
      pose
    );

  useEffect(() => {
    if (
      screen !== "setup" &&
      screen !== "playing" &&
      camera.status === "granted"
    ) {
      camera.stop();
    }
  }, [screen, camera]);

  const handleStartCamera =
    useCallback(async () => {
      const ok =
        await camera.start();

      if (!ok) return;

      setMode("camera");

      setLiveStats({
        ...EMPTY_STATS,
      });

      setScreen("setup");
    }, [camera]);

  const handlePositionReady =
    useCallback(() => {
      setLiveStats({
        ...EMPTY_STATS,
      });

      setScreen("playing");
    }, []);

  const handleUseDemo =
    useCallback(() => {
      camera.stop();

      setMode("demo");

      setLiveStats({
        ...EMPTY_STATS,
      });

      setScreen("playing");
    }, [camera]);

  const handleFinishNow =
    useCallback(() => {
      setFinishSignal(
        (value) => value + 1
      );
    }, []);

  const handleGameFinish = useCallback(async (stats: GardenStats) => {
  setFinalStats(stats);
  setScreen("summary");
  await fetch("/api/exercises/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "garden",
      payload: { mode, targetSeconds: TARGET_SESSION_SECONDS, ...stats },
    }),
  });
}, [mode]);

  const handlePlayAgain =
    useCallback(() => {
      camera.stop();

      setFinishSignal(0);

      setLiveStats({
        ...EMPTY_STATS,
      });

      setScreen("intro");
    }, [camera]);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">

      {/* INTRO */}

      {screen === "intro" && (
        <CameraPermission
          status={camera.status}
          error={camera.error}
          videoRef={camera.videoRef}
          onStartCamera={handleStartCamera}
          onUseDemo={handleUseDemo}
          onBack={onBack}
        />
      )}

      {/* CAMERA POSITION SETUP */}

      {screen === "setup" &&
        mode === "camera" && (
          <CameraSetup
            videoRef={camera.videoRef}
            streamRef={camera.streamRef}
            pose={pose}
            modelStatus={modelStatus}
            modelError={modelError}
            onReady={handlePositionReady}
            onUseDemo={handleUseDemo}
            onBack={onBack}
          />
        )}

      {/* GAME */}

      {screen === "playing" && (
        <div className="flex flex-col gap-3">

          <div className="relative">

            {mode === "camera" && (
              <CameraPreview
                videoRef={camera.videoRef}
                streamRef={camera.streamRef}
              />
            )}

            <GardenGame
              movementRef={movementRef}
              targetSeconds={
                TARGET_SESSION_SECONDS
              }
              finishSignal={finishSignal}
              onStatsTick={setLiveStats}
              onFinish={handleGameFinish}
              onBack={handleFinishNow}
            />

            {mode === "camera" &&
              modelStatus === "loading" && (
                <div className="absolute inset-0 z-40 flex items-center justify-center rounded-2xl bg-background/70">
                  <p className="font-body text-sm text-text/70">
                    Getting your garden ready…
                  </p>
                </div>
              )}

            {mode === "camera" &&
              modelStatus === "error" && (
                <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-3 rounded-2xl bg-background/90 p-4 text-center">

                  <p className="font-body text-sm text-text/70">
                    Movement detection
                    couldn&apos;t start.
                  </p>

                  {modelError && (
                    <p className="max-w-md font-body text-xs text-text/50">
                      {modelError}
                    </p>
                  )}

                  <button
                    onClick={
                      handleUseDemo
                    }
                    className="rounded-full bg-green px-4 py-2 font-body text-sm font-semibold text-background"
                  >
                    Switch to Demo Mode
                  </button>

                </div>
              )}
          </div>
        </div>
      )}

      {/* SUMMARY */}

      {screen === "summary" && (
        <GardenSummary
          stats={finalStats}
          onPlayAgain={
            handlePlayAgain
          }
          onBack={onBack}
        />
      )}
    </div>
  );
}