"use client";

import { useState } from "react";
import type { FlowStep } from "@/content/case-studies/types";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950";

export default function StepThrough({ steps }: { steps: FlowStep[] }) {
  const [index, setIndex] = useState(0);
  const step = steps[index];
  const isFirst = index === 0;
  const isLast = index === steps.length - 1;

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6">
      <div className="flex items-center gap-2">
        {steps.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Go to step ${i + 1}`}
            aria-current={i === index}
            className={`h-2 w-2 rounded-full transition-colors ${focusRing} ${
              i === index ? "bg-emerald-400" : "bg-zinc-700 hover:bg-zinc-600"
            }`}
          />
        ))}
        <span className="ml-2 font-mono text-xs text-zinc-500">
          Step {index + 1} of {steps.length}
        </span>
      </div>

      <h4 className="mt-4 text-lg font-semibold text-zinc-100">
        {step.title}
      </h4>
      <p className="mt-2 text-zinc-300">{step.plain}</p>
      {step.detail && (
        <p className="mt-2 font-mono text-xs leading-relaxed text-zinc-500">
          {step.detail}
        </p>
      )}

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={isFirst}
          className={`inline-flex items-center gap-1.5 rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-100 transition-colors hover:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-zinc-700 ${focusRing}`}
        >
          <span aria-hidden="true">←</span> Prev
        </button>
        <button
          type="button"
          onClick={() => setIndex((i) => Math.min(steps.length - 1, i + 1))}
          disabled={isLast}
          className={`inline-flex items-center gap-1.5 rounded-md bg-emerald-500 px-3 py-1.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-emerald-500 ${focusRing}`}
        >
          Next <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}
