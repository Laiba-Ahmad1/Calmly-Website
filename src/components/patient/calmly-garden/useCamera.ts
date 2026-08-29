"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type CameraStatus =
  | "idle"
  | "requesting"
  | "granted"
  | "denied"
  | "unsupported";

export function useCamera() {
  const videoRef =
    useRef<HTMLVideoElement>(null);

  const streamRef =
    useRef<MediaStream | null>(null);

  const [status, setStatus] =
    useState<CameraStatus>("idle");

  const [error, setError] =
    useState<string | null>(null);

  const start =
    useCallback(async () => {
      if (
        typeof navigator === "undefined" ||
        !navigator.mediaDevices?.getUserMedia
      ) {
        setStatus("unsupported");
        return false;
      }

      setStatus("requesting");
      setError(null);

      try {
        /*
         * IMPORTANT:
         *
         * If camera already exists, reuse it.
         * Do not call getUserMedia again.
         */
        if (!streamRef.current) {
          streamRef.current =
            await navigator.mediaDevices.getUserMedia(
              {
                video: {
                  facingMode: "user",
                  width: {
                    ideal: 1280,
                  },
                  height: {
                    ideal: 720,
                  },
                },
                audio: false,
              }
            );
        }

        if (videoRef.current) {
          videoRef.current.srcObject =
            streamRef.current;

          await videoRef.current.play();
        }

        setStatus("granted");

        return true;
      } catch (err) {
        setStatus("denied");

        setError(
          err instanceof Error
            ? err.message
            : "Camera permission was denied."
        );

        return false;
      }
    }, []);

  const stop =
    useCallback(() => {
      streamRef.current
        ?.getTracks()
        .forEach((track) =>
          track.stop()
        );

      streamRef.current = null;

      if (videoRef.current) {
        videoRef.current.srcObject =
          null;
      }

      setStatus("idle");
    }, []);

  useEffect(() => {
    return stop;
  }, [stop]);

  return {
    videoRef,
    streamRef,
    status,
    error,
    start,
    stop,
  };
}