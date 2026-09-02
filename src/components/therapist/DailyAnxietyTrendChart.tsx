// src/components/therapist/DailyAnxietyTrendChart.tsx
// Hand-rolled SVG line chart showing 7 days of mood + sleep quality as two
// separate lines on a 1–5 y-axis. "use client" is needed only for hover/tap
// tooltips — all labels are pre-formatted on the server so
// Intl.DateTimeFormat never causes a hydration mismatch.

"use client";

import { useMemo, useState } from "react";

export interface TrendChartPoint {
  dayIndex: number; // 0..6
  weekday: string; // locale-aware short name (e.g. "Mon" / "پیر")
  dateLabel: string; // locale-aware short date (e.g. "4 Sep")
  mood: number | null; // 1–5 or null if no journal that day
  sleepQuality: number | null; // 1–5 or null if no journal that day
}

export interface TrendChartLabels {
  mood: string;
  sleep: string;
  noData: string;
  empty: string;
  scale: string; // "/5" suffix
}

interface Props {
  points: TrendChartPoint[];
  labels: TrendChartLabels;
}

const W = 700;
const H = 220;
const PL = 48;
const PR = 24;
const PT = 14;
const PB = 38;
const PLOT_W = W - PL - PR;
const PLOT_H = H - PT - PB;
const COL_W = PLOT_W / 7;

const Y_MIN = 1;
const Y_MAX = 5;
const Y_RANGE = Y_MAX - Y_MIN;

function yForValue(v: number): number {
  return PT + PLOT_H * (1 - (v - Y_MIN) / Y_RANGE);
}

function xForCol(dayIndex: number): number {
  return PL + COL_W * dayIndex + COL_W / 2;
}

type SegPt = { point: TrendChartPoint; x: number; y: number };

function buildSegments(
  points: TrendChartPoint[],
  pick: (p: TrendChartPoint) => number | null
): SegPt[][] {
  const segments: SegPt[][] = [];
  let current: SegPt[] = [];
  for (const p of points) {
    const v = pick(p);
    if (v === null) {
      if (current.length) {
        segments.push(current);
        current = [];
      }
      continue;
    }
    current.push({ point: p, x: xForCol(p.dayIndex), y: yForValue(v) });
  }
  if (current.length) segments.push(current);
  return segments;
}

const Y_TICKS = [5, 4, 3, 2, 1];

