"use client";

import { useReducedMotion } from "@/lib/useReducedMotion";

export type PipelineNode = {
  id: string;
  label: string;
  col: number;
  row?: number;
};

export type PipelineEdge = {
  from: string;
  to: string;
  label?: string;
  labelReverse?: string;
  direction?: "forward" | "both";
  style?: "default" | "dashed" | "blocked";
};

const NODE_W_MIN = 160;
const ROW_HEIGHT = 96;
const NODE_H = 52;
const PAD = 28;
// The box-edge-to-box-edge gap a column pair gets when no edge label needs
// more room — matches the spacing the original fixed-width layout had.
const BASE_EDGE_GAP = 50;
// Rough monospace char width, in px, at each font size — used to size a
// node box to its own label, and a column gap to its longest edge label, so
// text never has to run past its own box or under a neighboring one.
const NODE_LABEL_CHAR_WIDTH = 6.8;
const NODE_PADDING_X = 32;
const EDGE_LABEL_CHAR_WIDTH = 6;
const LABEL_GAP_PADDING = 24;

export default function PipelineFlow({
  nodes,
  edges,
  caption,
}: {
  nodes: PipelineNode[];
  edges: PipelineEdge[];
  caption?: string;
}) {
  const reducedMotion = useReducedMotion();
  const maxCol = Math.max(...nodes.map((n) => n.col));
  const maxRow = Math.max(...nodes.map((n) => n.row ?? 0));

  // Each column's box width is sized to its widest node label (never
  // smaller than NODE_W_MIN), so a long label like "Server does everything,
  // then responds" gets a box wide enough to hold it instead of overflowing
  // past the box border.
  const colNodeWidth: number[] = [];
  for (let c = 0; c <= maxCol; c++) {
    let colWidth = NODE_W_MIN;
    for (const node of nodes) {
      if (node.col !== c) continue;
      colWidth = Math.max(
        colWidth,
        node.label.length * NODE_LABEL_CHAR_WIDTH + NODE_PADDING_X
      );
    }
    colNodeWidth.push(colWidth);
  }

  // Per-gap column spacing: each gap defaults to the base edge-to-edge gap,
  // but widens to fit the longest label (or labelReverse) carried by an
  // edge that spans exactly that gap, so labels always fit in the space
  // between the two node boxes instead of running under one of them.
  const colGapWidths: number[] = [];
  for (let c = 0; c < maxCol; c++) {
    let edgeGap = BASE_EDGE_GAP;
    for (const edge of edges) {
      const from = nodes.find((n) => n.id === edge.from);
      const to = nodes.find((n) => n.id === edge.to);
      if (!from || !to) continue;
      const lo = Math.min(from.col, to.col);
      const hi = Math.max(from.col, to.col);
      if (hi - lo !== 1 || lo !== c) continue;
      const longest = Math.max(
        edge.label?.length ?? 0,
        edge.labelReverse?.length ?? 0
      );
      if (longest === 0) continue;
      const needed = longest * EDGE_LABEL_CHAR_WIDTH + LABEL_GAP_PADDING;
      edgeGap = Math.max(edgeGap, needed);
    }
    colGapWidths.push(colNodeWidth[c] / 2 + colNodeWidth[c + 1] / 2 + edgeGap);
  }

  const colCenterX = [PAD + colNodeWidth[0] / 2];
  for (let c = 1; c <= maxCol; c++) {
    colCenterX.push(colCenterX[c - 1] + colGapWidths[c - 1]);
  }

  const width = colCenterX[maxCol] + colNodeWidth[maxCol] / 2 + PAD;
  const height = maxRow * ROW_HEIGHT + NODE_H + PAD * 2;

  const center = (node: PipelineNode) => ({
    x: colCenterX[node.col],
    y: PAD + (node.row ?? 0) * ROW_HEIGHT + NODE_H / 2,
  });

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label={caption ?? "Flow diagram"}
      >
        <defs>
          <marker
            id="pipeline-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M0 0 L10 5 L0 10 z" className="fill-zinc-600" />
          </marker>
          <marker
            id="pipeline-arrow-blocked"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M0 0 L10 5 L0 10 z" className="fill-red-500/70" />
          </marker>
        </defs>

        {edges.map((edge, i) => {
          const from = nodes.find((n) => n.id === edge.from);
          const to = nodes.find((n) => n.id === edge.to);
          if (!from || !to) return null;
          const p1 = center(from);
          const p2 = center(to);
          const blocked = edge.style === "blocked";
          const both = edge.direction === "both";

          return (
            <g key={i}>
              <line
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                className={blocked ? "stroke-red-500/60" : "stroke-zinc-600"}
                strokeWidth={1.5}
                strokeDasharray={
                  edge.style === "dashed" || blocked ? "4 3" : undefined
                }
                markerEnd={`url(#pipeline-arrow${blocked ? "-blocked" : ""})`}
                markerStart={
                  both ? `url(#pipeline-arrow${blocked ? "-blocked" : ""})` : undefined
                }
              />
              {!reducedMotion && !blocked && (
                <circle r={4} className="fill-emerald-400">
                  <animateMotion
                    dur="2.1s"
                    begin={`${i * 0.5}s`}
                    repeatCount="indefinite"
                    path={`M${p1.x},${p1.y} L${p2.x},${p2.y}`}
                  />
                </circle>
              )}
            </g>
          );
        })}

        {nodes.map((node) => {
          const c = center(node);
          const nodeWidth = colNodeWidth[node.col];
          return (
            <g key={node.id}>
              <rect
                x={c.x - nodeWidth / 2}
                y={c.y - NODE_H / 2}
                width={nodeWidth}
                height={NODE_H}
                rx={8}
                className="fill-zinc-900 stroke-zinc-600"
                strokeWidth={1.5}
              />
              <text
                x={c.x}
                y={c.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="select-none fill-zinc-100 font-mono text-[11px]"
              >
                {node.label}
              </text>
            </g>
          );
        })}

        {/* Edge labels are drawn last, on top of the node boxes, so a label
            is never visually hidden behind a node even if it runs slightly
            wide of its column gap. */}
        {edges.map((edge, i) => {
          const from = nodes.find((n) => n.id === edge.from);
          const to = nodes.find((n) => n.id === edge.to);
          if (!from || !to) return null;
          const p1 = center(from);
          const p2 = center(to);
          // The label's horizontal center is the midpoint of the free space
          // between the two box EDGES, not between the box centers — when
          // the two nodes have different widths (e.g. "Client" next to a
          // long label), those two midpoints diverge, and centering on the
          // node-center midpoint pushes the label off-center into the
          // wider box.
          const leftEdgeX =
            (p1.x <= p2.x ? p1.x : p2.x) +
            colNodeWidth[(p1.x <= p2.x ? from : to).col] / 2;
          const rightEdgeX =
            (p1.x <= p2.x ? p2.x : p1.x) -
            colNodeWidth[(p1.x <= p2.x ? to : from).col] / 2;
          const midX = (leftEdgeX + rightEdgeX) / 2;
          const midY = (p1.y + p2.y) / 2;
          const blocked = edge.style === "blocked";

          // A flat vertical offset clears a same-row (horizontal) edge
          // fine, but does nothing useful once an edge also changes row —
          // the label just sits near/on the diagonal line. Offset
          // perpendicular to the edge's actual direction instead, scaled
          // by the label's own width so it clears diagonal edges too; for
          // a horizontal edge this reduces to (almost) the old behavior.
          const ldx = p2.x - p1.x;
          const ldy = p2.y - p1.y;
          const lineLen = Math.hypot(ldx, ldy) || 1;
          let lpx = -ldy / lineLen;
          let lpy = ldx / lineLen;
          if (lpy > 0) {
            lpx = -lpx;
            lpy = -lpy;
          }
          const labelOffsetFor = (text: string, extra = 0) => {
            const halfWidth = (text.length * EDGE_LABEL_CHAR_WIDTH) / 2;
            const projection = halfWidth * Math.abs(lpx) + 5 * Math.abs(lpy);
            return Math.max(projection, 8) + 4 + extra;
          };

          return (
            <g key={i}>
              {blocked && (
                <text
                  x={midX}
                  y={midY + 4}
                  textAnchor="middle"
                  className="fill-red-400 text-[13px] font-bold"
                >
                  ✕
                </text>
              )}
              {edge.label && (
                <text
                  x={midX + lpx * labelOffsetFor(edge.label, blocked ? 6 : 0)}
                  y={midY + lpy * labelOffsetFor(edge.label, blocked ? 6 : 0)}
                  textAnchor="middle"
                  className={`font-mono text-[9px] uppercase tracking-wide ${
                    blocked ? "fill-red-400" : "fill-zinc-500"
                  }`}
                >
                  {edge.label}
                </text>
              )}
              {edge.labelReverse && (
                <text
                  x={midX - lpx * labelOffsetFor(edge.labelReverse)}
                  y={midY - lpy * labelOffsetFor(edge.labelReverse)}
                  textAnchor="middle"
                  className="fill-zinc-500 font-mono text-[9px] uppercase tracking-wide"
                >
                  {edge.labelReverse}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {caption && <p className="mt-3 text-sm text-zinc-400">{caption}</p>}
    </div>
  );
}
