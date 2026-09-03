// src/components/patient/calmly-garden/types.ts

export type MovementState = {
  lean: number;

  squatTriggered: boolean;
  reachTriggered: boolean;
  jumpTriggered: boolean;

  squatHeld: boolean;
  reachHeld: boolean;
};

export const EMPTY_MOVEMENT: MovementState = {
  lean: 0,

  squatTriggered: false,
  reachTriggered: false,
  jumpTriggered: false,

  squatHeld: false,
  reachHeld: false,
};

export type InputMode =
  | "camera"
  | "demo";

export type CollectibleKind =
  | "seed"
  | "star"
  | "butterfly";

export type GardenStats = {
  seeds: number;
  stars: number;
  butterflies: number;
  restoredPercent: number;
  sessionSeconds: number;
};

export const EMPTY_STATS: GardenStats = {
  seeds: 0,
  stars: 0,
  butterflies: 0,
  restoredPercent: 0,
  sessionSeconds: 0,
};

export type NormalizedPoint = {
  x: number;
  y: number;
  visibility?: number;
};

/*
 * Pose landmarks used by the movement detector.
 *
 * We intentionally keep the pose lightweight.
 *
 * IMPORTANT:
 * We do NOT use knees for squat detection.
 *
 * Squat is detected using:
 *
 *     HEAD + SHOULDERS
 *
 * moving downward from the standing baseline.
 *
 * Jump is detected using:
 *
 *     HEAD / NOSE
 *
 * moving upward from the standing baseline.
 */
export type PoseSample = {
  nose: NormalizedPoint;

  leftShoulder: NormalizedPoint;
  rightShoulder: NormalizedPoint;

  leftWrist: NormalizedPoint;
  rightWrist: NormalizedPoint;

  leftHip: NormalizedPoint;
  rightHip: NormalizedPoint;

  leftAnkle: NormalizedPoint;
  rightAnkle: NormalizedPoint;
};