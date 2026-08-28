"use client";

import { useState } from "react";
import type {
  DiagramEdge,
  DiagramNode,
  NodeDetail,
} from "@/content/case-studies/types";

const DEFAULT_WIDTH = 150;
const DEFAULT_HEIGHT = 56;
// Rough monospace metrics for the 9px edge-label text, in viewBox units —
// used to compute how far a label needs to sit from its line so the
// line clears the label's actual footprint, not just a fixed offset.
const LABEL_CHAR_WIDTH = 5.6;
const LABEL_HALF_HEIGHT = 5;
const LABEL_MARGIN = 4;
const MIN_OFFSET = 9;

function nodeCenter(node: DiagramNode) {
  const w = node.width ?? DEFAULT_WIDTH;
  const h = node.height ?? DEFAULT_HEIGHT;
  return { x: node.x + w / 2, y: node.y + h / 2 };
}

// A fixed perpendicular offset clears a near-horizontal line fine (only
// the label's thin height needs to fit), but for a steep line the label's
// full width has to clear it — a small offset leaves the line running
// through the middle of a wide, still-horizontal text block. Scale the
// offset by the more binding of "horizontal clearance needed" and
// "vertical clearance needed" given how steep this particular edge is.
function labelOffset(text: string, px: number, py: number) {
  const halfWidth = (text.length * LABEL_CHAR_WIDTH) / 2;
  // Projection of the label's axis-aligned bounding box onto the
  // perpendicular axis: how far the box's near edge reaches back toward
  // the line once its center sits `offset` units away.
  const projection = halfWidth * Math.abs(px) + LABEL_HALF_HEIGHT * Math.abs(py);
  return Math.max(projection, MIN_OFFSET) + LABEL_MARGIN;
}

function boxOverlapsNode(cx: number, cy: number, w: number, h: number, node: DiagramNode) {
  const nw = node.width ?? DEFAULT_WIDTH;
  const nh = node.height ?? DEFAULT_HEIGHT;
  const c = nodeCenter(node);
  return Math.abs(cx - c.x) * 2 < w + nw && Math.abs(cy - c.y) * 2 < h + nh;
}

// Clearing the LINE (via labelOffset above) doesn't guarantee clearing
// every node in the diagram — a label pushed away from a steep edge can
// land on top of some node it now happens to swing past, including one of
// its own two connected nodes if the edge is short relative to the label
// (e.g. a wide node next to a long label on a steep line to a neighbor).
// Try the geometrically preferred side first; if that lands inside any
// node's box, use the opposite side of the line instead.
function placeLabel(
  text: string,
  midX: number,
  midY: number,
  px: number,
  py: number,
  nodes: DiagramNode[]
) {
  const offset = labelOffset(text, px, py);
  const w = text.length * LABEL_CHAR_WIDTH;
  const h = LABEL_HALF_HEIGHT * 2;
  const preferred = { x: midX + px * offset, y: midY + py * offset };
  if (!nodes.some((n) => boxOverlapsNode(preferred.x, preferred.y, w, h, n))) {
    return preferred;
  }
  const flipped = { x: midX - px * offset, y: midY - py * offset };
  return nodes.some((n) => boxOverlapsNode(flipped.x, flipped.y, w, h, n)) ? preferred : flipped;
}

export default function InteractiveDiagram({
  nodes,
  edges,
  details,
  viewBox,
}: {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  details: Record<string, NodeDetail>;
  viewBox: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedDetail: NodeDetail | undefined = selected
    ? details[selected]
    : undefined;

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="overflow-x-auto">
        <svg
          viewBox={viewBox}
          className="h-auto w-full min-w-[560px]"
          role="img"
          aria-label="Interactive system architecture diagram — click a component for details"
        >
        <defs>
          <marker
            id="diagram-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M0 0 L10 5 L0 10 z" className="fill-zinc-600" />
          </marker>
        </defs>

        {edges.map((edge, i) => {
          const from = nodes.find((n) => n.id === edge.from);
          const to = nodes.find((n) => n.id === edge.to);
          if (!from || !to) return null;
          const p1 = nodeCenter(from);
          const p2 = nodeCenter(to);
          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;
          // Offset labels perpendicular to the edge's own direction, not
          // just vertically — for a near-horizontal edge this reduces to
          // the old vertical offset (unchanged for every diagram that
          // predates this), but it keeps the label clear of genuinely
          // diagonal edges instead of drawing text on top of the line.
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const len = Math.hypot(dx, dy) || 1;
          let px = -dy / len;
          let py = dx / len;
          if (py > 0) {
            px = -px;
            py = -py;
          }
          const labelPos = edge.label
            ? placeLabel(edge.label, midX, midY, px, py, nodes)
            : null;
          const reversePos = edge.labelReverse
            ? placeLabel(edge.labelReverse, midX, midY, -px, -py, nodes)
            : null;
          return (
            <g key={i}>
              <line
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                className="stroke-zinc-600"
                strokeWidth={1.5}
                strokeDasharray={edge.dashed ? "4 3" : undefined}
                markerEnd="url(#diagram-arrow)"
              />
              {edge.label && labelPos && (
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  textAnchor="middle"
                  className="fill-zinc-500 font-mono text-[9px] uppercase tracking-wide"
                >
                  {edge.label}
                </text>
              )}
              {edge.labelReverse && reversePos && (
                <text
                  x={reversePos.x}
                  y={reversePos.y}
                  textAnchor="middle"
                  className="fill-zinc-500 font-mono text-[9px] uppercase tracking-wide"
                >
                  {edge.labelReverse}
                </text>
              )}
            </g>
          );
        })}

        {nodes.map((node) => {
          const w = node.width ?? DEFAULT_WIDTH;
          const h = node.height ?? DEFAULT_HEIGHT;
          const isSelected = selected === node.id;
          return (
            <g
              key={node.id}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              onClick={() => setSelected(node.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelected(node.id);
                }
              }}
              className="group cursor-pointer outline-none"
            >
              <rect
                x={node.x}
                y={node.y}
                width={w}
                height={h}
                rx={8}
                className={`fill-zinc-900 transition-colors group-focus-visible:stroke-white ${
                  isSelected
                    ? "stroke-emerald-400"
                    : "stroke-zinc-600 hover:stroke-emerald-500"
                }`}
                strokeWidth={isSelected ? 2.5 : 1.5}
              />
              <text
                x={node.x + w / 2}
                y={node.y + h / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`select-none font-mono text-[11px] ${
                  isSelected ? "fill-emerald-400" : "fill-zinc-100"
                }`}
              >
                {node.label}
              </text>
            </g>
          );
        })}
        </svg>
      </div>

      <div className="mt-4 rounded-md border border-zinc-800 bg-zinc-950/60 p-4">
        {selectedDetail ? (
          <>
            <h4 className="font-semibold text-zinc-100">
              {selectedDetail.title}
            </h4>
            <p className="mt-1.5 text-sm text-zinc-300">
              {selectedDetail.plain}
            </p>
            {selectedDetail.techDetail && (
              <p className="mt-2 font-mono text-xs leading-relaxed text-zinc-500">
                {selectedDetail.techDetail}
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-zinc-500">
            Click a component in the diagram above to see what it does.
          </p>
        )}
      </div>
    </div>
  );
}
