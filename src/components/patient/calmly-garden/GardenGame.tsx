// src/components/patient/GardenGame.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import {
  Sparkles,
  Sprout,
  Leaf,
  Star,
  ArrowLeftRight,
  ArrowBigUp,
  ChevronsUp,
  ChevronsDown,
} from "lucide-react";
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

type Sparkle = { x: number; y: number; life: number; color: string };
type Bloom = { x: number; y: number; scale: number };

function IconFinish({ className = "" }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M5 3v18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M5 4h11l-2.2 3L16 10H5V4Z" fill="currentColor" />
    </svg>
  );
}

function StatBadge({
  icon,
  value,
  label,
}: {
  icon: JSX.Element;
  value: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-white/70 border border-green/20 shadow-sm px-4 py-2">
      {icon}
      <span className="font-body font-semibold text-heading text-sm">{value}</span>
      <span className="font-body text-text/60 text-sm">{label}</span>
    </div>
  );
}

export default function GardenGame({
  movementRef,
  targetSeconds,
  finishSignal,
  onStatsTick,
  onFinish,
  onBack,
}: {
  movementRef: MutableRefObject<MovementState>;
  targetSeconds: number;
  finishSignal: number;
  onStatsTick: (stats: GardenStats) => void;
  onFinish: (stats: GardenStats) => void;
  onBack?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const statsRef = useRef<GardenStats>({ ...EMPTY_STATS });
  const finishedRef = useRef(false);

  // Mirrors statsRef for the on-screen badges/progress bar (display only —
  // does not change how stats are tracked or reported to the parent).
  const [liveStats, setLiveStats] = useState<GardenStats>({ ...EMPTY_STATS });

  // A tap on Finish adds to the external finishSignal, so either one can end the session
  const [finishClicks, setFinishClicks] = useState(0);
  const finishSignalRef = useRef(finishSignal + finishClicks);
  const lastSeenFinishSignal = useRef(finishSignal + finishClicks);
  finishSignalRef.current = finishSignal + finishClicks;

  useEffect(() => {
    const canvas = canvasRef.current;
    const rawCtx = canvas?.getContext("2d");
    if (!canvas || !rawCtx) return;
    const ctx: CanvasRenderingContext2D = rawCtx;

    let animationFrame: number;
    let lastTime = performance.now();
    let lastStatsEmit = performance.now();
    let nextCollectibleId = 1;
    let spawnTimer = 0;

    const collectibles: Collectible[] = [];
    const sparkles: Sparkle[] = [];
    const blooms: Bloom[] = [];

    let charX = LOGICAL_W / 2;
    let charY = GROUND_Y;

    let charVy = 0;
    let isAirborne = false;
    // "small" = therapy-friendly camera jump / SPACE, "high" = W / reach jump
    let jumpType: "small" | "high" | null = null;

    const resize = () => {
      const container = containerRef.current;
      if (!container) return;
      const scale = container.clientWidth / LOGICAL_W;
      canvas.style.height = `${LOGICAL_H * scale}px`;
    };
    resize();

    const resizeObserver = new ResizeObserver(resize);
    if (containerRef.current) resizeObserver.observe(containerRef.current);

    function spawnCollectible(kind: CollectibleKind) {
      const yByKind: Record<CollectibleKind, number> = {
        seed: GROUND_Y - 10,
        butterfly: GROUND_Y - 90,
        star: GROUND_Y - 190,
      };

      collectibles.push({
        id: nextCollectibleId++,
        kind,
        x: LOGICAL_W + 30,
        y: yByKind[kind] + (Math.random() * 20 - 10),
        collected: false,
        bornAt: performance.now(),
      });
    }

    function addSparkles(x: number, y: number, color: string) {
      for (let i = 0; i < 6; i++) sparkles.push({ x, y, life: 1, color });
    }

    function tick(now: number) {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const movement = movementRef.current;
      statsRef.current.sessionSeconds += dt;

      // Horizontal movement
      const targetX = LOGICAL_W / 2 + movement.lean * (LOGICAL_W / 2 - 70);
      charX += (targetX - charX) * Math.min(dt * 4, 1);

      const isSquatting = movement.squatHeld || movement.squatTriggered;

      // Small jump (easy camera-detected jump / SPACE)
      if (movement.jumpTriggered && !isAirborne) {
        charVy = -230;
        isAirborne = true;
        jumpType = "small";
      }
      // High jump (reach / W)
      else if ((movement.reachTriggered || movement.reachHeld) && !isAirborne) {
        charVy = -350;
        isAirborne = true;
        jumpType = "high";
      }

      if (isAirborne) {
        charVy += 650 * dt;
        charY += charVy * dt;
        if (charY >= GROUND_Y) {
          charY = GROUND_Y;
          charVy = 0;
          isAirborne = false;
          jumpType = null;
        }
      }

      // Garden progress only ever comes from a successful catch below —
      // holding squat/reach does not by itself grow the garden.

      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        const kinds: CollectibleKind[] = ["seed", "star", "butterfly"];
        spawnCollectible(kinds[Math.floor(Math.random() * kinds.length)]);
        spawnTimer = 1.4 + Math.random() * 1.2;
      }

      const charBox = {
        x: charX - 30,
        y: isSquatting ? charY - 45 : charY - 80,
        w: 60,
        h: isSquatting ? 45 : 80,
      };
      const charCenterX = charX;
      const charCenterY = charBox.y + charBox.h / 2;

      for (const item of collectibles) {
        if (item.collected) continue;

        item.x -= SCROLL_SPEED * dt;

        // Butterfly gets a tighter horizontal window so easy jump detection
        // doesn't mean automatic scoring.
        const isCloseX =
          Math.abs(item.x - charCenterX) < (item.kind === "butterfly" ? 42 : 65);

        let isCloseY = false;
        if (item.kind === "seed") isCloseY = Math.abs(item.y - charCenterY) < 100;
        if (item.kind === "butterfly") {
          // Requires being genuinely airborne, not just jump-triggered
          isCloseY = isAirborne && Math.abs(item.y - charCenterY) < 65;
        }
        if (item.kind === "star") isCloseY = Math.abs(item.y - charCenterY) < 220;

        const near = isCloseX && isCloseY;

        // Exact controls — S: seed, SPACE: butterfly, W: star
        const wantsPickup =
          (item.kind === "seed" && isSquatting) ||
          (item.kind === "butterfly" && isAirborne && jumpType === "small") ||
          (item.kind === "star" &&
            (movement.reachTriggered || movement.reachHeld) &&
            jumpType === "high");

        if (near && wantsPickup) {
          item.collected = true;

          addSparkles(
            item.x,
            item.y,
            item.kind === "seed"
              ? PALETTE.seed
              : item.kind === "star"
                ? PALETTE.star
                : PALETTE.butterfly
          );

          if (item.kind === "seed") statsRef.current.seeds += 1;
          if (item.kind === "star") statsRef.current.stars += 1;
          if (item.kind === "butterfly") statsRef.current.butterflies += 1;

          // Only a successful catch restores the garden
          statsRef.current.restoredPercent = Math.min(
            100,
            statsRef.current.restoredPercent + 2.5
          );
        }
      }

      for (let i = collectibles.length - 1; i >= 0; i--) {
        if (collectibles[i].collected || collectibles[i].x < -40) {
          collectibles.splice(i, 1);
        }
      }

      for (let i = sparkles.length - 1; i >= 0; i--) {
        sparkles[i].life -= dt * 1.6;
        sparkles[i].y -= dt * 30;
        if (sparkles[i].life <= 0) sparkles.splice(i, 1);
      }

      draw(ctx, {
        charX,
        charY,
        isAirborne,
        isSquatting,
        collectibles,
        sparkles,
        blooms,
        restoredPercent: statsRef.current.restoredPercent,
      });

      if (now - lastStatsEmit > 400) {
        lastStatsEmit = now;
        setLiveStats({ ...statsRef.current });
        onStatsTick({ ...statsRef.current });
      }

      const finishRequested =
        finishSignalRef.current !== lastSeenFinishSignal.current;

      if (
        !finishedRef.current &&
        (statsRef.current.sessionSeconds >= targetSeconds || finishRequested)
      ) {
        finishedRef.current = true;
        lastSeenFinishSignal.current = finishSignalRef.current;
        setLiveStats({ ...statsRef.current });
        onFinish({ ...statsRef.current });
        return;
      }

      animationFrame = requestAnimationFrame(tick);
    }

    animationFrame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
    };
  }, [targetSeconds, movementRef, onStatsTick, onFinish]);

  const handleFinishClick = () => setFinishClicks((c) => c + 1);

  return (
    <div className="relative w-full flex flex-col items-center gap-4 sm:gap-5 px-4 py-5 sm:px-8 sm:py-6">
      {/* Decorative accents, consistent with the Breathing screen */}
      <div className="pointer-events-none absolute -top-12 -left-12 w-40 h-40 rounded-full bg-greensoft/50 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-16 -right-12 w-48 h-48 rounded-full bg-peachsoft/40 blur-2xl" />
      <div className="pointer-events-none absolute top-1/3 -right-8 w-28 h-28 rounded-full bg-lavendersoft/40 blur-2xl" />
      <Sparkles className="pointer-events-none absolute top-5 right-6 w-4 h-4 text-green/40" />
      <Sparkles className="pointer-events-none absolute bottom-6 left-6 w-3 h-3 text-lavender/40" />

      {/* HEADER — title/subtitle top-left, Back top-right */}
      <div className="relative flex items-start justify-between w-full max-w-3xl">
        <div>
          <h2 className="font-heading text-heading text-3xl md:text-4xl flex items-center gap-2">
            Calmly Garden
            <Leaf className="w-5 h-5 text-green" />
          </h2>
          <p className="font-body text-text/55 text-sm mt-1">
            Move gently, and watch the garden grow.
          </p>
        </div>

        {onBack && (
          <button
            onClick={onBack}
            className="font-body text-sm text-heading underline underline-offset-4 shrink-0 mt-1"
          >
            Back
          </button>
        )}
      </div>

      {/* STAT BADGES */}
      <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-3xl">
        <StatBadge icon={<Sprout className="w-4 h-4 text-green" />} value={liveStats.seeds} label="seeds" />
        <StatBadge icon={<Star className="w-4 h-4 text-peach" />} value={liveStats.stars} label="stars" />
        <StatBadge icon={<Sparkles className="w-4 h-4 text-lavender" />} value={liveStats.butterflies} label="butterflies" />
      </div>

      {/* GROWTH PROGRESS */}
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between font-body text-sm text-text/70 mb-1.5">
          <span>Your garden is growing</span>
          <span className="font-semibold text-heading">
            {Math.round(liveStats.restoredPercent)}%
          </span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-white/60 overflow-hidden">
          <div
            className="h-full rounded-full bg-green transition-all duration-300"
            style={{ width: `${liveStats.restoredPercent}%` }}
          />
        </div>
      </div>

      {/* INSTRUCTIONS */}
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-body text-xs sm:text-sm text-text/60">
        <span className="flex items-center gap-1.5">
          <ArrowLeftRight className="w-3.5 h-3.5" />
          A/D or →/← : move
        </span>
        <span className="flex items-center gap-1.5">
          <ArrowBigUp className="w-3.5 h-3.5" />
          space : jump
        </span>
        <span className="flex items-center gap-1.5">
          <ChevronsUp className="w-3.5 h-3.5" />
          W : rise high
        </span>
        <span className="flex items-center gap-1.5">
          <ChevronsDown className="w-3.5 h-3.5" />
          S : squat
        </span>
      </div>

      {/* GAME CARD — bigger frame, same game window inside */}
      <div className="relative w-full max-w-3xl rounded-[2rem] border border-white/70 bg-white/70 shadow-lg p-3 sm:p-5">
        <div
          ref={containerRef}
          className="w-full rounded-2xl overflow-hidden bg-green-soft shadow-inner"
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
      </div>

      {/* FINISH — same pill-button style as Breathing's Start/Stop */}
      <button
        type="button"
        onClick={handleFinishClick}
        className="bg-button-shape bg-contain bg-no-repeat bg-center font-body font-semibold text-background w-36 py-3 flex items-center justify-center gap-2"
      >
        <IconFinish className="w-4 h-4" />
        Finish
      </button>
    </div>
  );
}