export default function DailyAnxietyTrendChart({ points, labels }: Props) {
  const [active, setActive] = useState<number | null>(null);

  const moodSegments = useMemo(
    () => buildSegments(points, (p) => p.mood),
    [points]
  );
  const sleepSegments = useMemo(
    () => buildSegments(points, (p) => p.sleepQuality),
    [points]
  );
  const hasAnyData = points.some(
    (p) => p.mood !== null || p.sleepQuality !== null
  );

  if (!hasAnyData) {
    return (
      <div className="flex min-h-[160px] items-center justify-center rounded-xl border border-blue/15 bg-background/40 px-4 text-center font-body text-sm text-text/50">
        {labels.empty}
      </div>
    );
  }

  const activePoint = active !== null ? points[active] : null;
  const tooltipLeftPct = activePoint
    ? (xForCol(activePoint.dayIndex) / W) * 100
    : 0;
  const tooltipTopY = activePoint
    ? (() => {
        const vals = [activePoint.mood, activePoint.sleepQuality].filter(
          (v): v is number => v !== null
        );
        if (!vals.length) return PT + PLOT_H / 2;
        return yForValue(Math.max(...vals));
      })()
    : 0;
  const tooltipTopPct = (tooltipTopY / H) * 100;
  const tooltipAlign =
    activePoint === null
      ? "center"
      : activePoint.dayIndex === 0
      ? "left"
      : activePoint.dayIndex === 6
      ? "right"
      : "center";

  return (
    <div className="relative" dir="ltr">
      <svg
        role="img"
        viewBox={`0 0 ${W} ${H}`}
        className="h-[200px] w-full sm:h-[220px]"
        aria-label="Daily mood and sleep pattern"
      >
        <title>Daily mood and sleep pattern</title>

        {/* Light grid lines at each integer */}
        {Y_TICKS.map((v) => (
          <line
            key={`grid-${v}`}
            x1={PL}
            x2={PL + PLOT_W}
            y1={yForValue(v)}
            y2={yForValue(v)}
            className="stroke-blue/10"
            strokeWidth={1}
          />
        ))}

        {/* Y-axis labels */}
        {Y_TICKS.map((v) => (
          <text
            key={`yl-${v}`}
            x={PL - 10}
            y={yForValue(v)}
            textAnchor="end"
            dominantBaseline="middle"
            className="fill-text/60 font-body"
            fontSize={11}
            fontWeight={600}
          >
            {v}
          </text>
        ))}

        {/* "/5" scale label above the axis */}
        <text
          x={PL - 10}
          y={yForValue(5) - 14}
          textAnchor="end"
          className="fill-text/40 font-body"
          fontSize={9}
          fontWeight={500}
        >
          {labels.scale}
        </text>

        {/* X-axis weekday labels */}
        {points.map((p) => (
          <text
            key={`wd-${p.dayIndex}`}
            x={xForCol(p.dayIndex)}
            y={H - PB + 18}
            textAnchor="middle"
            className="fill-text/60 font-body"
            fontSize={11}
            fontWeight={500}
          >
            {p.weekday}
          </text>
        ))}

        {/* Mood polyline (blue) */}
        {moodSegments.map((seg, i) =>
          seg.length > 1 ? (
            <polyline
              key={`mood-${i}`}
              fill="none"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="stroke-blue"
              points={seg.map((s) => `${s.x},${s.y}`).join(" ")}
            />
          ) : null
        )}

        {/* Sleep polyline (lavender) */}
        {sleepSegments.map((seg, i) =>
          seg.length > 1 ? (
            <polyline
              key={`slp-${i}`}
              fill="none"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="stroke-lavender"
              points={seg.map((s) => `${s.x},${s.y}`).join(" ")}
            />
          ) : null
        )}

        {/* Data-point markers + no-data column labels */}
        {points.map((p) => {
          const cx = xForCol(p.dayIndex);
          if (p.mood === null && p.sleepQuality === null) {
            return (
              <text
                key={`nd-${p.dayIndex}`}
                x={cx}
                y={PT + PLOT_H / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-text/35 font-body"
                fontSize={10}
                fontStyle="italic"
              >
                {labels.noData}
              </text>
            );
          }
          return (
            <g key={`pt-${p.dayIndex}`}>
              {p.mood !== null && (
                <circle
                  cx={cx}
                  cy={yForValue(p.mood)}
                  r={5}
                  className="fill-background stroke-blue"
                  strokeWidth={2.5}
                />
              )}
              {p.sleepQuality !== null && (
                <circle
                  cx={cx}
                  cy={yForValue(p.sleepQuality)}
                  r={5}
                  className="fill-background stroke-lavender"
                  strokeWidth={2.5}
                />
              )}
            </g>
          );
        })}

        {/* Hit areas */}
        {points.map((p) => (
          <rect
            key={`hit-${p.dayIndex}`}
            x={PL + COL_W * p.dayIndex}
            y={PT}
            width={COL_W}
            height={PLOT_H}
            fill="transparent"
            onMouseEnter={() => setActive(p.dayIndex)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(p.dayIndex)}
            onBlur={() => setActive(null)}
            onClick={() =>
              setActive((prev) => (prev === p.dayIndex ? null : p.dayIndex))
            }
            tabIndex={0}
            role="button"
            aria-label={`${p.weekday} ${p.dateLabel}: ${
              p.mood === null && p.sleepQuality === null
                ? labels.noData
                : `${labels.mood} ${p.mood ?? "—"}${labels.scale}, ${labels.sleep} ${p.sleepQuality ?? "—"}${labels.scale}`
            }`}
          />
        ))}
      </svg>

      {/* Legend */}
      <div className="mt-2 flex items-center justify-center gap-6 font-body text-xs">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue" />
          <span className="text-text/70">{labels.mood}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-lavender" />
          <span className="text-text/70">{labels.sleep}</span>
        </span>
      </div>

      {/* HTML tooltip overlay */}
      {activePoint && (
        <div
          className="pointer-events-none absolute z-10 -translate-y-full"
          style={{
            left: `${tooltipLeftPct}%`,
            top: `${tooltipTopPct}%`,
            transform: `translate(${
              tooltipAlign === "left"
                ? "0"
                : tooltipAlign === "right"
                ? "-100%"
                : "-50%"
            }, calc(-100% - 12px))`,
          }}
        >
          <div className="rounded-lg border border-blue/20 bg-background px-3 py-2 font-body text-xs shadow-sm">
            <div className="font-semibold text-blueheading">
              {activePoint.weekday} · {activePoint.dateLabel}
            </div>
            {activePoint.mood === null && activePoint.sleepQuality === null ? (
              <div className="mt-0.5 italic text-text/50">{labels.noData}</div>
            ) : (
              <>
                <div className="mt-0.5 flex items-center gap-1.5 text-text">
                  <span className="inline-block h-2 w-2 rounded-full bg-blue" />
                  {labels.mood}:{" "}
                  <span className="font-bold text-blueheading">
                    {activePoint.mood ?? "—"}
                  </span>
                  <span className="text-text/60">{labels.scale}</span>
                </div>
                <div className="mt-0.5 flex items-center gap-1.5 text-text">
                  <span className="inline-block h-2 w-2 rounded-full bg-lavender" />
                  {labels.sleep}:{" "}
                  <span className="font-bold text-blueheading">
                    {activePoint.sleepQuality ?? "—"}
                  </span>
                  <span className="text-text/60">{labels.scale}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
