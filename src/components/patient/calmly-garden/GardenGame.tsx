"use client";

import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import type {
  CollectibleKind,
  GardenStats,
  MovementState,
} from "./types";
import { EMPTY_STATS } from "./types";

const PALETTE = {
  skyTop: "#F4EBD8",
  skyBottom: "#DCE8D6",
  hillFar: "#C7D6BE",
  hillMid: "#A9BE9C",
  hillNear: "#8CA37E",
  trunk: "#3F4A38",
  sun: "#F6DFC0",
  character: "#8CA37E",
  characterDark: "#3F4A38",
  seed: "#B98A4E",
  star: "#E8C468",
  butterfly: "#C9A9D9",
  bloom: "#E7A9B0",
  sparkle: "#FFFFFF",
};

const LOGICAL_W = 800;
const LOGICAL_H = 450;
const GROUND_Y = LOGICAL_H - 90;

const SCROLL_SPEED = 90;
const RESTORE_HOLD_RATE = 6;

type Collectible = {
  id: number;
  kind: CollectibleKind;
  x: number;
  y: number;
  collected: boolean;
  bornAt: number;
};

type Sparkle = {
  x: number;
  y: number;
  life: number;
  color: string;
};

type Bloom = {
  x: number;
  y: number;
  scale: number;
};

