"use client";

import type { ReactNode } from "react";

export const OPEN_GLOSSARY_EVENT = "open-glossary-panel";

export type OpenGlossaryDetail = { term: string };

// The first mention of a glossary term in the article body: styled to
// stand out and, since it's a real button, clickable to jump straight to
// its definition. Dispatches a plain DOM CustomEvent carrying which term
// was clicked, rather than lifting shared state, since Glossary.tsx is
// used by the other two (generic) project pages too and shouldn't need
// to know this feature exists.
export default function TermHighlight({
  term,
  children,
}: {
  term: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        window.dispatchEvent(
          new CustomEvent<OpenGlossaryDetail>(OPEN_GLOSSARY_EVENT, { detail: { term } })
        )
      }
      className="rounded-sm bg-transparent p-0 font-medium text-emerald-400 underline decoration-emerald-400/40 underline-offset-2 transition-colors hover:decoration-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
    >
      {children}
    </button>
  );
}
