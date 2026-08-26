import type { Decision } from "@/content/case-studies/types";
import TechDetail from "@/components/case-study/TechDetail";
import FoundationVisualRenderer from "@/components/case-study/foundations/FoundationVisualRenderer";

// Shared "decision, alternative, tradeoff, if-reversed" card — used by both
// the generic case-study renderer and the payment-specific one, since the
// pattern is one of the strongest parts of the portfolio and genuinely
// applies to any project.
export default function DecisionCard({ decision }: { decision: Decision }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5">
      <h3 className="font-semibold text-zinc-100">{decision.title}</h3>
      <p className="mt-2 text-zinc-300">{decision.plain}</p>
      <dl className="mt-3 space-y-2 text-sm">
        <div>
          <dt className="font-mono text-xs uppercase tracking-wide text-zinc-500">
            Alternative considered
          </dt>
          <dd className="mt-0.5 text-zinc-400">{decision.alternative}</dd>
        </div>
        <div>
          <dt className="font-mono text-xs uppercase tracking-wide text-zinc-500">
            Tradeoff
          </dt>
          <dd className="mt-0.5 text-zinc-400">{decision.tradeoff}</dd>
        </div>
        <div>
          <dt className="font-mono text-xs uppercase tracking-wide text-zinc-500">
            If reversed
          </dt>
          <dd className="mt-0.5 text-zinc-400">{decision.ifReversed}</dd>
        </div>
      </dl>
      {decision.techDetail && <TechDetail detail={decision.techDetail} />}
      {decision.comparisonVisual && (
        <div className="mt-4">
          <FoundationVisualRenderer visual={decision.comparisonVisual} />
        </div>
      )}
    </div>
  );
}