export default function GardenGame({
  movementRef,
  targetSeconds,
  finishSignal,
  onStatsTick,
  onFinish,
}: {
  movementRef: MutableRefObject<MovementState>;
  targetSeconds: number;
  finishSignal: number;
  onStatsTick: (stats: GardenStats) => void;
  onFinish: (stats: GardenStats) => void;
}) {
  const canvasRef =
    useRef<HTMLCanvasElement | null>(null);

  const containerRef =
    useRef<HTMLDivElement | null>(null);

  const statsRef =
    useRef<GardenStats>({
      ...EMPTY_STATS,
    });

  const finishedRef =
    useRef(false);

  const finishSignalRef =
    useRef(finishSignal);

  const lastSeenFinishSignal =
    useRef(finishSignal);

  finishSignalRef.current =
    finishSignal;

  useEffect(() => {
    const canvas =
      canvasRef.current;

    const rawCtx =
      canvas?.getContext("2d");

    if (!canvas || !rawCtx) {
      return;
    }

    const ctx: CanvasRenderingContext2D =
      rawCtx;

    let animationFrame: number;

    let lastTime =
      performance.now();

    let lastStatsEmit =
      performance.now();

    let nextCollectibleId = 1;

    let spawnTimer = 0;

    const collectibles: Collectible[] =
      [];

    const sparkles: Sparkle[] =
      [];

    const blooms: Bloom[] =
      [];

    // ========================================================
    // CHARACTER
    // ========================================================

    let charX =
      LOGICAL_W / 2;

    let charY =
      GROUND_Y;

    // ========================================================
    // JUMP PHYSICS
    // ========================================================

    let charVy = 0;

    let isAirborne = false;

    /*
     * "small" = therapy-friendly camera jump / SPACE
     *
     * "high" = W / reach jump
     */
    let jumpType:
      | "small"
      | "high"
      | null = null;

    // ========================================================
    // RESIZE
    // ========================================================

    const resize = () => {
      const container =
        containerRef.current;

      if (!container) {
        return;
      }

      const width =
        container.clientWidth;

      const scale =
        width / LOGICAL_W;

      canvas.style.height =
        `${LOGICAL_H * scale}px`;
    };

    resize();

    const resizeObserver =
      new ResizeObserver(
        resize
      );

    if (containerRef.current) {
      resizeObserver.observe(
        containerRef.current
      );
    }

    // ========================================================
    // SPAWN COLLECTIBLES
    // ========================================================

    function spawnCollectible(
      kind: CollectibleKind
    ) {
      const yByKind:
        Record<
          CollectibleKind,
          number
        > = {
        seed:
          GROUND_Y - 10,

        butterfly:
          GROUND_Y - 90,

        star:
          GROUND_Y - 190,
      };

      collectibles.push({
        id:
          nextCollectibleId++,

        kind,

        x:
          LOGICAL_W + 30,

        y:
          yByKind[kind] +
          (
            Math.random() *
            20 -
            10
          ),

        collected: false,

        bornAt:
          performance.now(),
      });
    }

    // ========================================================
    // SPARKLES
    // ========================================================

    function addSparkles(
      x: number,
      y: number,
      color: string
    ) {
      for (
        let i = 0;
        i < 6;
        i++
      ) {
        sparkles.push({
          x,
          y,
          life: 1,
          color,
        });
      }
    }

    // ========================================================
    // MAIN GAME LOOP
    // ========================================================

    function tick(
      now: number
    ) {
      const dt =
        Math.min(
          (
            now -
            lastTime
          ) / 1000,
          0.05
        );

      lastTime = now;

      const movement =
        movementRef.current;

      statsRef.current.sessionSeconds +=
        dt;

      // ======================================================
      // HORIZONTAL MOVEMENT
      // ======================================================

      const targetX =
        LOGICAL_W / 2 +
        movement.lean *
          (
            LOGICAL_W / 2 -
            70
          );

      charX +=
        (
          targetX -
          charX
        ) *
        Math.min(
          dt * 4,
          1
        );

      // ======================================================
      // SQUAT
      // ======================================================

      /*
       * The character remains squatting while the movement
       * detector says squatHeld.
       *
       * squatTriggered also allows a single squat event.
       */
      const isSquatting =
        movement.squatHeld ||
        movement.squatTriggered;

      // ======================================================
      // SMALL JUMP
      // ======================================================

      /*
       * Camera jump detection is intentionally easy.
       *
       * useMovementRecognition.ts decides when the patient
       * has made a small jump-like movement.
       *
       * GardenGame turns that signal into actual game physics.
       */
      if (
        movement.jumpTriggered &&
        !isAirborne
      ) {
        charVy = -180;

        isAirborne = true;

        jumpType = "small";
      }

      // ======================================================
      // HIGH JUMP
      // ======================================================

      /*
       * Reach / W still produces the higher jump.
       */
      else if (
        (
          movement.reachTriggered ||
          movement.reachHeld
        ) &&
        !isAirborne
      ) {
        charVy = -350;

        isAirborne = true;

        jumpType = "high";
      }

      // ======================================================
      // JUMP PHYSICS
      // ======================================================

      if (isAirborne) {
        /*
         * Gravity.
         */
        charVy +=
          650 * dt;

        /*
         * Move character vertically.
         */
        charY +=
          charVy * dt;

        /*
         * Land.
         */
        if (
          charY >=
          GROUND_Y
        ) {
          charY =
            GROUND_Y;

          charVy = 0;

          isAirborne =
            false;

          jumpType =
            null;
        }
      }

      // ======================================================
      // RESTORE GARDEN
      // ======================================================

      /*
       * Squatting or reaching slowly restores the garden.
       */
      if (
        movement.squatHeld ||
        movement.reachHeld
      ) {
        const before =
          statsRef.current
            .restoredPercent;

        statsRef.current
          .restoredPercent =
          Math.min(
            100,

            statsRef.current
              .restoredPercent +
              RESTORE_HOLD_RATE *
              dt
          );

        /*
         * Every 5% creates a flower.
         */
        if (
          Math.floor(
            statsRef.current
              .restoredPercent /
              5
          ) >
          Math.floor(
            before / 5
          )
        ) {
          blooms.push({
            x:
              40 +
              Math.random() *
                (
                  LOGICAL_W -
                  80
                ),

            y:
              GROUND_Y +
              20 +
              Math.random() *
                40,

            scale:
              0.6 +
              Math.random() *
                0.6,
          });
        }
      }

      // ======================================================
      // SPAWN ITEMS
      // ======================================================

      spawnTimer -= dt;

      if (
        spawnTimer <= 0
      ) {
        const kinds:
          CollectibleKind[] = [
            "seed",
            "star",
            "butterfly",
          ];

        const randomKind =
          kinds[
            Math.floor(
              Math.random() *
                kinds.length
            )
          ];

        spawnCollectible(
          randomKind
        );

        spawnTimer =
          1.4 +
          Math.random() *
            1.2;
      }

      // ======================================================
      // CHARACTER HITBOX
      // ======================================================

      const charBox = {
        x:
          charX - 30,

        y:
          isSquatting
            ? charY - 45
            : charY - 80,

        w: 60,

        h:
          isSquatting
            ? 45
            : 80,
      };

      const charCenterX =
        charX;

      const charCenterY =
        charBox.y +
        charBox.h / 2;

      // ======================================================
      // COLLECTIBLES
      // ======================================================

      for (
        const item of collectibles
      ) {
        if (
          item.collected
        ) {
          continue;
        }

        /*
         * Move item toward the player.
         */
        item.x -=
          SCROLL_SPEED *
          dt;

        // ====================================================
        // HORIZONTAL COLLISION
        // ====================================================

        /*
         * Butterfly gets a smaller horizontal collision
         * window so easier jump detection doesn't mean
         * automatic scoring.
         */
        const isCloseX =
          Math.abs(
            item.x -
              charCenterX
          ) <
          (
            item.kind ===
            "butterfly"
              ? 42
              : 65
          );

        // ====================================================
        // VERTICAL COLLISION
        // ====================================================

        let isCloseY =
          false;

        // ----------------------------------------------------
        // SEED
        // ----------------------------------------------------

        if (
          item.kind ===
          "seed"
        ) {
          isCloseY =
            Math.abs(
              item.y -
                charCenterY
            ) <
            100;
        }

        // ----------------------------------------------------
        // BUTTERFLY
        // ----------------------------------------------------

        if (
          item.kind ===
          "butterfly"
        ) {
          /*
           * IMPORTANT:
           *
           * The camera may recognize a tiny jump.
           *
           * But the butterfly requires:
           *
           * 1. Character actually airborne
           * 2. Correct vertical position
           * 3. Correct horizontal position
           *
           * Therefore jump recognition is easy,
           * but scoring remains challenging.
           */
          isCloseY =
            isAirborne &&
            Math.abs(
              item.y -
                charCenterY
            ) <
            65;
        }

        // ----------------------------------------------------
        // STAR
        // ----------------------------------------------------

        if (
          item.kind ===
          "star"
        ) {
          isCloseY =
            Math.abs(
              item.y -
                charCenterY
            ) <
            220;
        }

        const near =
          isCloseX &&
          isCloseY;

        // ====================================================
        // EXACT CONTROLS
        //
        // S     -> SEED
        // SPACE -> BUTTERFLY
        // W     -> STAR
        // ====================================================

        const wantsPickup =
          // --------------------------------------------------
          // S = SEED
          // --------------------------------------------------
          (
            item.kind ===
              "seed" &&
            isSquatting
          )

          ||

          // --------------------------------------------------
          // SPACE / EASY CAMERA JUMP = BUTTERFLY
          // --------------------------------------------------
          (
            item.kind ===
              "butterfly" &&

            /*
             * IMPORTANT:
             *
             * We do NOT use movement.jumpTriggered here.
             *
             * The character has already received the jump
             * and is now physically airborne.
             */
            isAirborne &&

            jumpType ===
              "small"
          )

          ||

          // --------------------------------------------------
          // W / HIGH JUMP = STAR
          // --------------------------------------------------
          (
            item.kind ===
              "star" &&

            (
              movement.reachTriggered ||
              movement.reachHeld
            ) &&

            jumpType ===
              "high"
          );

        // ====================================================
        // COLLECT
        // ====================================================

        if (
          near &&
          wantsPickup
        ) {
          item.collected =
            true;

          // ==================================================
          // SPARKLES
          // ==================================================

          addSparkles(
            item.x,
            item.y,

            item.kind ===
              "seed"
              ? PALETTE.seed
              : item.kind ===
                  "star"
              ? PALETTE.star
              : PALETTE.butterfly
          );

          // ==================================================
          // SCORE
          // ==================================================

          if (
            item.kind ===
            "seed"
          ) {
            statsRef.current
              .seeds += 1;
          }

          if (
            item.kind ===
            "star"
          ) {
            statsRef.current
              .stars += 1;
          }

          if (
            item.kind ===
            "butterfly"
          ) {
            statsRef.current
              .butterflies += 1;
          }

          /*
           * Successful collection restores the garden.
           */
          statsRef.current
            .restoredPercent =
            Math.min(
              100,

              statsRef.current
                .restoredPercent +
                2.5
            );
        }
      }

      // ======================================================
      // REMOVE OLD ITEMS
      // ======================================================

      for (
        let i =
          collectibles.length -
          1;
        i >= 0;
        i--
      ) {
        if (
          collectibles[i]
            .collected ||
          collectibles[i].x <
            -40
        ) {
          collectibles.splice(
            i,
            1
          );
        }
      }

      // ======================================================
      // SPARKLE ANIMATION
      // ======================================================

      for (
        let i =
          sparkles.length -
          1;
        i >= 0;
        i--
      ) {
        sparkles[i].life -=
          dt * 1.6;

        sparkles[i].y -=
          dt * 30;

        if (
          sparkles[i].life <=
          0
        ) {
          sparkles.splice(
            i,
            1
          );
        }
      }

      // ======================================================
      // DRAW
      // ======================================================

      draw(ctx, {
        charX,
        charY,
        isAirborne,
        isSquatting,
        collectibles,
        sparkles,
        blooms,
        restoredPercent:
          statsRef.current
            .restoredPercent,
      });

      // ======================================================
      // SEND STATS
      // ======================================================

      if (
        now -
          lastStatsEmit >
        400
      ) {
        lastStatsEmit =
          now;

        onStatsTick({
          ...statsRef.current,
        });
      }

      // ======================================================
      // FINISH
      // ======================================================

      const finishRequested =
        finishSignalRef.current !==
        lastSeenFinishSignal.current;

      if (
        !finishedRef.current &&
        (
          statsRef.current
            .sessionSeconds >=
            targetSeconds ||
          finishRequested
        )
      ) {
        finishedRef.current =
          true;

        lastSeenFinishSignal.current =
          finishSignalRef.current;

        onFinish({
          ...statsRef.current,
        });

        return;
      }

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

      resizeObserver.disconnect();
    };
  }, [
    targetSeconds,
    movementRef,
    onStatsTick,
    onFinish,
  ]);

  return (
    <div
      ref={containerRef}
      className="w-full rounded-2xl overflow-hidden bg-green-soft"
    >
      <canvas
        ref={canvasRef}
        width={LOGICAL_W}
        height={LOGICAL_H}
        className="w-full block"
        aria-label="Calmly Garden — a peaceful world that grows as you move gently"
        role="img"
      />
    </div>
  );
}

