import type { ReliabilitySubsection } from "@/content/case-studies/payment/types";
import Prose from "./Prose";

const subHeading = "mt-8 text-xl font-semibold text-zinc-100";

// Three blog-style subsections instead of a wall of "mechanism" cards.
// Inline code here is deliberately lightweight (<pre>, no Shiki chrome) —
// it's a teaching aid embedded in prose, distinct from the polished,
// titled excerpts in the "Code that proves the claim" section later on.
export default function ReliabilitySection({
  items,
  usedTerms,
}: {
  items: ReliabilitySubsection[];
  usedTerms?: Set<string>;
}) {
  return (
    <div>
      {items.map((item) => (
        <div key={item.heading}>
          <h3 className={subHeading}>{item.heading}</h3>
          <div className="mt-3">
            <Prose paragraphs={item.paragraphs.slice(0, 1)} usedTerms={usedTerms} />
          </div>

          {item.codeBad && (
            <div className="mt-4">
              <p className="font-mono text-xs uppercase tracking-wide text-zinc-500">
                {item.codeBad.label}
              </p>
              <pre className="mt-1.5 overflow-x-auto rounded-md border border-zinc-800 bg-zinc-950/60 p-3 font-mono text-xs leading-relaxed text-zinc-300">
                {item.codeBad.code}
              </pre>
            </div>
          )}

          {item.codeGood && (
            <div className="mt-4">
              <p className="font-mono text-xs uppercase tracking-wide text-emerald-400">
                {item.codeGood.label}
              </p>
              <pre className="mt-1.5 overflow-x-auto rounded-md border border-zinc-800 bg-zinc-950/60 p-3 font-mono text-xs leading-relaxed text-zinc-300">
                {item.codeGood.code}
              </pre>
            </div>
          )}

          {item.comparisonDiagram && (
            <pre className="mt-4 overflow-x-auto rounded-md border border-zinc-800 bg-zinc-950/60 p-3 font-mono text-xs leading-relaxed text-zinc-300">
              {item.comparisonDiagram}
            </pre>
          )}

          {(item.solves || item.doesNotSolve) && (
            <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3 text-sm">
              {item.solves && (
                <div>
                  <p className="font-mono text-xs uppercase tracking-wide text-emerald-400">Solves</p>
                  <p className="mt-1 max-w-xs text-zinc-300">{item.solves.join(", ")}</p>
                </div>
              )}
              {item.doesNotSolve && (
                <div>
                  <p className="font-mono text-xs uppercase tracking-wide text-amber-400">
                    Does not solve
                  </p>
                  <p className="mt-1 max-w-xs text-zinc-300">{item.doesNotSolve.join(", ")}</p>
                </div>
              )}
            </div>
          )}

          {item.paragraphs.length > 1 && (
            <div className="mt-4">
              <Prose paragraphs={item.paragraphs.slice(1)} usedTerms={usedTerms} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
