"use client";

import { useEffect, useRef } from "react";

import type {
  InputMode,
  MovementState,
  PoseSample,
} from "./types";

import { EMPTY_MOVEMENT } from "./types";

// ============================================================
// CALMLY - MOVEMENT RECOGNITION
// ============================================================
//
// CAMERA MOVEMENTS:
//
// LEFT / RIGHT
//     Hip-center horizontal movement.
//
// JUMP
//     ONLY the head/nose moving upward from the
//     standing baseline.
//
// SQUAT
//     Head + shoulders moving clearly downward
//     from the standing baseline.
//
// REACH
//     Either hand above its shoulder.
//
// IMPORTANT:
//
// Movement recognition DOES NOT increase score.
//
// GardenGame is responsible for collectible collision
// and scoring.
// ============================================================


// ============================================================
// LEFT / RIGHT
// ============================================================

/*
 * Small deadzone prevents tiny camera/body noise.
 */
const LEFT_RIGHT_DEADZONE = 0.035;

/*
 * How far the player can lean before reaching ±1.
 */
const LEFT_RIGHT_RANGE = 0.22;

/*
 * IMPORTANT:
 *
 * Previously this was 0.18.
 *
 * 0.75 makes the game react much faster.
 */
const LEFT_RIGHT_SMOOTHING = 0.75;


// ============================================================
// JUMP
// ============================================================

/*
 * Prevents one jump from repeatedly firing.
 */
const JUMP_COOLDOWN = 650;

/*
 * After a jump, the head must return close enough
 * to its standing position before another jump
 * can happen.
 */
const JUMP_RELEASE = 0.035;

/*
 * How far upward the head must move.
 *
 * Camera coordinates:
 *
 *     smaller Y = higher on screen
 *
 * Therefore:
 *
 *     baseline.noseY - current.noseY
 *
 * means upward movement.
 *
 * 0.055 means approximately 5.5% of body height.
 *
 * This is intentionally easy, but NOT tiny.
 */
const JUMP_HEAD_RISE = 0.045;

/*
 * Require a small amount of frame confirmation.
 *
 * 2 is enough to reduce accidental one-frame jumps
 * while still feeling responsive.
 */
const JUMP_CONFIRM_FRAMES = 1;


// ============================================================
// SQUAT
// ============================================================

/*
 * Prevent repeated squat events.
 */
const SQUAT_COOLDOWN = 650;

/*
 * How far the upper body must move downward.
 *
 * This is deliberately noticeable.
 *
 * We don't want:
 *
 *     tiny head movement = squat
 *
 * We want:
 *
 *     clearly lower yourself = squat
 */
const SQUAT_DEPTH = 0.075;

/*
 * When the upper body comes back close to standing,
 * another squat can be detected.
 */
const SQUAT_RELEASE = 0.035;

/*
 * Require several frames so a single noisy pose
 * does not trigger squat.
 */
const SQUAT_CONFIRM_FRAMES = 3;


// ============================================================
// HANDS
// ============================================================

/*
 * Hand detection was already working well,
 * so keep it responsive.
 */
const REACH_COOLDOWN = 500;


// ============================================================
// CALIBRATION
// ============================================================

/*
 * The first few valid frames establish the patient's
 * normal standing position.
 */
const CALIBRATION_FRAMES = 20;


// ============================================================
// DEMO KEYS
// ============================================================

type DemoKeys = {
  left: boolean;
  right: boolean;
  space: boolean;
  squat: boolean;
  reach: boolean;
};


// ============================================================
// BASELINE
// ============================================================

type Baseline = {
  /*
   * Head/nose standing position.
   */
  noseY: number;

  /*
   * Average shoulder position.
   */
  shoulderY: number;

  /*
   * Combined upper-body position.
   *
   * This is calculated from:
   *
   *     head + shoulders
   *
   * and is used for squat detection.
   */
  upperBodyY: number;

  /*
   * Hips are still used for left/right.
   */
  hipY: number;

  hipX: number;

  /*
   * Kept for body normalization.
   */
  bodyHeight: number;
};


