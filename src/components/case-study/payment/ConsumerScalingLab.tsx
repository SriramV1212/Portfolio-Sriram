"use client";

import { useState } from "react";
import type { ConsumerScaling } from "@/content/case-studies/payment/types";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950";

// Partition ownership is computed here, not stored as content data — for
// any consumerCount, at most `partitionCount` consumers are ever active
// (round-robin by partition index), and the rest sit idle. This is
// explicitly a conceptual visualization of "one partition, one owning
// consumer per group," not a reproduction of Kafka's real assignment
// algorithm (range vs. sticky vs. cooperative-sticky).
function assignPartitions(partitionCount: number, consumerCount: number) {
  const activeConsumers = Math.min(consumerCount, partitionCount);
  const owners: number[][] = Array.from({ length: consumerCount }, () => []);
  for (let p = 0; p < partitionCount; p++) {
    owners[p % activeConsumers].push(p);
  }
  return owners;
}

export default function ConsumerScalingLab({ data }: { data: ConsumerScaling }) {
  const [consumerCount, setConsumerCount] = useState(data.consumerOptions[0]);
  const owners = assignPartitions(data.partitionCount, consumerCount);
  const measured = data.measured.find((m) => m.consumers === consumerCount);
  const maxSeconds = Math.max(...data.measured.map((m) => m.seconds));

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5">
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Consumer count">
        {data.consumerOptions.map((count) => (
          <button
            key={count}
            type="button"
            onClick={() => setConsumerCount(count)}
            aria-pressed={count === consumerCount}
            className={`rounded-md border px-3 py-1.5 font-mono text-sm transition-colors ${focusRing} ${
              count === consumerCount
                ? "border-emerald-500 text-emerald-400"
                : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
            }`}
          >
            {count} consumer{count === 1 ? "" : "s"}
          </button>
        ))}
      </div>

      {/* Assignment grid: rows are consumers, columns are partitions — a
          filled cell means that consumer currently owns that partition. */}
      <div className="mt-5 overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr>
              <th className="border-b border-zinc-800 py-2 pr-3 font-mono text-xs uppercase tracking-wide text-zinc-500">
                Consumer
              </th>
              {Array.from({ length: data.partitionCount }, (_, p) => (
                <th
                  key={p}
                  className="border-b border-zinc-800 px-2 py-2 text-center font-mono text-xs uppercase tracking-wide text-zinc-500"
                >
                  P{p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {owners.map((partitions, i) => {
              const idle = partitions.length === 0;
              return (
                <tr key={i}>
                  <td
                    className={`border-b border-zinc-900 py-2 pr-3 font-mono text-xs ${
                      idle ? "text-zinc-600" : "text-zinc-300"
                    }`}
                  >
                    C{i + 1}
                    {idle && <span className="ml-1.5 text-zinc-600">(idle)</span>}
                  </td>
                  {Array.from({ length: data.partitionCount }, (_, p) => (
                    <td key={p} className="border-b border-zinc-900 px-2 py-2 text-center">
                      {partitions.includes(p) && (
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500"
                          aria-label={`C${i + 1} owns partition ${p}`}
                        />
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-sm text-zinc-400">{data.takeaway}</p>

      {/* Measured results, shown only for consumer counts this project
          actually benchmarked — the extra option(s) beyond partition count
          intentionally show no bar, since no run exists for them. */}
      <div className="mt-5 border-t border-zinc-800 pt-4">
        <p className="font-mono text-xs uppercase tracking-wide text-zinc-500">
          {data.measuredLabel}
        </p>
        <div className="mt-3 space-y-1.5">
          {data.measured.map((m) => (
            <div key={m.consumers} className="flex items-center gap-3">
              <span className="w-20 shrink-0 font-mono text-xs text-zinc-400">
                {m.consumers} consumer{m.consumers === 1 ? "" : "s"}
              </span>
              <div className="h-2 flex-1 rounded-full bg-zinc-800">
                <div
                  className={`h-2 rounded-full ${
                    m.consumers === consumerCount ? "bg-emerald-500" : "bg-zinc-600"
                  }`}
                  style={{ width: `${(m.seconds / maxSeconds) * 100}%` }}
                />
              </div>
              <span className="w-14 shrink-0 text-right font-mono text-xs text-zinc-400">
                {m.seconds}s
              </span>
            </div>
          ))}
          {!measured && (
            <p className="text-sm text-zinc-500">
              No measured run at {consumerCount} consumers — this option is shown only to
              illustrate the partition ceiling above.
            </p>
          )}
        </div>
        <p className="mt-3 text-xs text-zinc-500">{data.disclaimer}</p>
      </div>
    </div>
  );
}
