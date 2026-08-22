"use client";

import { useState } from "react";

export type MiniTableRow = {
  cells: string[];
  highlight?: "success" | "reject";
};

export type MiniTableState = {
  label: string;
  rows: MiniTableRow[];
  note?: string;
};

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950";

export default function MiniTable({
  columns,
  states,
  caption,
}: {
  columns: string[];
  states: MiniTableState[];
  caption?: string;
}) {
  const [active, setActive] = useState(0);
  const state = states[active];

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
      {states.length > 1 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {states.map((s, i) => (
            <button
              key={s.label}
              type="button"
              onClick={() => setActive(i)}
              aria-pressed={i === active}
              className={`rounded-md border px-2.5 py-1 font-mono text-xs transition-colors ${focusRing} ${
                i === active
                  ? "border-emerald-500 text-emerald-400"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="border-b border-zinc-800 pb-2 pr-4 font-mono text-xs uppercase tracking-wide text-zinc-500"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {state.rows.map((row, i) => (
              <tr
                key={i}
                className={
                  row.highlight === "success"
                    ? "bg-emerald-500/10"
                    : row.highlight === "reject"
                      ? "bg-red-500/10"
                      : ""
                }
              >
                {row.cells.map((cell, j) => (
                  <td
                    key={j}
                    className={`border-b border-zinc-900 py-2 pr-4 font-mono text-xs ${
                      row.highlight === "success"
                        ? "text-emerald-300"
                        : row.highlight === "reject"
                          ? "text-red-300"
                          : "text-zinc-300"
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {state.note && <p className="mt-3 text-sm text-zinc-400">{state.note}</p>}
      {caption && <p className="mt-2 text-sm text-zinc-500">{caption}</p>}
    </div>
  );
}
