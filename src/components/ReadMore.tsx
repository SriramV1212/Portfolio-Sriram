"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950";

// Mobile-only (sm: and up always shows the full content, unclamped — see
// the sm:line-clamp-none below): clamps whatever's passed in to 5 lines
// and offers a Read more/less toggle, but only when the content actually
// overflows at that clamp — a short tagline just renders normally with no
// button. Wraps arbitrary children (paragraphs, a <ul> of bullets,
// anything) in one clamped <div> rather than clamping a list element
// directly, since -webkit-line-clamp's display:-webkit-box mode is safest
// applied to a plain block, not a semantic list.
//
// Fixed at 5 lines (not a `lines` prop): Tailwind's JIT scanner only
// generates CSS for class names it can see as a literal string in source
// — a template-interpolated `line-clamp-${lines}` would silently produce
// no clamping at all (a real bug this project already hit once with
// `text-${node.color}`, see CLAUDE.md). Hardcoding "line-clamp-5" as a
// literal avoids that trap; add a real prop back only if a second clamp
// length is ever actually needed.
export default function ReadMore({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const el = ref.current;
    // Only remeasure while collapsed — expanded (or an sm:+ viewport,
    // where the clamp is off entirely) removes the clamp, so scrollHeight
    // would equal clientHeight and wrongly report "doesn't overflow."
    // Once expanded is toggled back off, this re-fires and remeasures
    // fresh against whatever the viewport is at that point.
    if (!el || expanded) return;
    const check = () => setOverflowing(el.scrollHeight - el.clientHeight > 1);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [expanded]);

  return (
    <div>
      <div ref={ref} className={expanded ? undefined : "line-clamp-5 sm:line-clamp-none"}>
        {children}
      </div>
      {overflowing && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className={`mt-2 text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300 sm:hidden ${focusRing}`}
        >
          {expanded ? "Read less" : "Read more"}
        </button>
      )}
    </div>
  );
}
