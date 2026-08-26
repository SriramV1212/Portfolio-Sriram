import type { ProseParagraph } from "@/content/case-studies/payment/types";
import { highlightFirstOccurrence } from "@/lib/highlightGlossaryTerms";

// Article body copy: comfortable size/line-height/color for long-form
// reading, no surrounding card. A paragraph's optional `label` renders as
// a bold inline lead-in ("Tradeoff: ...") instead of a separate
// dt/dd block — this is the prose replacement for the old decision-card
// pattern.
//
// `usedTerms`, when passed, is a Set shared (by reference, mutated in
// place) across every Prose call in the page's render order — the first
// not-yet-seen glossary term in each paragraph gets highlighted and
// marked used, so later mentions anywhere else on the page render as
// plain text. Omit it and Prose renders exactly as before.
export default function Prose({
  paragraphs,
  className = "space-y-4",
  usedTerms,
}: {
  paragraphs: ProseParagraph[];
  className?: string;
  usedTerms?: Set<string>;
}) {
  return (
    <div className={className}>
      {paragraphs.map((p, i) => (
        <p key={i} className="text-[1.0625rem] leading-[1.75] text-zinc-200">
          {p.label && <strong className="text-zinc-100">{p.label}: </strong>}
          {usedTerms ? highlightFirstOccurrence(p.text, usedTerms) : p.text}
        </p>
      ))}
    </div>
  );
}
