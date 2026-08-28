"use client";

import { useState } from "react";

export type TimelineSegment = {
  id: string;
  label: string;
  start: number;
  duration: number;
  color?: "default" | "fail" | "success" | "wait";
  description?: string;
};

const VIEW_W = 640;
const PAD = 24;
const TRACK_Y = 40;
const TRACK_H = 22;

const colorClass: Record<NonNullable<TimelineSegment["color"]>, string> = {
  default: "fill-zinc-600",
  fail: "fill-red-500/70",
  success: "fill-emerald-500",
  wait: "fill-amber-500/60",
};

export default function Timeline({
  segments,
  totalDuration,
  unit = "s",
  caption,
}: {
  segments: TimelineSegment[];
  totalDuration: number;
  unit?: string;
  caption?: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedSegment = segments.find((s) => s.id === selected);
  const trackWidth = VIEW_W - PAD * 2;
  const toX = (t: number) => PAD + (t / totalDuration) * trackWidth;

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
      {/* min-w matches this component's own natural VIEW_W, so mobile
          never renders it smaller than it already does today — it just
          scrolls horizontally instead of shrinking the segment labels
          past legibility. */}
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${VIEW_W} 90`}
          className="h-auto w-full min-w-[640px]"
          role="img"
          aria-label={caption ?? "Timeline"}
        >
        <line
          x1={PAD}
          y1={TRACK_Y + TRACK_H / 2}
          x2={VIEW_W - PAD}
          y2={TRACK_Y + TRACK_H / 2}
          className="stroke-zinc-800"
          strokeWidth={1}
        />
        {segments.map((seg) => {
          const x = toX(seg.start);
          const isMarker = seg.duration <= 0;
          const w = isMarker ? 0 : Math.max(toX(seg.start + seg.duration) - x, 3);
          const isSelected = selected === seg.id;
          const fill = colorClass[seg.color ?? "default"];

          return (
            <g
              key={seg.id}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              onClick={() => setSelected(isSelected ? null : seg.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelected(isSelected ? null : seg.id);
                }
              }}
              className="group cursor-pointer outline-none"
            >
              {isMarker ? (
                <circle
                  cx={x}
                  cy={TRACK_Y + TRACK_H / 2}
                  r={isSelected ? 7 : 5.5}
                  className={`${fill} ${
                    isSelected ? "stroke-white" : "stroke-transparent"
                  } group-focus-visible:stroke-white`}
                  strokeWidth={1.5}
                />
              ) : (
                <rect
                  x={x}
                  y={TRACK_Y}
                  width={w}
                  height={TRACK_H}
                  rx={3}
                  className={`${fill} ${
                    isSelected ? "stroke-white" : "stroke-transparent"
                  } group-focus-visible:stroke-white`}
                  strokeWidth={1.5}
                />
              )}
              <text
                x={x + (isMarker ? 0 : w / 2)}
                y={TRACK_Y - 8}
                textAnchor="middle"
                className={`select-none font-mono text-[9px] ${
                  isSelected ? "fill-emerald-400" : "fill-zinc-400"
                }`}
              >
                {seg.label}
              </text>
            </g>
          );
        })}
        </svg>
      </div>

      <div className="mt-3 rounded-md border border-zinc-800 bg-zinc-950/60 p-3">
        {selectedSegment ? (
          <>
            <h4 className="font-mono text-sm font-semibold text-emerald-400">
              {selectedSegment.label}
            </h4>
            {selectedSegment.description && (
              <p className="mt-1 text-sm text-zinc-300">
                {selectedSegment.description}
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-zinc-500">
            Click a point on the timeline to see what&apos;s happening there. Total
            span shown: {totalDuration}
            {unit}.
          </p>
        )}
      </div>
      {caption && <p className="mt-2 text-sm text-zinc-400">{caption}</p>}
    </div>
  );
}
