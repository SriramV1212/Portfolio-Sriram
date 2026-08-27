import type { ProseParagraph } from "@/content/case-studies/types";
import { highlightFirstOccurrence, type TermPattern } from "@/lib/highlightGlossaryTerms";

// Article body copy: comfortable size/line-height/color for long-form
// reading, no surrounding card. A paragraph's optional `label` renders as
// a bold inline lead-in ("Tradeoff: ...") instead of a separate
// dt/dd block — this is the prose replacement for the old decision-card
// pattern.
//
// `usedTerms` + `termPatterns`, when both passed, highlight the first
// not-yet-seen glossary term in each paragraph and mark it used, so later
// mentions anywhere else on the page render as plain text. `usedTerms` is
// a Set shared (by reference, mutated in place) across every Prose call in
// the page's render order; `termPatterns` is that page's own hand-tuned
// term/regex list (e.g. content/case-studies/grpc/termPatterns.ts). Omit
// both and Prose renders exactly as before.
export default function Prose({
  paragraphs,
  className = "space-y-4",
  usedTerms,
  termPatterns,
}: {
  paragraphs: ProseParagraph[];
  className?: string;
  usedTerms?: Set<string>;
  termPatterns?: TermPattern[];
}) {
  return (
    <div className={className}>
      {paragraphs.map((p, i) => (
        <p key={i} className="text-[1.0625rem] leading-[1.75] text-zinc-200">
          {p.label && <strong className="text-zinc-100">{p.label}: </strong>}
          {usedTerms && termPatterns
            ? highlightFirstOccurrence(p.text, usedTerms, termPatterns)
            : p.text}
        </p>
      ))}
    </div>
  );
}
