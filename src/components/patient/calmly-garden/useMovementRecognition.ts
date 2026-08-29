"use client";

import { useEffect, useRef } from "react";
import type {
  InputMode,
  MovementState,
  PoseSample,
} from "./types";
import { EMPTY_MOVEMENT } from "./types";

/*
 * ============================================================
 * CALMLY - MOVEMENT RECOGNITION
 * ============================================================
 *
 * HANDS:
 *   Hand-above-shoulder detection remains sensitive.
 *
 * LEFT / RIGHT:
 *   Uses hip-center movement.
 *
 * JUMP:
 *   VERY therapy-friendly.
 *
 *   A jump can be detected from:
 *     1. Hip moving upward
 *     2. Body moving upward
 *     3. One/both feet moving upward
 *     4. A noticeable change from the standing baseline
 *
 *   Feet are NOT required to be perfectly visible.
 *
 *   IMPORTANT:
 *   Recognition is intentionally easy.
 *   Game scoring is handled separately by GardenGame.
 *
 * SQUAT:
 *   Uses downward hip movement while the feet stay planted.
 */

// ============================================================
// LEFT / RIGHT
// ============================================================

const LEFT_RIGHT_DEADZONE = 0.035;
const LEFT_RIGHT_RANGE = 0.22;
const LEFT_RIGHT_SMOOTHING = 0.18;

// ============================================================
// JUMP
// ============================================================

/*
 * Prevents one jump from creating many jump events.
 */
const JUMP_COOLDOWN = 550;

/*
 * After a jump has been detected, the patient must return
 * approximately to standing before another jump can happen.
 */
const JUMP_RELEASE = 0.012;

/*
 * VERY SMALL movement can trigger a jump.
 *
 * These values are normalized against body size.
 */
const JUMP_HIP_RISE = 0.012;
const JUMP_BODY_RISE = 0.009;
const JUMP_FOOT_RISE = 0.010;

/*
 * Frame-to-frame upward movement.
 *
 * This is deliberately tiny.
 */
const JUMP_UPWARD_SPEED = 0.0012;

/*
 * Only one frame is needed.
 *
 * This is intentional for therapy patients.
 */
const JUMP_CONFIRM_FRAMES = 1;

// ============================================================
// SQUAT
// ============================================================

const SQUAT_COOLDOWN = 650;

const SQUAT_DEPTH = 0.045;

const SQUAT_RELEASE = 0.022;

const SQUAT_CONFIRM_FRAMES = 3;

// ============================================================
// HANDS
// ============================================================

const REACH_COOLDOWN = 500;

// ============================================================
// CALIBRATION
// ============================================================

