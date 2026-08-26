import type { DualWrite } from "@/content/case-studies/payment/types";
import Prose from "./Prose";

const subHeading = "mt-8 text-xl font-semibold text-zinc-100";

// The climax section, deliberately mostly prose: one inline diagram for
// "what happens today," paragraphs building the argument, one inline
// diagram for the proposed next step — not two side-by-side bordered
// cards competing with the article for attention.
export default function DualWriteExplorer({ dualWrite }: { dualWrite: DualWrite }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-zinc-100">{dualWrite.subheading}</h3>

      <pre className="mt-4 overflow-x-auto rounded-md border border-zinc-800 bg-zinc-950/60 p-3 font-mono text-xs leading-relaxed text-zinc-300">
        {dualWrite.currentDiagram}
      </pre>

      <div className="mt-4">
        <Prose paragraphs={dualWrite.paragraphs} />
      </div>

      <div className="mt-8 flex items-center gap-2">
        <h3 className={subHeading.replace("mt-8 ", "")}>{dualWrite.nextHeading}</h3>
        <span className="rounded-full border border-amber-800 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-amber-400">
          {dualWrite.nextStatusLabel}
        </span>
      </div>

      <pre className="mt-4 overflow-x-auto rounded-md border border-zinc-800 bg-zinc-950/60 p-3 font-mono text-xs leading-relaxed text-zinc-300">
        {dualWrite.nextDiagram}
      </pre>

      <div className="mt-4">
        <Prose paragraphs={dualWrite.nextParagraphs} />
      </div>

      <p className="mt-6 border-l-2 border-emerald-800 pl-3 text-lg text-zinc-100">
        {dualWrite.lesson}
      </p>
    </div>
  );
}
