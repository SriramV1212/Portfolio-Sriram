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

const COL_WIDTH = 210;
const ROW_HEIGHT = 96;
const NODE_W = 160;
const NODE_H = 52;
const PAD = 28;

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
  const width = maxCol * COL_WIDTH + NODE_W + PAD * 2;
  const height = maxRow * ROW_HEIGHT + NODE_H + PAD * 2;

  const center = (node: PipelineNode) => ({
    x: PAD + node.col * COL_WIDTH + NODE_W / 2,
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
          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;
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
                  x={midX}
                  y={midY - (blocked ? 14 : 8)}
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
                  x={midX}
                  y={midY + 16}
                  textAnchor="middle"
                  className="fill-zinc-500 font-mono text-[9px] uppercase tracking-wide"
                >
                  {edge.labelReverse}
                </text>
              )}
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
          return (
            <g key={node.id}>
              <rect
                x={c.x - NODE_W / 2}
                y={c.y - NODE_H / 2}
                width={NODE_W}
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
      </svg>
      {caption && <p className="mt-3 text-sm text-zinc-400">{caption}</p>}
    </div>
  );
}
