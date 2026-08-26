"use client";

import { useState, type ReactNode } from "react";
import type { FailureScenario } from "@/content/case-studies/payment/types";
import StepThrough from "@/components/case-study/StepThrough";
import Timeline from "@/components/case-study/visuals/Timeline";
import PipelineFlow from "@/components/case-study/visuals/PipelineFlow";
import Prose from "./Prose";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950";

// codeBlocks are pre-rendered server-side by the parent (PaymentCaseStudy)
// since CodeBlock is an async Server Component using Shiki — a "use
// client" component can't call it directly, but it can render an already-
// rendered element that was passed down as a prop. Indexed 1:1 with
// `scenarios`; entries are null where a scenario has no code excerpt.
//
// Deliberately not wrapped in one big outer card: StepThrough and the
// scenario visual already carry their own card treatment (they represent
// genuinely distinct "objects" — a control and a state), so the
// explanation/limitation below them stay plain prose instead of stacking
// another card on top.
export default function FailureLab({
  scenarios,
  codeBlocks,
}: {
  scenarios: FailureScenario[];
  codeBlocks: (ReactNode | null)[];
}) {
  const [activeId, setActiveId] = useState(scenarios[0].id);
  const activeIndex = scenarios.findIndex((s) => s.id === activeId);
  const scenario = scenarios[activeIndex];

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Failure scenario">
        {scenarios.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={s.id === activeId}
            onClick={() => setActiveId(s.id)}
            className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${focusRing} ${
              s.id === activeId
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                : "border-zinc-700 text-zinc-300 hover:border-zinc-500"
            }`}
          >
            {s.tabLabel}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <div className="flex flex-wrap items-center gap-3">
          <h4 className="text-lg font-semibold text-zinc-100">{scenario.title}</h4>
          {scenario.gapLabel && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-800 bg-amber-500/10 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide text-amber-400">
              <span aria-hidden="true">!</span>
              {scenario.gapLabel}
            </span>
          )}
        </div>

        <div className="mt-4">
          <StepThrough steps={scenario.steps} />
        </div>

        {scenario.visual && (
          <div className="mt-4">
            <ScenarioVisualView visual={scenario.visual} />
          </div>
        )}

        <div className="mt-4">
          <Prose paragraphs={scenario.explanation} />
        </div>

        {scenario.limitation && (
          <p className="mt-2 border-l-2 border-amber-800 pl-3 text-sm text-zinc-300">
            {scenario.limitation}
          </p>
        )}

        {codeBlocks[activeIndex] && <div className="mt-4">{codeBlocks[activeIndex]}</div>}
      </div>
    </div>
  );
}

function ScenarioVisualView({ visual }: { visual: NonNullable<FailureScenario["visual"]> }) {
  if (visual.kind === "timeline") {
    return (
      <Timeline
        segments={visual.segments}
        totalDuration={visual.totalDuration}
        unit={visual.unit}
      />
    );
  }
  if (visual.kind === "pipeline") {
    return <PipelineFlow nodes={visual.nodes} edges={visual.edges} caption={visual.caption} />;
  }
  // "splitbrain" — the one visual with no generic primitive to reuse: two
  // systems now disagreeing about the same fact, shown as two conflicting
  // state cards rather than a box-and-arrow diagram.
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-md border border-emerald-800 bg-emerald-500/5 p-4 text-center">
          <p className="font-mono text-xs uppercase tracking-wide text-zinc-500">
            {visual.left.label}
          </p>
          <p className="mt-2 font-mono text-sm text-emerald-400">{visual.left.state}</p>
        </div>
        <div className="rounded-md border border-red-900/60 bg-red-500/5 p-4 text-center">
          <p className="font-mono text-xs uppercase tracking-wide text-zinc-500">
            {visual.right.label}
          </p>
          <p className="mt-2 font-mono text-sm text-red-400">{visual.right.state}</p>
        </div>
      </div>
      <p className="mt-4 text-center text-lg font-semibold text-zinc-100">{visual.takeaway}</p>
    </div>
  );
}
