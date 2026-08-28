"use client";

import { useState } from "react";

export type SMState = {
  id: string;
  label: string;
  description: string;
  x: number;
  y: number;
};

export type SMTransition = {
  from: string;
  to: string;
  label?: string;
};

const NODE_R = 34;

export default function ClickableStateMachine({
  states,
  transitions,
  initialId,
  viewBox,
}: {
  states: SMState[];
  transitions: SMTransition[];
  initialId: string;
  viewBox: string;
}) {
  const [current, setCurrent] = useState(initialId);
  const currentState = states.find((s) => s.id === current);
  const activeTransitionTargets = new Set(
    transitions.filter((t) => t.from === current).map((t) => t.to)
  );

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="overflow-x-auto">
        <svg
          viewBox={viewBox}
          className="h-auto w-full min-w-[480px]"
          role="img"
          aria-label="Clickable state diagram"
        >
        <defs>
          <marker
            id="sm-arrow"
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

        {transitions.map((t, i) => {
          const from = states.find((s) => s.id === t.from);
          const to = states.find((s) => s.id === t.to);
          if (!from || !to) return null;
          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const dist = Math.hypot(dx, dy) || 1;
          const ux = dx / dist;
          const uy = dy / dist;
          const x1 = from.x + ux * NODE_R;
          const y1 = from.y + uy * NODE_R;
          const x2 = to.x - ux * NODE_R;
          const y2 = to.y - uy * NODE_R;
          const isActive = t.from === current;
          return (
            <g key={i}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                className={isActive ? "stroke-emerald-400" : "stroke-zinc-700"}
                strokeWidth={isActive ? 2 : 1.25}
                markerEnd="url(#sm-arrow)"
              />
              {t.label && (
                <text
                  x={(x1 + x2) / 2}
                  y={(y1 + y2) / 2 - 6}
                  textAnchor="middle"
                  className={`font-mono text-[9px] uppercase tracking-wide ${
                    isActive ? "fill-emerald-400" : "fill-zinc-500"
                  }`}
                >
                  {t.label}
                </text>
              )}
            </g>
          );
        })}

        {states.map((s) => {
          const isCurrent = s.id === current;
          const isReachable = activeTransitionTargets.has(s.id);
          return (
            <g
              key={s.id}
              role="button"
              tabIndex={0}
              aria-pressed={isCurrent}
              onClick={() => setCurrent(s.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setCurrent(s.id);
                }
              }}
              className="group cursor-pointer outline-none"
            >
              <circle
                cx={s.x}
                cy={s.y}
                r={NODE_R}
                className={`fill-zinc-900 transition-colors group-focus-visible:stroke-white ${
                  isCurrent
                    ? "stroke-emerald-400"
                    : isReachable
                      ? "stroke-emerald-700 hover:stroke-emerald-500"
                      : "stroke-zinc-600 hover:stroke-emerald-500"
                }`}
                strokeWidth={isCurrent ? 2.5 : 1.5}
              />
              <text
                x={s.x}
                y={s.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`select-none font-mono text-[10px] ${
                  isCurrent ? "fill-emerald-400" : "fill-zinc-100"
                }`}
              >
                {s.label}
              </text>
            </g>
          );
        })}
        </svg>
      </div>

      <div className="mt-4 rounded-md border border-zinc-800 bg-zinc-950/60 p-4">
        <h4 className="font-semibold text-emerald-400">{currentState?.label}</h4>
        <p className="mt-1.5 text-sm text-zinc-300">{currentState?.description}</p>
        <p className="mt-2 text-xs text-zinc-600">
          Click another state above to see what happens from there.
        </p>
      </div>
    </div>
  );
}
