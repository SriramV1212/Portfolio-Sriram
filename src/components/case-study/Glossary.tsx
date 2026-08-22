"use client";

import { useState } from "react";
import type { GlossaryTerm } from "@/content/case-studies/types";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950";

export default function Glossary({ terms }: { terms: GlossaryTerm[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`flex w-full items-center justify-between rounded-sm text-left ${focusRing}`}
      >
        <span className="font-mono text-sm uppercase tracking-widest text-zinc-400">
          Terms used on this page
        </span>
        <span aria-hidden="true" className="text-zinc-500">
          {open ? "▾" : "▸"}
        </span>
      </button>
      {open && (
        <dl className="mt-4 space-y-3">
          {terms.map((term) => (
            <div key={term.term}>
              <dt className="font-mono text-sm font-semibold text-emerald-400">
                {term.term}
              </dt>
              <dd className="mt-0.5 text-sm text-zinc-300">
                {term.definition}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