// ============================================================
// DRAW EVERYTHING
// ============================================================

function draw(
  ctx: CanvasRenderingContext2D,
  state: {
    charX: number;
    charY: number;
    isAirborne: boolean;
    isSquatting: boolean;
    collectibles: Collectible[];
    sparkles: Sparkle[];
    blooms: Bloom[];
    restoredPercent: number;
  }
) {
  // ==========================================================
  // SKY
  // ==========================================================

  const sky =
    ctx.createLinearGradient(
      0,
      0,
      0,
      LOGICAL_H
    );

  sky.addColorStop(
    0,
    PALETTE.skyTop
  );

  sky.addColorStop(
    1,
    PALETTE.skyBottom
  );

  ctx.fillStyle =
    sky;

  ctx.fillRect(
    0,
    0,
    LOGICAL_W,
    LOGICAL_H
  );

  // ==========================================================
  // SUN
  // ==========================================================

  ctx.fillStyle =
    PALETTE.sun;

  ctx.globalAlpha =
    0.85;

  ctx.beginPath();

  ctx.arc(
    90,
    80,
    30,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.globalAlpha =
    1;

  // ==========================================================
  // HILLS
  // ==========================================================

  drawHill(
    ctx,
    GROUND_Y - 40,
    PALETTE.hillFar
  );

  drawHill(
    ctx,
    GROUND_Y - 10,
    PALETTE.hillMid
  );

  drawHill(
    ctx,
    GROUND_Y + 30,
    PALETTE.hillNear
  );

  // ==========================================================
  // FLOWERS
  // ==========================================================

  for (
    const bloom of state.blooms
  ) {
    drawBloom(
      ctx,
      bloom.x,
      bloom.y,
      bloom.scale
    );
  }

  // ==========================================================
  // COLLECTIBLES
  // ==========================================================

  for (
    const item of state.collectibles
  ) {
    drawCollectible(
      ctx,
      item
    );
  }

  // ==========================================================
  // CHARACTER
  // ==========================================================

  drawCharacter(
    ctx,
    state.charX,
    state.charY,
    state.isAirborne,
    state.isSquatting
  );

  // ==========================================================
  // SPARKLES
  // ==========================================================

  for (
    const sparkle of state.sparkles
  ) {
    ctx.globalAlpha =
      Math.max(
        sparkle.life,
        0
      );

    ctx.fillStyle =
      sparkle.color;

    ctx.beginPath();

    ctx.arc(
      sparkle.x,
      sparkle.y,
      3,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.globalAlpha =
      1;
  }
}

// ============================================================
// HILLS
// ============================================================

function drawHill(
  ctx: CanvasRenderingContext2D,
  baseY: number,
  color: string
) {
  ctx.fillStyle =
    color;

  ctx.beginPath();

  ctx.moveTo(
    0,
    LOGICAL_H
  );

  ctx.lineTo(
    0,
    baseY + 20
  );

  ctx.quadraticCurveTo(
    LOGICAL_W * 0.25,
    baseY - 30,
    LOGICAL_W * 0.5,
    baseY
  );

  ctx.quadraticCurveTo(
    LOGICAL_W * 0.75,
    baseY + 30,
    LOGICAL_W,
    baseY - 10
  );

  ctx.lineTo(
    LOGICAL_W,
    LOGICAL_H
  );

  ctx.closePath();

  ctx.fill();
}

// ============================================================
// FLOWERS
// ============================================================

function drawBloom(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number
) {
  ctx.save();

  ctx.translate(
    x,
    y
  );

  ctx.scale(
    scale,
    scale
  );

  ctx.fillStyle =
    PALETTE.bloom;

  for (
    let i = 0;
    i < 5;
    i++
  ) {
    ctx.beginPath();

    const angle =
      (i / 5) *
      Math.PI *
      2;

    ctx.ellipse(
      Math.cos(angle) * 6,
      Math.sin(angle) * 6,
      5,
      3.2,
      angle,
      0,
      Math.PI * 2
    );

    ctx.fill();
  }

  ctx.fillStyle =
    PALETTE.star;

  ctx.beginPath();

  ctx.arc(
    0,
    0,
    3.2,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.restore();
}

// ============================================================
// COLLECTIBLES
// ============================================================

function drawCollectible(
  ctx: CanvasRenderingContext2D,
  item: Collectible
) {
  ctx.save();

  ctx.translate(
    item.x,
    item.y
  );

  // ==========================================================
  // SEED
  // ==========================================================

  if (
    item.kind ===
    "seed"
  ) {
    ctx.fillStyle =
      PALETTE.seed;

    ctx.beginPath();

    ctx.ellipse(
      0,
      0,
      7,
      9,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();
  }

  // ==========================================================
  // STAR
  // ==========================================================

  else if (
    item.kind ===
    "star"
  ) {
    ctx.fillStyle =
      PALETTE.star;

    drawStar(
      ctx,
      0,
      0,
      5,
      10,
      4.5
    );
  }

  // ==========================================================
  // BUTTERFLY
  // ==========================================================

  else {
    const flap =
      Math.sin(
        performance.now() /
          120 +
          item.id
      ) * 6;

    ctx.fillStyle =
      PALETTE.butterfly;

    ctx.beginPath();

    ctx.ellipse(
      -6,
      flap * 0.2,
      7,
      5,
      0.3,
      0,
      Math.PI * 2
    );

    ctx.ellipse(
      6,
      -flap * 0.2,
      7,
      5,
      -0.3,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle =
      PALETTE.trunk;

    ctx.fillRect(
      -1,
      -4,
      2,
      8
    );
  }

  ctx.restore();
}

// ============================================================
// STAR
// ============================================================

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number
) {
  let rot =
    (Math.PI / 2) *
    3;

  const step =
    Math.PI /
    spikes;

  ctx.beginPath();

  ctx.moveTo(
    cx,
    cy - outerRadius
  );

  for (
    let i = 0;
    i < spikes;
    i++
  ) {
    ctx.lineTo(
      cx +
        Math.cos(rot) *
          outerRadius,

      cy +
        Math.sin(rot) *
          outerRadius
    );

    rot += step;

    ctx.lineTo(
      cx +
        Math.cos(rot) *
          innerRadius,

      cy +
        Math.sin(rot) *
          innerRadius
    );

    rot += step;
  }

  ctx.closePath();

  ctx.fill();
}

// ============================================================
// CHARACTER
// ============================================================

function drawCharacter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  airborne: boolean,
  isSquatting: boolean
) {
  ctx.save();

  ctx.translate(
    x,
    y
  );

  const bob =
    airborne
      ? -6
      : Math.sin(
          performance.now() /
            260
        ) * 3;

  ctx.translate(
    0,
    bob
  );

  // ==========================================================
  // SHADOW
  // ==========================================================

  ctx.fillStyle =
    "rgba(63,74,56,0.18)";

  ctx.beginPath();

  ctx.ellipse(
    0,
    6 - bob,

    isSquatting
      ? 28
      : 22,

    isSquatting
      ? 4
      : 6,

    0,
    0,
    Math.PI * 2
  );

  ctx.fill();

  // ==========================================================
  // BODY
  // ==========================================================

  ctx.fillStyle =
    PALETTE.characterDark;

  ctx.beginPath();

  if (
    isSquatting
  ) {
    ctx.ellipse(
      0,
      -16,
      26,
      16,
      0,
      0,
      Math.PI * 2
    );
  } else {
    ctx.ellipse(
      0,
      -30,
      20,
      28,
      0,
      0,
      Math.PI * 2
    );
  }

  ctx.fill();

  // ==========================================================
  // HEAD
  // ==========================================================

  ctx.fillStyle =
    PALETTE.character;

  ctx.beginPath();

  if (
    isSquatting
  ) {
    ctx.arc(
      0,
      -38,
      13,
      0,
      Math.PI * 2
    );
  } else {
    ctx.arc(
      0,
      -62,
      13,
      0,
      Math.PI * 2
    );
  }

  ctx.fill();

  ctx.restore();
}