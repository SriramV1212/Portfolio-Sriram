"use client";

import { useState } from "react";
import type { ArchitectureDiagram, ArchNode } from "@/content/case-studies/types";
import ArchitectureIconPaths from "./architecture-icons";

const NODE_W = 200;
const NODE_H = 110;
const ICON_SIZE = 34;
const CHAR_WIDTH = 6.8;
const LINE_HEIGHT = 15;
const LABEL_MARGIN = 6;
const MIN_OFFSET = 12;

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950";

// Tailwind needs literal class strings to generate CSS for them — a
// template-interpolated `text-${node.color}` from content data would
// silently produce no styling. This lookup keeps every class the JIT
// scanner needs to see written out in full, once, here.
const iconColorClass: Record<string, string> = {
  "zinc-300": "text-zinc-300",
  "emerald-400": "text-emerald-400",
  "violet-400": "text-violet-400",
  "orange-400": "text-orange-400",
  "sky-400": "text-sky-400",
  "red-400": "text-red-400",
};

function nodeById(nodes: ArchNode[], id: string) {
  return nodes.find((n) => n.id === id)!;
}

function labelDims(lines: string[]) {
  const w = Math.max(...lines.map((l) => l.length)) * CHAR_WIDTH;
  const h = lines.length * LINE_HEIGHT;
  return { w, h };
}

const EDGE_GAP = 3;

// Where a ray from a box's center, heading in direction (dx,dy), exits
// the box's rectangular boundary. Lines drawn center-to-center bury their
// arrowhead marker deep inside the opaque target node (nodes paint after
// edges), so every edge needs trimming to the box edge before drawing —
// not just the arrowhead, the line itself.
function boxEdgePoint(cx: number, cy: number, hw: number, hh: number, dx: number, dy: number) {
  const tx = dx !== 0 ? hw / Math.abs(dx) : Infinity;
  const ty = dy !== 0 ? hh / Math.abs(dy) : Infinity;
  const t = Math.min(tx, ty);
  return { x: cx + dx * t, y: cy + dy * t };
}

