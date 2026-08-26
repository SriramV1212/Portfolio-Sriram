"use client";

import { useEffect, useState } from "react";
import type { GlossaryTerm } from "@/content/case-studies/types";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950";

export default function Glossary({ terms }: { terms: GlossaryTerm[] }) {
  const [open, setOpen] = useState(false);

  // Close on Escape, matching standard drawer/dialog behavior.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      {/* Collapsed tab: fixed to the right edge of the viewport (not the
          page), vertically centered, so it stays in place as the page
          scrolls. Sits behind the panel (lower z-index) so opening the
          panel naturally covers it; it reappears once the panel closes. */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="glossary-panel"
        className={`fixed top-1/2 right-0 z-40 flex -translate-y-1/2 flex-col items-center gap-2 rounded-l-lg border border-r-0 border-zinc-700 bg-zinc-900 px-2 py-4 text-zinc-400 shadow-lg transition-colors hover:border-emerald-500 hover:text-zinc-100 ${focusRing}`}
      >
        <span aria-hidden="true">◂</span>
        <span className="font-mono text-xs uppercase tracking-widest [writing-mode:vertical-rl]">
          Terms
        </span>
      </button>

      {/* Backdrop, click to dismiss */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Panel: fixed for the full viewport height, slides in from the
          right and stays pinned to the viewport (not the page) as the
          user scrolls, so it's reachable from anywhere on the page. */}
      <aside
        id="glossary-panel"
        aria-label="Terms used on this page"
        aria-hidden={!open}
        className={`fixed top-0 right-0 z-[60] h-dvh w-[min(22rem,100vw)] overflow-y-auto border-l border-zinc-800 bg-zinc-950 p-6 shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <span className="font-mono text-sm uppercase tracking-widest text-zinc-400">
            Terms used on this page
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close terms panel"
            className={`shrink-0 rounded-sm text-zinc-500 transition-colors hover:text-zinc-100 ${focusRing}`}
          >
            ✕
          </button>
        </div>
        <dl className="mt-6 space-y-5">
          {terms.map((term) => (
            <div key={term.term}>
              <dt className="font-mono text-sm font-semibold text-emerald-400">
                {term.term}
              </dt>
              <dd className="mt-1 text-sm text-zinc-300">{term.definition}</dd>
            </div>
          ))}
        </dl>
      </aside>
    </>
  );
}
