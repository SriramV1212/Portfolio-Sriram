import type { FoundationConcept } from "@/content/case-studies/types";
import FoundationVisualRenderer from "./FoundationVisualRenderer";

export default function FoundationSection({
  concepts,
}: {
  concepts: FoundationConcept[];
}) {
  return (
    <div className="space-y-10">
      {concepts.map((concept, i) => (
        <div key={concept.term}>
          <div className="flex items-baseline gap-2.5">
            <span className="font-mono text-xs text-zinc-600">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="text-lg font-semibold text-zinc-100">{concept.term}</h3>
          </div>
          <p className="mt-1.5 max-w-2xl text-zinc-300">{concept.plain}</p>
          <div className="mt-3">
            <FoundationVisualRenderer visual={concept.visual} />
          </div>
        </div>
      ))}
    </div>
  );
}
