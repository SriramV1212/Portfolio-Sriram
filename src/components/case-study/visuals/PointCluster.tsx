"use client";

import { useState } from "react";

export type ClusterPoint = {
  id: string;
  label: string;
  cluster: string;
  x: number;
  y: number;
  isQuery?: boolean;
  nearestId?: string;
  nearestLabel?: string;
};

const VIEW_W = 300;
const VIEW_H = 180;

export default function PointCluster({
  points,
  clusterColors,
  caption,
}: {
  points: ClusterPoint[];
  clusterColors: Record<string, string>;
  caption?: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedPoint = points.find((p) => p.id === selected);

  const relatedIds = selectedPoint
    ? selectedPoint.isQuery && selectedPoint.nearestId
      ? new Set([selectedPoint.nearestId])
      : new Set(
          points
            .filter((p) => p.cluster === selectedPoint.cluster && p.id !== selectedPoint.id)
            .map((p) => p.id)
        )
    : null;

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="h-auto w-full"
        role="img"
        aria-label={caption ?? "Points clustered by meaning"}
      >
        {selectedPoint &&
          relatedIds &&
          Array.from(relatedIds).map((id) => {
            const target = points.find((p) => p.id === id);
            if (!target) return null;
            return (
              <line
                key={id}
                x1={selectedPoint.x}
                y1={selectedPoint.y}
                x2={target.x}
                y2={target.y}
                className="stroke-emerald-400"
                strokeWidth={1}
              />
            );
          })}

        {points.map((p) => {
          const isSelected = selected === p.id;
          const isRelated = relatedIds?.has(p.id) ?? false;
          const dimmed = selectedPoint && !isSelected && !isRelated;
          const colorClass = clusterColors[p.cluster] ?? "fill-zinc-400";
          return (
            <g
              key={p.id}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              onClick={() => setSelected(isSelected ? null : p.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelected(isSelected ? null : p.id);
                }
              }}
              className={`cursor-pointer transition-opacity focus-visible:outline-none ${
                dimmed ? "opacity-30" : "opacity-100"
              }`}
            >
              {p.isQuery ? (
                <rect
                  x={p.x - 4}
                  y={p.y - 4}
                  width={8}
                  height={8}
                  transform={`rotate(45 ${p.x} ${p.y})`}
                  className={`${colorClass} stroke-white`}
                  strokeWidth={isSelected ? 1.5 : 0.75}
                />
              ) : (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isSelected ? 5 : 4}
                  className={`${colorClass} ${
                    isSelected ? "stroke-white" : "stroke-transparent"
                  }`}
                  strokeWidth={1.5}
                />
              )}
              <text
                x={p.x}
                y={p.y - 8}
                textAnchor="middle"
                className="select-none fill-zinc-300 font-mono text-[7px]"
              >
                {p.label}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-3 rounded-md border border-zinc-800 bg-zinc-950/60 p-3">
        {selectedPoint ? (
          selectedPoint.isQuery && selectedPoint.nearestId ? (
            <p className="text-sm text-zinc-300">
              <span className="text-emerald-400">{selectedPoint.label}</span>{" "}
              lands closest, in meaning, to{" "}
              <span className="text-emerald-400">
                {selectedPoint.nearestLabel ?? selectedPoint.nearestId}
              </span>
              .
            </p>
          ) : (
            <p className="text-sm text-zinc-300">
              <span className="text-emerald-400">{selectedPoint.label}</span>{" "}
              is grouped with the other highlighted points — they&apos;re close
              together because they&apos;re close in meaning, not because they
              share any of the same words.
            </p>
          )
        ) : (
          <p className="text-sm text-zinc-500">
            Click a point to see what it&apos;s close to in meaning.
          </p>
        )}
      </div>
      {caption && <p className="mt-2 text-sm text-zinc-400">{caption}</p>}
    </div>
  );
}
