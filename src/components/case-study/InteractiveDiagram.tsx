"use client";

import { useState } from "react";
import type {
  DiagramEdge,
  DiagramNode,
  NodeDetail,
} from "@/content/case-studies/types";

const DEFAULT_WIDTH = 150;
const DEFAULT_HEIGHT = 56;

function nodeCenter(node: DiagramNode) {
  const w = node.width ?? DEFAULT_WIDTH;
  const h = node.height ?? DEFAULT_HEIGHT;
  return { x: node.x + w / 2, y: node.y + h / 2 };
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
      <svg
        viewBox={viewBox}
        className="h-auto w-full"
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
              {edge.label && (
                <text
                  x={midX}
                  y={midY - 6}
                  textAnchor="middle"
                  className="fill-zinc-500 font-mono text-[9px] uppercase tracking-wide"
                >
                  {edge.label}
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
              className="cursor-pointer focus-visible:outline-none"
            >
              <rect
                x={node.x}
                y={node.y}
                width={w}
                height={h}
                rx={8}
                className={`fill-zinc-900 transition-colors ${
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
