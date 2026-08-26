import type { ReliabilityMechanism } from "@/content/case-studies/payment/types";

// Each card answers one question — "which failure does this protect
// against?" — instead of defining the mechanism in the abstract.
export default function ReliabilityMechanisms({ items }: { items: ReliabilityMechanism[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.title}
          className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5"
        >
          <h3 className="font-semibold text-zinc-100">{item.title}</h3>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="font-mono text-xs uppercase tracking-wide text-zinc-500">
                Protects against
              </dt>
              <dd className="mt-0.5 text-zinc-300">{item.protectsAgainst}</dd>
            </div>
            <div>
              <dt className="font-mono text-xs uppercase tracking-wide text-zinc-500">
                Mechanism
              </dt>
              <dd className="mt-0.5 font-mono text-xs text-zinc-400">{item.mechanism}</dd>
            </div>
          </dl>
          {item.note && (
            <p className="mt-3 border-l-2 border-emerald-800 pl-3 text-sm text-zinc-300">
              {item.note}
            </p>
          )}
          {item.doesNotSolve && (
            <div className="mt-3">
              <p className="font-mono text-xs uppercase tracking-wide text-amber-500">
                Does not automatically solve
              </p>
              <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {item.doesNotSolve.map((thing) => (
                  <li
                    key={thing}
                    className="rounded-full border border-amber-800 bg-amber-500/10 px-2 py-0.5 font-mono text-[11px] text-amber-400"
                  >
                    {thing}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
