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
    <div className="absolute top-4 right-4 z-50 w-40 overflow-hidden rounded-xl border-2 border-white/80 bg-black shadow-lg">

      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="block w-full -scale-x-100"
      />

      <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
        <p className="text-center text-[10px] text-white">
          Camera
        </p>
      </div>

    </div>
  );
}