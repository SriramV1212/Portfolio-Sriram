import type { ProseParagraph } from "@/content/case-studies/payment/types";

// Article body copy: comfortable size/line-height/color for long-form
// reading, no surrounding card. A paragraph's optional `label` renders as
// a bold inline lead-in ("Tradeoff: ...") instead of a separate
// dt/dd block — this is the prose replacement for the old decision-card
// pattern.
export default function Prose({
  paragraphs,
  className = "space-y-4",
}: {
  paragraphs: ProseParagraph[];
  className?: string;
}) {
  return (
    <div className={className}>
      {paragraphs.map((p, i) => (
        <p key={i} className="text-[1.0625rem] leading-[1.75] text-zinc-200">
          {p.label && <strong className="text-zinc-100">{p.label}: </strong>}
          {p.text}
        </p>
      ))}
    </div>
  );
}