// ---- drawing ----

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
  const sky = ctx.createLinearGradient(0, 0, 0, LOGICAL_H);
  sky.addColorStop(0, PALETTE.skyTop);
  sky.addColorStop(1, PALETTE.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

  ctx.fillStyle = PALETTE.sun;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.arc(90, 80, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  drawHill(ctx, GROUND_Y - 40, PALETTE.hillFar);
  drawHill(ctx, GROUND_Y - 10, PALETTE.hillMid);
  drawHill(ctx, GROUND_Y + 30, PALETTE.hillNear);

  for (const bloom of state.blooms) drawBloom(ctx, bloom.x, bloom.y, bloom.scale);
  for (const item of state.collectibles) drawCollectible(ctx, item);

  drawCharacter(ctx, state.charX, state.charY, state.isAirborne, state.isSquatting);

  for (const sparkle of state.sparkles) {
    ctx.globalAlpha = Math.max(sparkle.life, 0);
    ctx.fillStyle = sparkle.color;
    ctx.beginPath();
    ctx.arc(sparkle.x, sparkle.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function drawHill(ctx: CanvasRenderingContext2D, baseY: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, LOGICAL_H);
  ctx.lineTo(0, baseY + 20);
  ctx.quadraticCurveTo(LOGICAL_W * 0.25, baseY - 30, LOGICAL_W * 0.5, baseY);
  ctx.quadraticCurveTo(LOGICAL_W * 0.75, baseY + 30, LOGICAL_W, baseY - 10);
  ctx.lineTo(LOGICAL_W, LOGICAL_H);
  ctx.closePath();
  ctx.fill();
}

function drawBloom(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.fillStyle = PALETTE.bloom;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    const angle = (i / 5) * Math.PI * 2;
    ctx.ellipse(Math.cos(angle) * 6, Math.sin(angle) * 6, 5, 3.2, angle, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = PALETTE.star;
  ctx.beginPath();
  ctx.arc(0, 0, 3.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawCollectible(ctx: CanvasRenderingContext2D, item: Collectible) {
  ctx.save();
  ctx.translate(item.x, item.y);

  if (item.kind === "seed") {
    ctx.fillStyle = PALETTE.seed;
    ctx.beginPath();
    ctx.ellipse(0, 0, 7, 9, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (item.kind === "star") {
    ctx.fillStyle = PALETTE.star;
    drawStar(ctx, 0, 0, 5, 10, 4.5);
  } else {
    const flap = Math.sin(performance.now() / 120 + item.id) * 6;
    ctx.fillStyle = PALETTE.butterfly;
    ctx.beginPath();
    ctx.ellipse(-6, flap * 0.2, 7, 5, 0.3, 0, Math.PI * 2);
    ctx.ellipse(6, -flap * 0.2, 7, 5, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PALETTE.trunk;
    ctx.fillRect(-1, -4, 2, 8);
  }

  ctx.restore();
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number
) {
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);

  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
    rot += step;
    ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
    rot += step;
  }

  ctx.closePath();
  ctx.fill();
}

function drawCharacter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  airborne: boolean,
  isSquatting: boolean
) {
  ctx.save();
  ctx.translate(x, y);

  const bob = airborne ? -6 : Math.sin(performance.now() / 260) * 3;
  ctx.translate(0, bob);

  ctx.fillStyle = "rgba(63,74,56,0.18)";
  ctx.beginPath();
  ctx.ellipse(0, 6 - bob, isSquatting ? 28 : 22, isSquatting ? 4 : 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = PALETTE.characterDark;
  ctx.beginPath();
  if (isSquatting) {
    ctx.ellipse(0, -16, 26, 16, 0, 0, Math.PI * 2);
  } else {
    ctx.ellipse(0, -30, 20, 28, 0, 0, Math.PI * 2);
  }
  ctx.fill();

  ctx.fillStyle = PALETTE.character;
  ctx.beginPath();
  if (isSquatting) {
    ctx.arc(0, -38, 13, 0, Math.PI * 2);
  } else {
    ctx.arc(0, -62, 13, 0, Math.PI * 2);
  }
  ctx.fill();

  ctx.restore();
}