// Shared, click-through-traceable architecture diagram — icons, multi-line
// labels, parallel/bidirectional edges, and a Prev/Next/Reset request
// trace. Originally built only for the payment write-up
// (PaymentArchitectureDiagram.tsx); promoted here, unchanged, once the RAG
// write-up needed the exact same interaction over its own node/edge data.
export default function TracedArchitectureDiagram({
  diagram,
}: {
  diagram: ArchitectureDiagram;
}) {
  const [stepIndex, setStepIndex] = useState<number | null>(null);
  const { nodes, edges, trace } = diagram;
  const active = stepIndex !== null ? trace[stepIndex] : null;

  const goNext = () => {
    if (stepIndex === null) setStepIndex(0);
    else if (stepIndex < trace.length - 1) setStepIndex(stepIndex + 1);
  };
  const goPrev = () => {
    if (stepIndex === null) return;
    if (stepIndex === 0) setStepIndex(null);
    else setStepIndex(stepIndex - 1);
  };

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
      {/* This is the widest, most text-dense diagram on the site (up to
          ~1600 viewBox units), so a plain w-full would shrink its labels
          to a few px on a phone. min-w-[720px] keeps it at roughly its
          normal desktop render size and lets the SVG itself scroll
          horizontally on mobile instead — the Prev/Next/Reset controls
          and caption box below stay full-width and don't scroll with it. */}
      <div className="overflow-x-auto">
        <svg
          viewBox={diagram.viewBox}
          className="h-auto w-full min-w-[720px]"
          role="img"
          aria-label={
            active
              ? `Architecture diagram, showing step ${stepIndex! + 1} of ${trace.length}: ${active.caption}`
              : "Architecture diagram of the payment pipeline"
          }
        >
        <defs>
          <marker
            id="arch-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="9"
            markerHeight="9"
            orient="auto-start-reverse"
          >
            <path d="M0 0 L10 5 L0 10 z" className="fill-zinc-400" />
          </marker>
          <marker
            id="arch-arrow-active"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="9"
            markerHeight="9"
            orient="auto-start-reverse"
          >
            <path d="M0 0 L10 5 L0 10 z" className="fill-emerald-400" />
          </marker>
        </defs>

        {edges.map((edge) => {
          const from = nodeById(nodes, edge.from);
          const to = nodeById(nodes, edge.to);
          const center1 = { x: from.x, y: from.y };
          const center2 = { x: to.x, y: to.y };
          const dx0 = center2.x - center1.x;
          const dy0 = center2.y - center1.y;
          const len0 = Math.hypot(dx0, dy0) || 1;
          const dirX = dx0 / len0;
          const dirY = dy0 / len0;
          const perp = { x: -dy0 / len0, y: dx0 / len0 };
          const parOffset = edge.parallelOffset ?? 0;

          // Label placement stays anchored to the parallel-shifted CENTER
          // midpoint (already verified clear of every node's box) —
          // independent of exactly where along the line it gets visually
          // trimmed below, so trimming the drawn line can't disturb it.
          const shiftedCenter1 = { x: center1.x + perp.x * parOffset, y: center1.y + perp.y * parOffset };
          const shiftedCenter2 = { x: center2.x + perp.x * parOffset, y: center2.y + perp.y * parOffset };
          const midX = (shiftedCenter1.x + shiftedCenter2.x) / 2;
          const midY = (shiftedCenter1.y + shiftedCenter2.y) / 2;

          // The drawn line: trimmed to each node's actual box boundary
          // (using the original, unshifted direction — a box's edges
          // don't move, only the parallel line threading past them does),
          // then parallel-shifted, then pulled back a few units for a
          // clean gap before the arrowhead.
          const srcEdge = boxEdgePoint(center1.x, center1.y, NODE_W / 2, NODE_H / 2, dirX, dirY);
          const tgtEdge = boxEdgePoint(center2.x, center2.y, NODE_W / 2, NODE_H / 2, -dirX, -dirY);
          const p1 = {
            x: srcEdge.x + perp.x * parOffset,
            y: srcEdge.y + perp.y * parOffset,
          };
          const p2 = {
            x: tgtEdge.x + perp.x * parOffset - dirX * EDGE_GAP,
            y: tgtEdge.y + perp.y * parOffset - dirY * EDGE_GAP,
          };

          let px = -dy0 / len0;
          let py = dx0 / len0;
          if (edge.parallelOffset) {
            // For one of a pair of parallel edges, "which side is the
            // label on" can't be the generic "always prefer up" rule —
            // that would put both labels on the same side and one of them
            // ends up sandwiched between the two lines instead of clearly
            // belonging to its own. Push the label further in the exact
            // same direction its own line was already shifted, so it
            // always lands on the outward side, away from the other line.
            const s = Math.sign(edge.parallelOffset);
            px = perp.x * s;
            py = perp.y * s;
          } else if (py > 0) {
            px = -px;
            py = -py;
          }
          const { w, h } = labelDims(edge.label);
          const halfW = w / 2;
          const halfH = h / 2;
          const projection = halfW * Math.abs(px) + halfH * Math.abs(py);
          const offset = Math.max(projection, MIN_OFFSET) + LABEL_MARGIN;
          const labelX = midX + px * offset;
          const labelY = midY + py * offset;

          const isActive = active?.edgeIds.includes(edge.id) ?? false;
          const isDimmed = active !== null && !isActive;

          return (
            <g
              key={edge.id}
              className="transition-opacity duration-300"
              style={{ opacity: isDimmed ? 0.2 : 1 }}
            >
              <line
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                className={isActive ? "stroke-emerald-400" : "stroke-zinc-500"}
                strokeWidth={isActive ? 2.5 : 1.5}
                strokeDasharray={edge.dashed ? "5 4" : undefined}
                markerEnd={`url(#arch-arrow${isActive ? "-active" : ""})`}
              />
              {edge.label.map((line, i) => (
                <text
                  key={i}
                  x={labelX}
                  y={labelY + (i - (edge.label.length - 1) / 2) * LINE_HEIGHT}
                  textAnchor="middle"
                  className={`text-[11px] ${isActive ? "fill-emerald-400" : "fill-zinc-400"}`}
                >
                  {line}
                </text>
              ))}
            </g>
          );
        })}

        {nodes.map((node) => {
          const isActive = active?.nodeIds.includes(node.id) ?? false;
          const isDimmed = active !== null && !isActive;
          const colorClass = iconColorClass[node.color] ?? "text-zinc-300";
          const iconX = node.x - ICON_SIZE / 2;
          const iconY = node.y - NODE_H / 2 + 16;
          const labelStartY = iconY + ICON_SIZE + 20;

          return (
            <g
              key={node.id}
              className="transition-opacity duration-300"
              style={{ opacity: isDimmed ? 0.35 : 1 }}
            >
              <rect
                x={node.x - NODE_W / 2}
                y={node.y - NODE_H / 2}
                width={NODE_W}
                height={NODE_H}
                rx={14}
                className={`fill-zinc-900 transition-colors ${
                  isActive ? "stroke-emerald-400" : "stroke-zinc-700"
                }`}
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              <svg
                x={iconX}
                y={iconY}
                width={ICON_SIZE}
                height={ICON_SIZE}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={colorClass}
              >
                <ArchitectureIconPaths kind={node.icon} />
              </svg>
              {node.label.map((line, i) => (
                <text
                  key={i}
                  x={node.x}
                  y={labelStartY + i * 20}
                  textAnchor="middle"
                  className="select-none fill-zinc-100 text-[14px] font-semibold"
                >
                  {line}
                </text>
              ))}
            </g>
          );
        })}
        </svg>
      </div>

      {/* Fixed height, not min-height — the caption's length varies step to
          step, and if the box grows with it the Prev/Next/Reset row below
          shifts vertically on every click, forcing the user to re-aim
          their cursor. overflow-y-auto is only a safety net for an
          unexpectedly long caption at a narrow viewport; it shouldn't
          normally engage. */}
      <div className="mt-4 h-32 overflow-y-auto rounded-md border border-zinc-800 bg-zinc-950/60 p-4">
        {active ? (
          <>
            <p className="font-mono text-xs uppercase tracking-wide text-emerald-400">
              Step {stepIndex! + 1} of {trace.length}
            </p>
            <p className="mt-1.5 text-sm text-zinc-200">{active.caption}</p>
          </>
        ) : (
          <p className="text-sm text-zinc-400">{diagram.trace.length > 0 && "The full pipeline: step through a request below, or click a step directly."}</p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={goPrev}
          disabled={stepIndex === null}
          className={`inline-flex items-center gap-1.5 rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-100 transition-colors hover:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-zinc-700 ${focusRing}`}
        >
          <span aria-hidden="true">←</span> Prev
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={stepIndex === trace.length - 1}
          className={`inline-flex items-center gap-1.5 rounded-md bg-emerald-500 px-3 py-1.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-emerald-500 ${focusRing}`}
        >
          Next <span aria-hidden="true">→</span>
        </button>

        <div className="mx-1 flex flex-wrap items-center" role="group" aria-label="Jump to step">
          {trace.map((step, i) => (
            // The visible dot stays small, but the actual clickable area
            // is a full 32px square around it — an 8px dot with no
            // padding is an easy miss, and a missed click here just does
            // nothing with no feedback that anything went wrong.
            <button
              key={i}
              type="button"
              onClick={() => setStepIndex(i)}
              aria-label={`Go to step ${i + 1}: ${step.caption}`}
              aria-current={stepIndex === i}
              className={`group flex h-8 w-8 items-center justify-center rounded-full ${focusRing}`}
            >
              <span
                className={`h-2 w-2 rounded-full transition-colors ${
                  stepIndex === i ? "bg-emerald-400" : "bg-zinc-700 group-hover:bg-zinc-600"
                }`}
              />
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setStepIndex(null)}
          className={`ml-auto inline-flex items-center gap-1.5 rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100 ${focusRing}`}
        >
          <span aria-hidden="true">↺</span> Reset
        </button>
      </div>
    </div>
  );
}
