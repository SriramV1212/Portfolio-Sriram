import type { DualWrite } from "@/content/case-studies/payment/types";

// Deliberately rendered as plain monospace diagrams rather than another
// SVG pipeline — this is the one section explicitly contrasting something
// shipped against something that ISN'T, and the code-like presentation
// keeps that distinction visually obvious rather than looking like every
// other architecture diagram on the page.
export default function DualWriteExplorer({ dualWrite }: { dualWrite: DualWrite }) {
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5">
          <p className="font-mono text-xs uppercase tracking-wide text-zinc-500">
            {dualWrite.currentLabel}
          </p>
          <pre className="mt-3 overflow-x-auto rounded-md border border-zinc-800 bg-zinc-950/60 p-3 font-mono text-xs leading-relaxed text-zinc-300">
            {dualWrite.currentDiagram}
          </pre>
          <p className="mt-3 text-sm text-zinc-400">{dualWrite.currentNote}</p>
        </div>

        <div className="rounded-lg border border-amber-900/60 bg-amber-500/5 p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-xs uppercase tracking-wide text-zinc-500">
              {dualWrite.nextLabel}
            </p>
            <span className="shrink-0 rounded-full border border-amber-800 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-amber-400">
              {dualWrite.nextStatusLabel}
            </span>
          </div>
          <pre className="mt-3 overflow-x-auto rounded-md border border-zinc-800 bg-zinc-950/60 p-3 font-mono text-xs leading-relaxed text-zinc-300">
            {dualWrite.nextDiagram}
          </pre>
          <p className="mt-3 text-sm text-zinc-400">{dualWrite.nextNote}</p>
        </div>
      </div>

      <p className="mt-4 text-sm text-zinc-400">{dualWrite.tradeoffNote}</p>
      {dualWrite.reconciliationNote && (
        <p className="mt-2 text-sm text-zinc-400">{dualWrite.reconciliationNote}</p>
      )}
      <p className="mt-4 border-l-2 border-emerald-800 pl-3 text-zinc-200">
        {dualWrite.lesson}
      </p>
    </div>
  );
}
