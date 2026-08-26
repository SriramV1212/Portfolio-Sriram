import type { PaymentCaseStudyContent } from "@/content/case-studies/payment/types";

// Small, deliberately unobtrusive disclaimer — replaces the beginner-level
// "Foundations" section this project used to open with. No interactivity
// needed, so this stays a plain server-rendered block.
export default function PrerequisiteNote({
  prerequisites,
}: {
  prerequisites: PaymentCaseStudyContent["prerequisites"];
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
      <p className="font-mono text-xs uppercase tracking-widest text-zinc-400">
        {prerequisites.title}
      </p>
      <p className="mt-2 text-sm text-zinc-400">{prerequisites.intro}</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {prerequisites.chips.map((chip) => (
          <li
            key={chip}
            className="rounded-full border border-zinc-700 px-2.5 py-1 font-mono text-xs text-zinc-400"
          >
            {chip}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-zinc-500">{prerequisites.kafkaNote}</p>
    </div>
  );
}