// ============================================================
// HOOK
// ============================================================

export function useMovementRecognition(
  mode: InputMode,
  pose: PoseSample | null
) {
  const movementRef =
    useRef<MovementState>({
      ...EMPTY_MOVEMENT,
    });

  const poseRef =
    useRef<PoseSample | null>(
      pose
    );

  poseRef.current =
    pose;


  // ==========================================================
  // KEYBOARD
  // ==========================================================

  const keys =
    useRef<DemoKeys>({
      left: false,
      right: false,
      space: false,
      squat: false,
      reach: false,
    });


  // ==========================================================
  // DEMO MODE KEYBOARD
  // ==========================================================

  useEffect(() => {
    if (
      mode !== "demo"
    ) {
      return;
    }

    function keyDown(
      e: KeyboardEvent
    ) {
      switch (e.key) {
        // ----------------------------------------------------
        // LEFT
        // ----------------------------------------------------

        case "ArrowLeft":
        case "a":
        case "A":
          keys.current.left =
            true;
          break;

        // ----------------------------------------------------
        // RIGHT
        // ----------------------------------------------------

        case "ArrowRight":
        case "d":
        case "D":
          keys.current.right =
            true;
          break;

        // ----------------------------------------------------
        // JUMP
        // ----------------------------------------------------

        case " ":
        case "Spacebar":
          if (!e.repeat) {
            keys.current.space =
              true;
          }

          e.preventDefault();
          break;

        // ----------------------------------------------------
        // SQUAT
        // ----------------------------------------------------

        case "s":
        case "S":
          keys.current.squat =
            true;

          e.preventDefault();
          break;

        // ----------------------------------------------------
        // REACH
        // ----------------------------------------------------

        case "w":
        case "W":
          keys.current.reach =
            true;

          e.preventDefault();
          break;
      }
    }


    function keyUp(
      e: KeyboardEvent
    ) {
      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          keys.current.left =
            false;
          break;

        case "ArrowRight":
        case "d":
        case "D":
          keys.current.right =
            false;
          break;

        case "s":
        case "S":
          keys.current.squat =
            false;
          break;

        case "w":
        case "W":
          keys.current.reach =
            false;
          break;
      }
    }


    window.addEventListener(
      "keydown",
      keyDown
    );

    window.addEventListener(
      "keyup",
      keyUp
    );


    return () => {
      window.removeEventListener(
        "keydown",
        keyDown
      );

      window.removeEventListener(
        "keyup",
        keyUp
      );
    };
  }, [mode]);


  // ==========================================================
  // CAMERA RECOGNITION
  // ==========================================================

  useEffect(() => {
    let animationFrame = 0;


    // ========================================================
    // BASELINE
    // ========================================================

    let baseline:
      | Baseline
      | null = null;

    let calibrationCount =
      0;


    // ========================================================
    // PREVIOUS POSITIONS
    // ========================================================

    let previousNoseY:
      number | null = null;

    let previousHipX:
      number | null = null;


    // ========================================================
    // HORIZONTAL MOVEMENT
    // ========================================================

    let horizontalLean = 0;


    // ========================================================
    // JUMP STATE
    // ========================================================

    let jumpActive =
      false;

    let jumpUpFrames =
      0;

    let lastJump =
      -Infinity;


    // ========================================================
    // SQUAT STATE
    // ========================================================

    let squatActive =
      false;

    let squatDownFrames =
      0;

    let lastSquat =
      -Infinity;


    // ========================================================
    // REACH STATE
    // ========================================================

    let lastReach =
      -Infinity;


    // ========================================================
    // MAIN LOOP
    // ========================================================

    function tick(
      now: number
    ) {
      const next: MovementState = {
        ...EMPTY_MOVEMENT,
      };


      // ======================================================
      // DEMO MODE
      // ======================================================

      if (
        mode === "demo"
      ) {
        const k =
          keys.current;


        next.lean =
          (k.right ? 1 : 0) -
          (k.left ? 1 : 0);


        next.squatHeld =
          k.squat;

        next.squatTriggered =
          k.squat;


        next.reachHeld =
          k.reach;

        next.reachTriggered =
          k.reach;


        if (
          k.space
        ) {
          next.jumpTriggered =
            true;

          /*
           * One keyboard press =
           * one jump.
           */
          k.space =
            false;
        }


        movementRef.current =
          next;

        animationFrame =
          requestAnimationFrame(
            tick
          );

        return;
      }


      // ======================================================
      // CAMERA MODE
      // ======================================================

      const sample =
        poseRef.current;


      /*
       * Don't create movement when there is no reliable
       * upper-body pose.
       */
      if (
        !sample ||
        !hasReliablePose(
          sample
        )
      ) {
        movementRef.current =
          next;

        animationFrame =
          requestAnimationFrame(
            tick
          );

        return;
      }


      // ======================================================
      // LANDMARKS
      // ======================================================

      const hipX =
        average(
          sample.leftHip.x,
          sample.rightHip.x
        );


      const hipY =
        average(
          sample.leftHip.y,
          sample.rightHip.y
        );


      const shoulderY =
        average(
          sample.leftShoulder.y,
          sample.rightShoulder.y
        );


      const noseY =
        sample.nose.y;


      const leftAnkleY =
        sample.leftAnkle.y;


      const rightAnkleY =
        sample.rightAnkle.y;


      const footY =
        average(
          leftAnkleY,
          rightAnkleY
        );


      // ======================================================
      // UPPER BODY POSITION
      // ======================================================

      /*
       * This is the important part for squat.
       *
       * We combine:
       *
       *     HEAD
       *     LEFT SHOULDER
       *     RIGHT SHOULDER
       *
       * So the squat detector doesn't depend on the
       * patient's hips being visible.
       */
      const upperBodyY =
        (
          noseY +
          shoulderY
        ) / 2;


      // ======================================================
      // BODY HEIGHT
      // ======================================================

      const bodyHeight =
        Math.max(
          0.20,

          Math.abs(
            footY -
              average(
                noseY,
                hipY
              )
          )
        );


      // ======================================================
      // CALIBRATION
      // ======================================================

      if (
        !baseline
      ) {
        baseline = {
          noseY,

          shoulderY,

          upperBodyY,

          hipY,

          hipX,

          bodyHeight,
        };

        calibrationCount =
          1;
      }

      else if (
        calibrationCount <
        CALIBRATION_FRAMES
      ) {
        /*
         * Slowly build a stable standing baseline.
         */
        baseline.noseY =
          lerp(
            baseline.noseY,
            noseY,
            0.15
          );


        baseline.shoulderY =
          lerp(
            baseline.shoulderY,
            shoulderY,
            0.15
          );


        baseline.upperBodyY =
          lerp(
            baseline.upperBodyY,
            upperBodyY,
            0.15
          );


        baseline.hipY =
          lerp(
            baseline.hipY,
            hipY,
            0.15
          );


        baseline.hipX =
          lerp(
            baseline.hipX,
            hipX,
            0.15
          );


        baseline.bodyHeight =
          lerp(
            baseline.bodyHeight,
            bodyHeight,
            0.15
          );


        calibrationCount +=
          1;
      }


      // ======================================================
      // NORMALIZED SCALE
      // ======================================================

      const scale =
        Math.max(
          0.25,
          baseline.bodyHeight
        );


      // ======================================================
      // LEFT / RIGHT
      // ======================================================

      const centeredX =
        hipX -
        baseline.hipX;


      const normalizedX =
        centeredX /
        LEFT_RIGHT_RANGE;


      const targetLean =
        clamp(
          Math.abs(
            normalizedX
          ) <
            LEFT_RIGHT_DEADZONE
            ? 0
            : normalizedX,

          -1,
          1
        );


      /*
       * Much faster than before.
       */
      horizontalLean =
        lerp(
          horizontalLean,
          targetLean,
          LEFT_RIGHT_SMOOTHING
        );


      next.lean =
        horizontalLean;


      // ======================================================
      // JUMP DETECTION
      // ======================================================

      /*
       * IMPORTANT:
       *
       * We ONLY look at the head/nose.
       *
       * No:
       *
       *     hip jump
       *     shoulder jump
       *     foot jump
       *     ankle jump
       *     combined jump
       *
       * can trigger a jump anymore.
       *
       * Smaller Y = higher on camera.
       */
      const headRise =
        baseline.noseY -
        noseY;


      const normalizedHeadRise =
        headRise /
        scale;


      // ======================================================
      // FRAME-TO-FRAME HEAD MOVEMENT
      // ======================================================

      const headMovingUp =
        previousNoseY !==
          null &&
        previousNoseY -
          noseY >
          0.0015;


      // ======================================================
      // JUMP SIGNAL
      // ======================================================

      const headJumpSignal =
        normalizedHeadRise >=
          JUMP_HEAD_RISE &&
        headMovingUp;


      // ======================================================
      // JUMP START
      // ======================================================

      if (
        !jumpActive
      ) {
        if (
          headJumpSignal
        ) {
          jumpUpFrames +=
            1;
        } else {
          /*
           * Slowly reduce confirmation.
           */
          jumpUpFrames =
            Math.max(
              0,
              jumpUpFrames -
                1
            );
        }


        if (
          jumpUpFrames >=
            JUMP_CONFIRM_FRAMES &&
          now -
            lastJump >=
            JUMP_COOLDOWN
        ) {
          /*
           * This is the ONLY camera jump event.
           */
          next.jumpTriggered =
            true;


          lastJump =
            now;


          jumpActive =
            true;


          jumpUpFrames =
            0;
        }
      }


      // ======================================================
      // JUMP RELEASE
      // ======================================================

      else {
        /*
         * The head must return close to its standing
         * position before another jump is allowed.
         */
        const returnedToStanding =
          Math.abs(
            normalizedHeadRise
          ) <=
          JUMP_RELEASE;


        if (
          returnedToStanding
        ) {
          jumpActive =
            false;
        }
      }


      // ======================================================
      // SQUAT DETECTION
      // ======================================================

      /*
       * Calculate how far the combined upper body moved
       * DOWN from the standing baseline.
       *
       * Camera coordinates:
       *
       *     larger Y = lower on screen
       */
      const upperBodyDrop =
        upperBodyY -
        baseline.upperBodyY;


      const normalizedUpperBodyDrop =
        upperBodyDrop /
        scale;


      /*
       * We also look at the shoulders.
       *
       * This makes sure that we're detecting an actual
       * lowering of the upper body rather than only a
       * tiny head movement.
       */
      const shoulderDrop =
        shoulderY -
        baseline.shoulderY;


      const normalizedShoulderDrop =
        shoulderDrop /
        scale;


      /*
       * FINAL SQUAT CONDITION
       *
       * Both the upper body AND shoulders must move
       * clearly downward.
       *
       * This makes squat much easier to perform than
       * trying to detect hidden hips/knees.
       */
      const squatPosition =
        normalizedUpperBodyDrop >=
          SQUAT_DEPTH &&

        normalizedShoulderDrop >=
          SQUAT_DEPTH * 0.35;


      // ======================================================
      // SQUAT START
      // ======================================================

      if (
        !squatActive
      ) {
        if (
          squatPosition
        ) {
          squatDownFrames +=
            1;
        } else {
          squatDownFrames =
            Math.max(
              0,
              squatDownFrames -
                1
            );
        }


        if (
          squatDownFrames >=
            SQUAT_CONFIRM_FRAMES &&
          now -
            lastSquat >=
            SQUAT_COOLDOWN
        ) {
          next.squatTriggered =
            true;


          next.squatHeld =
            true;


          lastSquat =
            now;


          squatActive =
            true;


          squatDownFrames =
            0;
        }
      }


      // ======================================================
      // SQUAT HOLD / RELEASE
      // ======================================================

      else {
        /*
         * Keep squatHeld true while the patient remains
         * clearly down.
         */
        next.squatHeld =
          squatPosition;


        /*
         * When the upper body comes back near standing,
         * the squat is released.
         */
        const returnedToStanding =
          normalizedUpperBodyDrop <=
          SQUAT_RELEASE;


        if (
          returnedToStanding
        ) {
          squatActive =
            false;

          squatDownFrames =
            0;
        }
      }


      // ======================================================
      // HANDS ABOVE SHOULDERS
      // ======================================================

      /*
       * KEEPING YOUR WORKING HAND DETECTION.
       *
       * Either hand above its corresponding shoulder
       * counts.
       */
      const leftHandUp =
        (
          sample.leftWrist
            .visibility ??
          0
        ) >=
          0.4 &&

        sample.leftWrist.y <
          sample.leftShoulder.y;


      const rightHandUp =
        (
          sample.rightWrist
            .visibility ??
          0
        ) >=
          0.4 &&

        sample.rightWrist.y <
          sample.rightShoulder.y;


      const handRaised =
        leftHandUp ||
        rightHandUp;


      if (
        handRaised &&
        now -
          lastReach >=
          REACH_COOLDOWN
      ) {
        next.reachTriggered =
          true;


        next.reachHeld =
          true;


        lastReach =
          now;
      } else {
        next.reachHeld =
          handRaised;
      }


      // ======================================================
      // PREVIOUS VALUES
      // ======================================================

      previousNoseY =
        noseY;

      previousHipX =
        hipX;


      // ======================================================
      // BASELINE ADAPTATION
      // ======================================================

      /*
       * IMPORTANT:
       *
       * We do NOT let the baseline follow the patient
       * while they are jumping or squatting.
       *
       * Otherwise the detector could slowly decide that
       * the new position is "normal".
       */
      if (
        !jumpActive &&
        !squatActive &&
        calibrationCount >=
          CALIBRATION_FRAMES
      ) {
        baseline.noseY =
          lerp(
            baseline.noseY,
            noseY,
            0.004
          );


        baseline.shoulderY =
          lerp(
            baseline.shoulderY,
            shoulderY,
            0.004
          );


        baseline.upperBodyY =
          lerp(
            baseline.upperBodyY,
            upperBodyY,
            0.004
          );


        baseline.hipY =
          lerp(
            baseline.hipY,
            hipY,
            0.004
          );


        baseline.hipX =
          lerp(
            baseline.hipX,
            hipX,
            0.004
          );


        baseline.bodyHeight =
          lerp(
            baseline.bodyHeight,
            bodyHeight,
            0.004
          );
      }


      // ======================================================
      // SAVE MOVEMENT
      // ======================================================

      movementRef.current =
        next;


      animationFrame =
        requestAnimationFrame(
          tick
        );
    }


    animationFrame =
      requestAnimationFrame(
        tick
      );


    return () => {
      cancelAnimationFrame(
        animationFrame
      );
    };
  }, [mode]);


  return movementRef;
}


// ============================================================
// POSE RELIABILITY
// ============================================================

function hasReliablePose(
  sample: PoseSample
) {
  /*
   * We primarily need the upper body.
   *
   * This is important because ankles may disappear
   * when clothing or camera framing makes them hard
   * to detect.
   */
  const upperBodyPoints = [
    sample.nose,

    sample.leftShoulder,
    sample.rightShoulder,

    sample.leftHip,
    sample.rightHip,
  ];


  const upperBodyVisible =
    upperBodyPoints.every(
      (point) =>
        (
          point.visibility ??
          0
        ) >=
        0.30
    );


  /*
   * Ankles are optional.
   *
   * We do NOT require them for movement recognition.
   */
  return upperBodyVisible;
}


// ============================================================
// HELPERS
// ============================================================

function average(
  a: number,
  b: number
) {
  return (
    a + b
  ) / 2;
}


function lerp(
  a: number,
  b: number,
  amount: number
) {
  return (
    a +
    (b - a) *
      amount
  );
}


function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.max(
    min,
    Math.min(
      max,
      value
    )
  );
}