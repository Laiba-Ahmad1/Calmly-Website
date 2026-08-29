"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import type { RefObject } from "react";

import type {
  NormalizedPoint,
  PoseSample,
} from "./types";

const LM = {
  nose: 0,

  leftShoulder: 11,
  rightShoulder: 12,

  leftWrist: 15,
  rightWrist: 16,

  leftHip: 23,
  rightHip: 24,

  leftAnkle: 27,
  rightAnkle: 28,
} as const;

type LandmarkerStatus =
  | "idle"
  | "loading"
  | "ready"
  | "error";

export function usePoseLandmarker(
  videoRef: RefObject<HTMLVideoElement>,
  enabled: boolean
) {
  const [status, setStatus] =
    useState<LandmarkerStatus>(
      "idle"
    );

  const [error, setError] =
    useState<string | null>(null);

  const [pose, setPose] =
    useState<PoseSample | null>(
      null
    );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const landmarkerRef =
    useRef<any>(null);

  const rafRef =
    useRef<number | null>(null);

  const lastVideoTimeRef =
    useRef(-1);

  useEffect(() => {
    if (!enabled) {
      setStatus("idle");
      setPose(null);
      return;
    }

    let cancelled = false;

    async function init() {
      setStatus("loading");
      setError(null);

      try {
        const {
          FilesetResolver,
          PoseLandmarker,
        } = await import(
          "@mediapipe/tasks-vision"
        );

        const vision =
          await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
          );

        const landmarker =
          await PoseLandmarker.createFromOptions(
            vision,
            {
              baseOptions: {
                modelAssetPath:
                  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",

                delegate: "GPU",
              },

              runningMode: "VIDEO",

              numPoses: 1,
            }
          );

        if (cancelled) {
          landmarker.close();
          return;
        }

        landmarkerRef.current =
          landmarker;

        setStatus("ready");

        loop();
      } catch (err) {
        if (!cancelled) {
          setStatus("error");

          setError(
            err instanceof Error
              ? err.message
              : "Couldn't load the movement detection model."
          );
        }
      }
    }

    function loop() {
      if (cancelled) return;

      const video =
        videoRef.current;

      const landmarker =
        landmarkerRef.current;

      if (
        !video ||
        !landmarker ||
        video.readyState < 2
      ) {
        rafRef.current =
          requestAnimationFrame(loop);

        return;
      }

      if (
        video.currentTime !==
        lastVideoTimeRef.current
      ) {
        lastVideoTimeRef.current =
          video.currentTime;

        try {
          const result =
            landmarker.detectForVideo(
              video,
              performance.now()
            );

          const landmarks =
            result?.landmarks?.[0];

          if (landmarks) {
            setPose(
              toPoseSample(
                landmarks
              )
            );
          } else {
            setPose(null);
          }
        } catch (err) {
          console.warn(
            "Pose detection frame failed:",
            err
          );
        }
      }

      rafRef.current =
        requestAnimationFrame(loop);
    }

    void init();

    return () => {
      cancelled = true;

      if (
        rafRef.current !== null
      ) {
        cancelAnimationFrame(
          rafRef.current
        );
      }

      landmarkerRef.current?.close?.();

      landmarkerRef.current =
        null;

      lastVideoTimeRef.current =
        -1;

      setPose(null);
    };
  }, [
    enabled,
    videoRef,
  ]);

  return {
    status,
    error,
    pose,
  };
}

function toPoint(
  landmark: {
    x: number;
    y: number;
    visibility?: number;
  }
): NormalizedPoint {
  return {
    x: landmark.x,
    y: landmark.y,
    visibility:
      landmark.visibility,
  };
}

function toPoseSample(
  landmarks: {
    x: number;
    y: number;
    visibility?: number;
  }[]
): PoseSample | null {
  const required = [
    LM.nose,

    LM.leftShoulder,
    LM.rightShoulder,

    LM.leftWrist,
    LM.rightWrist,

    LM.leftHip,
    LM.rightHip,

    LM.leftAnkle,
    LM.rightAnkle,
  ];

  if (
    required.some(
      (index) => !landmarks[index]
    )
  ) {
    return null;
  }

  return {
    nose: toPoint(
      landmarks[LM.nose]
    ),

    leftShoulder: toPoint(
      landmarks[
        LM.leftShoulder
      ]
    ),

    rightShoulder: toPoint(
      landmarks[
        LM.rightShoulder
      ]
    ),

    leftWrist: toPoint(
      landmarks[LM.leftWrist]
    ),

    rightWrist: toPoint(
      landmarks[LM.rightWrist]
    ),

    leftHip: toPoint(
      landmarks[LM.leftHip]
    ),

    rightHip: toPoint(
      landmarks[LM.rightHip]
    ),

    leftAnkle: toPoint(
      landmarks[LM.leftAnkle]
    ),

    rightAnkle: toPoint(
      landmarks[
        LM.rightAnkle
      ]
    ),
  };
}