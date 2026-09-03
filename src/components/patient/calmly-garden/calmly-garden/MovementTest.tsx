"use client";

import { useEffect, useRef } from "react";
import type {
  InputMode,
  MovementState,
  PoseSample,
} from "./types";
import { EMPTY_MOVEMENT } from "./types";

// Same sensitivity that worked in MovementTest
const MOVEMENT_THRESHOLD = 0.002;

// Prevent one movement from triggering repeatedly
const JUMP_COOLDOWN = 450;
const SQUAT_COOLDOWN = 400;
const REACH_COOLDOWN = 500;

// How much horizontal movement becomes lean
const LEAN_GAIN = 35;

type DemoKeys = {
  left: boolean;
  right: boolean;
  jump: boolean;
  squat: boolean;
  reach: boolean;
};

export function useMovementRecognition(
  mode: InputMode,
  pose: PoseSample | null
) {
  const movementRef =
    useRef<MovementState>({
      ...EMPTY_MOVEMENT,
    });

  const poseRef =
    useRef<PoseSample | null>(pose);

  poseRef.current = pose;

  const keys =
    useRef<DemoKeys>({
      left: false,
      right: false,
      jump: false,
      squat: false,
      reach: false,
    });

  // --------------------------------------------------
  // KEYBOARD CONTROLS
  // --------------------------------------------------

  useEffect(() => {
    if (mode !== "demo") return;

    const handleKeyDown = (
      e: KeyboardEvent
    ) => {
      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          keys.current.left = true;
          break;

        case "ArrowRight":
        case "d":
        case "D":
          keys.current.right = true;
          break;

        case " ":
        case "Spacebar":
          if (!e.repeat) {
            keys.current.jump = true;
          }
          e.preventDefault();
          break;

        case "s":
        case "S":
          keys.current.squat = true;
          e.preventDefault();
          break;

        case "w":
        case "W":
          keys.current.reach = true;
          e.preventDefault();
          break;
      }
    };

    const handleKeyUp = (
      e: KeyboardEvent
    ) => {
      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          keys.current.left = false;
          break;

        case "ArrowRight":
        case "d":
        case "D":
          keys.current.right = false;
          break;

        case "s":
        case "S":
          keys.current.squat = false;
          break;

        case "w":
        case "W":
          keys.current.reach = false;
          break;
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    window.addEventListener(
      "keyup",
      handleKeyUp
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

      window.removeEventListener(
        "keyup",
        handleKeyUp
      );
    };
  }, [mode]);

  // --------------------------------------------------
  // MOVEMENT DETECTION
  // --------------------------------------------------

  useEffect(() => {
    let animationFrame = 0;

    let previousX:
      number | null = null;

    let previousY:
      number | null = null;

    let lastJump = 0;
    let lastSquat = 0;
    let lastReach = 0;

    const detectMovement = () => {
      const now =
        performance.now();

      const next: MovementState = {
        ...EMPTY_MOVEMENT,
      };

      // ==================================================
      // DEMO / KEYBOARD MODE
      // ==================================================

      if (mode === "demo") {
        const current =
          keys.current;

        // Left / right
        next.lean =
          (current.right ? 1 : 0) -
          (current.left ? 1 : 0);

        // S = seed / squat
        next.squatHeld =
          current.squat;

        next.squatTriggered =
          current.squat;

        // W = star / high movement
        next.reachHeld =
          current.reach;

        next.reachTriggered =
          current.reach;

        // Space = butterfly / small jump
        if (current.jump) {
          next.jumpTriggered =
            true;

          current.jump = false;
        }
      }

      // ==================================================
      // CAMERA MODE
      // ==================================================

      else {
        const sample =
          poseRef.current;

        if (sample) {
          // ----------------------------------------------
          // Find the center of the person's body
          // ----------------------------------------------

          const bodyX =
            (
              sample.leftShoulder.x +
              sample.rightShoulder.x +
              sample.leftHip.x +
              sample.rightHip.x
            ) / 4;

          const bodyY =
            (
              sample.leftShoulder.y +
              sample.rightShoulder.y +
              sample.leftHip.y +
              sample.rightHip.y
            ) / 4;

          // ----------------------------------------------
          // First frame
          // ----------------------------------------------

          if (
            previousX === null ||
            previousY === null
          ) {
            previousX = bodyX;
            previousY = bodyY;
          }

          const horizontal =
            bodyX - previousX;

          const vertical =
            bodyY - previousY;

          // ----------------------------------------------
          // LEAN
          // ----------------------------------------------

          if (
            Math.abs(horizontal) >
            MOVEMENT_THRESHOLD
          ) {
            next.lean = clamp(
              horizontal * LEAN_GAIN,
              -1,
              1
            );
          }

          // ----------------------------------------------
          // UPWARD MOVEMENT = SMALL JUMP
          // ----------------------------------------------

          if (
            vertical <
              -MOVEMENT_THRESHOLD &&
            now - lastJump >
              JUMP_COOLDOWN
          ) {
            next.jumpTriggered =
              true;

            lastJump = now;
          }

          // ----------------------------------------------
          // DOWNWARD MOVEMENT = SQUAT
          // ----------------------------------------------

          if (
            vertical >
              MOVEMENT_THRESHOLD &&
            now - lastSquat >
              SQUAT_COOLDOWN
          ) {
            next.squatTriggered =
              true;

            next.squatHeld =
              true;

            lastSquat = now;
          }

          // ----------------------------------------------
          // W / REACH
          // ----------------------------------------------

          const leftHandUp =
            sample.leftWrist.y <
            sample.leftShoulder.y;

          const rightHandUp =
            sample.rightWrist.y <
            sample.rightShoulder.y;

          if (
            (leftHandUp ||
              rightHandUp) &&
            now - lastReach >
              REACH_COOLDOWN
          ) {
            next.reachTriggered =
              true;

            next.reachHeld =
              true;

            lastReach = now;
          }

          // Save current body position
          previousX = bodyX;
          previousY = bodyY;
        }
      }

      movementRef.current =
        next;

      animationFrame =
        requestAnimationFrame(
          detectMovement
        );
    };

    animationFrame =
      requestAnimationFrame(
        detectMovement
      );

    return () => {
      cancelAnimationFrame(
        animationFrame
      );
    };
  }, [mode]);

  return movementRef;
}

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.max(
    min,
    Math.min(max, value)
  );
}