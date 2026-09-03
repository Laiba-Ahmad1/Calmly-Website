"use client";

import { useEffect } from "react";
import type { RefObject } from "react";

export default function CameraPreview({
  videoRef,
  streamRef,
}: {
  videoRef: RefObject<HTMLVideoElement>;
  streamRef: RefObject<MediaStream | null>;
}) {
  useEffect(() => {
    const video =
      videoRef.current;

    const stream =
      streamRef.current;

    if (!video || !stream) {
      return;
    }

    video.srcObject = stream;

    void video.play().catch(() => {});

    return () => {
      /*
       * Do NOT stop the camera here.
       *
       * useCamera owns the stream.
       */
      if (
        video.srcObject === stream
      ) {
        video.srcObject = null;
      }
    };
  }, [
    videoRef,
    streamRef,
  ]);

  return (
    <div className="absolute top-4 right-4 z-50 w-32 overflow-hidden rounded-2xl border-[3px] border-white/90 bg-black shadow-lg sm:w-40">

      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="block w-full -scale-x-100"
      />

      <div className="absolute bottom-0 left-0 right-0 bg-black/45 px-2 py-1 backdrop-blur-sm">
        <p className="text-center text-[10px] text-white">
          Camera
        </p>
      </div>

    </div>
  );
}