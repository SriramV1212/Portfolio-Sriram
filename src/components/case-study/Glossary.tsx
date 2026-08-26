"use client";

import { useEffect, useRef, useState } from "react";
import type { GlossaryTerm } from "@/content/case-studies/types";
import { useReducedMotion } from "@/lib/useReducedMotion";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950";

export default function Glossary({ terms }: { terms: GlossaryTerm[] }) {
  const [open, setOpen] = useState(false);
  const [highlightedTerm, setHighlightedTerm] = useState<string | null>(null);
  const termRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const reducedMotion = useReducedMotion();

  // Close on Escape, matching standard drawer/dialog behavior.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // A plain DOM event, not a lifted prop — lets other components (e.g. a
  // clickable first-mention of a term in the article body) open this
  // panel, and say which term to highlight, without this shared
  // component needing to know they exist.
  useEffect(() => {
    const onOpenRequest = (e: Event) => {
      const term = (e as CustomEvent<{ term?: string }>).detail?.term ?? null;
      setHighlightedTerm(term);
      setOpen(true);
    };
    window.addEventListener("open-glossary-panel", onOpenRequest);
    return () => window.removeEventListener("open-glossary-panel", onOpenRequest);
  }, []);

  // Scroll the requested term into view once the panel is actually open —
  // its slide-in transition means the panel isn't necessarily at its
  // final scroll-eligible size the instant `open` flips true, but a
  // microtask-deferred scroll still lands correctly since the element is
  // already laid out (just visually translated off-screen).
  useEffect(() => {
    if (!open || !highlightedTerm) return;
    const el = termRefs.current[highlightedTerm];
    el?.scrollIntoView({ block: "center", behavior: reducedMotion ? "auto" : "smooth" });
  }, [open, highlightedTerm, reducedMotion]);

  const closePanel = () => {
    setOpen(false);
    setHighlightedTerm(null);
  };

  return (
    <>
      {/* Collapsed tab: fixed to the right edge of the viewport (not the
          page), vertically centered, so it stays in place as the page
          scrolls. Sits behind the panel (lower z-index) so opening the
          panel naturally covers it; it reappears once the panel closes. */}
      <button
        type="button"
        onClick={() => {
          if (open) {
            closePanel();
          } else {
            setHighlightedTerm(null);
            setOpen(true);
          }
        }}
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
          onClick={closePanel}
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
        onClick={() => setHighlightedTerm(null)}
        className={`fixed top-0 right-0 z-[60] h-dvh w-[min(22rem,100vw)] overflow-y-auto border-l border-zinc-800 bg-zinc-950 shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Padding lives on the header/list themselves, not the <aside> —
            a sticky child fights its scroll-parent's own padding
            otherwise, so this stays pinned at the very top instead of
            stopping short by the padding amount. */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-zinc-800 bg-zinc-950 px-6 py-6">
          <span className="font-mono text-sm uppercase tracking-widest text-zinc-400">
            Terms used on this page
          </span>
          <button
            type="button"
            onClick={closePanel}
            aria-label="Close terms panel"
            className={`shrink-0 rounded-sm text-zinc-500 transition-colors hover:text-zinc-100 ${focusRing}`}
          >
            ✕
          </button>
        </div>
        {/* A highlighted term blurs and dims every other definition, so the
            requested one visually stands alone — clicking anywhere in the
            panel (handled on the <aside> itself, above) clears it back to
            the normal, unblurred list. */}
        <dl className="space-y-5 px-6 pt-6 pb-6">
          {terms.map((term) => {
            const isHighlighted = highlightedTerm === term.term;
            const isBlurred = highlightedTerm !== null && !isHighlighted;
            return (
              <div
                key={term.term}
                ref={(el) => {
                  termRefs.current[term.term] = el;
                }}
                className={`-mx-3 rounded-md px-3 py-2 transition-all duration-300 ${
                  isHighlighted
                    ? "bg-emerald-500/10 ring-1 ring-emerald-500/40"
                    : isBlurred
                      ? "opacity-40 blur-[2px]"
                      : ""
                }`}
              >
                <dt className="font-mono text-sm font-semibold text-emerald-400">
                  {term.term}
                </dt>
                <dd className="mt-1 text-sm text-zinc-300">{term.definition}</dd>
              </div>
            );
          })}
        </dl>
      </aside>
    </>
  );
}