const CALIBRATION_FRAMES = 12;

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
  hipY: number;

  shoulderY: number;

  leftAnkleY: number;

  rightAnkleY: number;

  footY: number;

  bodyHeight: number;

  hipX: number;
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
    if (mode !== "demo") {
      return;
    }

    function keyDown(
      e: KeyboardEvent
    ) {
      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          keys.current.left =
            true;
          break;

        case "ArrowRight":
        case "d":
        case "D":
          keys.current.right =
            true;
          break;

        case " ":
        case "Spacebar":
          if (!e.repeat) {
            keys.current.space =
              true;
          }

          e.preventDefault();
          break;

        case "s":
        case "S":
          keys.current.squat =
            true;

          e.preventDefault();
          break;

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
    // CALIBRATION
    // ========================================================

    let baseline:
      | Baseline
      | null = null;

    let calibrationCount = 0;

    // ========================================================
    // PREVIOUS POSITIONS
    // ========================================================

    let previousHipY:
      number | null = null;

    let previousFootY:
      number | null = null;

    let previousShoulderY:
      number | null = null;

    // ========================================================
    // HORIZONTAL SMOOTHING
    // ========================================================

    let horizontalLean = 0;

    // ========================================================
    // JUMP STATE
    // ========================================================

    let jumpActive = false;

    let jumpUpFrames = 0;

    let lastJump = -Infinity;

    // ========================================================
    // SQUAT STATE
    // ========================================================

    let squatActive = false;

    let squatDownFrames = 0;

    let lastSquat = -Infinity;

    // ========================================================
    // REACH STATE
    // ========================================================

    let lastReach = -Infinity;

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

        if (k.space) {
          next.jumpTriggered =
            true;

          /*
           * One keyboard press = one jump.
           */
          k.space = false;
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
       * If no person is detected, don't generate movement.
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
      // BODY HEIGHT
      // ======================================================

      const bodyHeight =
        Math.max(
          0.20,

          Math.abs(
            footY -
              average(
                sample.nose.y,
                hipY
              )
          )
        );

      // ======================================================
      // CALIBRATION
      // ======================================================

      if (!baseline) {
        baseline = {
          hipY,

          shoulderY,

          leftAnkleY,

          rightAnkleY,

          footY,

          bodyHeight,

          hipX,
        };

        calibrationCount =
          1;
      } else if (
        calibrationCount <
        CALIBRATION_FRAMES
      ) {
        /*
         * Slowly build a stable standing baseline.
         */
        baseline.hipY =
          lerp(
            baseline.hipY,
            hipY,
            0.18
          );

        baseline.shoulderY =
          lerp(
            baseline.shoulderY,
            shoulderY,
            0.18
          );

        baseline.leftAnkleY =
          lerp(
            baseline.leftAnkleY,
            leftAnkleY,
            0.18
          );

        baseline.rightAnkleY =
          lerp(
            baseline.rightAnkleY,
            rightAnkleY,
            0.18
          );

        baseline.footY =
          lerp(
            baseline.footY,
            footY,
            0.18
          );

        baseline.bodyHeight =
          lerp(
            baseline.bodyHeight,
            bodyHeight,
            0.18
          );

        baseline.hipX =
          lerp(
            baseline.hipX,
            hipX,
            0.18
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
       * CAMERA COORDINATES:
       *
       * Smaller Y = higher on screen.
       *
       * Therefore:
       *
       * baselineY - currentY
       *
       * is upward movement.
       */

      const hipRise =
        baseline.hipY -
        hipY;

      const shoulderRise =
        baseline.shoulderY -
        shoulderY;

      const footRise =
        baseline.footY -
        footY;

      const leftFootRise =
        baseline.leftAnkleY -
        leftAnkleY;

      const rightFootRise =
        baseline.rightAnkleY -
        rightAnkleY;

      // ======================================================
      // NORMALIZED BODY MOVEMENT
      // ======================================================

      const normalizedHipRise =
        hipRise /
        scale;

      const normalizedShoulderRise =
        shoulderRise /
        scale;

      const normalizedFootRise =
        footRise /
        scale;

      const normalizedLeftFootRise =
        leftFootRise /
        scale;

      const normalizedRightFootRise =
        rightFootRise /
        scale;

      // ======================================================
      // FRAME-TO-FRAME MOVEMENT
      // ======================================================

      const hipMovingUp =
        previousHipY !==
          null &&
        previousHipY -
          hipY >=
          JUMP_UPWARD_SPEED;

      const shoulderMovingUp =
        previousShoulderY !==
          null &&
        previousShoulderY -
          shoulderY >=
          JUMP_UPWARD_SPEED;

      const feetMovingUp =
        previousFootY !==
          null &&
        previousFootY -
          footY >=
          JUMP_UPWARD_SPEED;

      // ======================================================
      // EASY JUMP CONDITIONS
      // ======================================================

      /*
       * CONDITION 1:
       *
       * Hips rise.
       *
       * This is now the MAIN jump detector.
       *
       * Feet are NOT required.
       */
      const hipJump =
        normalizedHipRise >=
        JUMP_HIP_RISE;

      /*
       * CONDITION 2:
       *
       * The upper body moves upward.
       */
      const bodyJump =
        normalizedShoulderRise >=
          JUMP_BODY_RISE &&
        (
          hipMovingUp ||
          shoulderMovingUp
        );

      /*
       * CONDITION 3:
       *
       * Feet move upward.
       */
      const footJump =
        normalizedFootRise >=
          JUMP_FOOT_RISE &&
        feetMovingUp;

      /*
       * CONDITION 4:
       *
       * One foot rises noticeably.
       *
       * This helps when one ankle is tracked better than
       * the other.
       */
      const oneFootJump =
        (
          normalizedLeftFootRise >=
            JUMP_FOOT_RISE &&
          leftFootRise >
            0
        )
        ||
        (
          normalizedRightFootRise >=
            JUMP_FOOT_RISE &&
          rightFootRise >
            0
        );

      /*
       * CONDITION 5:
       *
       * A combination of small body + foot movement.
       */
      const combinedJump =
        (
          normalizedHipRise >=
            JUMP_HIP_RISE * 0.65
        ) &&
        (
          normalizedFootRise >=
            JUMP_FOOT_RISE * 0.45
        );

      // ======================================================
      // FINAL EASY JUMP SIGNAL
      // ======================================================

      /*
       * ANY ONE of these can start the jump.
       *
       * This is intentionally forgiving.
       */
      const easyJumpSignal =
        hipJump ||
        bodyJump ||
        footJump ||
        oneFootJump ||
        combinedJump;

      // ======================================================
      // JUMP EVENT
      // ======================================================

      if (!jumpActive) {
        if (
          easyJumpSignal
        ) {
          jumpUpFrames +=
            1;
        } else {
          /*
           * Don't instantly forget the movement.
           *
           * This gives pose estimation a little tolerance.
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
           * THIS is what GardenGame receives.
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
         * Once the body comes back close to the baseline,
         * the next jump can be detected.
         *
         * This is deliberately more forgiving than the
         * detection threshold.
         */
        const backToGround =
          Math.abs(
            normalizedHipRise
          ) <=
          JUMP_RELEASE;

        if (
          backToGround
        ) {
          jumpActive =
            false;
        }
      }

      // ======================================================
      // SQUAT
      // ======================================================

      const hipDrop =
        hipY -
        baseline.hipY;

      const shoulderDrop =
        shoulderY -
        baseline.shoulderY;

      /*
       * Feet should remain near the standing position.
       */
      const feetStill =
        Math.abs(
          footY -
            baseline.footY
        ) <
        0.035;

      /*
       * Squat depth is normalized against body size.
       */
      const squatDepth =
        hipDrop /
          scale >=
          SQUAT_DEPTH &&
        shoulderDrop /
          scale >=
          SQUAT_DEPTH *
            0.35 &&
        feetStill;

      if (!squatActive) {
        if (
          squatDepth
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
      } else {
        next.squatHeld =
          squatDepth;

        /*
         * Patient has returned upward.
         */
        if (
          hipDrop /
            scale <=
          SQUAT_RELEASE
        ) {
          squatActive =
            false;
        }
      }

      // ======================================================
      // HANDS ABOVE SHOULDERS
      // ======================================================

      /*
       * This part stays sensitive because you said hand
       * recognition is already good.
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

      if (
        (
          leftHandUp ||
          rightHandUp
        ) &&
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
          leftHandUp ||
          rightHandUp;
      }

      // ======================================================
      // PREVIOUS VALUES
      // ======================================================

      previousHipY =
        hipY;

      previousFootY =
        footY;

      previousShoulderY =
        shoulderY;

      // ======================================================
      // BASELINE ADAPTATION
      // ======================================================

      /*
       * Only adapt while the patient is relatively still.
       *
       * This prevents the baseline from following the jump.
       */
      if (
        !jumpActive &&
        !squatActive &&
        calibrationCount >=
          CALIBRATION_FRAMES
      ) {
        baseline.hipY =
          lerp(
            baseline.hipY,
            hipY,
            0.006
          );

        baseline.shoulderY =
          lerp(
            baseline.shoulderY,
            shoulderY,
            0.006
          );

        baseline.footY =
          lerp(
            baseline.footY,
            footY,
            0.004
          );

        baseline.leftAnkleY =
          lerp(
            baseline.leftAnkleY,
            leftAnkleY,
            0.004
          );

        baseline.rightAnkleY =
          lerp(
            baseline.rightAnkleY,
            rightAnkleY,
            0.004
          );

        baseline.bodyHeight =
          lerp(
            baseline.bodyHeight,
            bodyHeight,
            0.006
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
   * IMPORTANT CHANGE:
   *
   * We no longer require both ankles to have strong
   * visibility.
   *
   * Feet can disappear briefly and the jump detector
   * can still use hip/body movement.
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
   * At least ONE ankle should be somewhat visible.
   *
   * But ankles are no longer mandatory.
   *
   * This makes the camera much more forgiving.
   */
  const leftAnkleVisible =
    (
      sample.leftAnkle
        .visibility ??
      0
    ) >=
    0.15;

  const rightAnkleVisible =
    (
      sample.rightAnkle
        .visibility ??
      0
    ) >=
    0.15;

  const atLeastOneAnkle =
    leftAnkleVisible ||
    rightAnkleVisible;

  /*
   * Upper body is enough for jump recognition.
   *
   * This is especially important when the camera cannot
   * clearly see the patient's feet.
   */
  return (
    upperBodyVisible ||
    atLeastOneAnkle
  );
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