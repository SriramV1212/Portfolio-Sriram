"use client";

import { useEffect, useState, useSyncExternalStore, type CSSProperties } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

export type TocSection = { id: string; label: string };

const CELEBRATED_KEY = "payment-toc-celebrated";
const SPARK_COLORS = ["#34d399", "#6ee7b7", "#10b981", "#a7f3d0"]; // emerald-400/300/500/200

type Spark = {
  id: number;
  leftPct: number;
  size: number;
  color: string;
  delay: number;
  tx: number;
  ty: number;
};

// Clustered near the bar's leading (right) edge — where the fill actually
// arrives at 100% — rather than scattered along its whole length, so the
// burst reads as coming from the completion point itself.
function generateSparks(count: number): Spark[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 18 + Math.random() * 26;
    return {
      id: i,
      leftPct: 90 + Math.random() * 10,
      size: 3 + Math.random() * 4,
      color: SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)],
      delay: Math.random() * 150,
      tx: Math.cos(angle) * distance,
      ty: Math.sin(angle) * distance,
    };
  });
}

// Hydration-safe read of "did an earlier page load this session already
// reach the end" — same useSyncExternalStore pattern useReducedMotion
// uses, for the same reason: a plain useEffect+setState here would both
// trip the set-state-in-effect lint rule and risk a hydration mismatch,
// since the server has no sessionStorage to read from (server snapshot is
// always false; the client corrects it after hydration).
function subscribeCelebrated() {
  return () => {};
}
function getCelebratedSnapshot() {
  return sessionStorage.getItem(CELEBRATED_KEY) === "true";
}
function getCelebratedServerSnapshot() {
  return false;
}

// Fixed to the viewport's left margin, only where there's actually room
// beside the centered 46rem article column (2xl+) — this never reflows
// the article itself, it's a pure progressive-enhancement addition that
// simply doesn't render at all on narrower viewports.
export default function TableOfContents({
  sections,
  readingMinutes,
}: {
  sections: TocSection[];
  readingMinutes: number;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [justCelebrated, setJustCelebrated] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const reducedMotion = useReducedMotion();

  const alreadyCelebrated = useSyncExternalStore(
    subscribeCelebrated,
    getCelebratedSnapshot,
    getCelebratedServerSnapshot
  );
  const hasCelebrated = alreadyCelebrated || justCelebrated;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          const topMost = visible.reduce((a, b) =>
            a.boundingClientRect.top < b.boundingClientRect.top ? a : b
          );
          setActiveId(topMost.target.id);
        }
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 }
    );
    const elements = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  // The celebratory effect fires once — the first time this session the
  // reader scrolls to (approximately) the very end. The sessionStorage
  // check happens inside the scroll callback itself (an event-driven
  // setState, not a synchronous effect-body one), so it's read fresh each
  // time rather than needing a ref kept in sync with two different
  // sources of "already celebrated." Particles are skipped entirely under
  // reduced motion (not just visually disabled) — same convention as the
  // pipeline traveling-dot animation elsewhere on this page.
  useEffect(() => {
    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      const clamped = Math.min(100, Math.max(0, pct));
      setProgress(clamped);
      if (clamped >= 99 && sessionStorage.getItem(CELEBRATED_KEY) !== "true") {
        sessionStorage.setItem(CELEBRATED_KEY, "true");
        setJustCelebrated(true);
        setShowCelebration(true);
        if (!reducedMotion) setSparks(generateSparks(16));
        window.setTimeout(() => setShowCelebration(false), 1300);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reducedMotion]);

  return (
    <nav aria-label="Table of contents" className="fixed left-8 top-32 hidden w-64 2xl:block">
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">
          Reading progress
        </p>
        <p className="shrink-0 font-mono text-xs text-zinc-500">{readingMinutes} min read</p>
      </div>
      <div className="relative mt-2 h-1 w-full">
        <div className="h-full w-full overflow-hidden rounded-full bg-zinc-800">
          <div
            className={`h-full rounded-full transition-[width] duration-150 ${
              hasCelebrated
                ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]"
                : "bg-emerald-500"
            } ${showCelebration ? "progress-celebrate" : ""}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        {showCelebration && sparks.length > 0 && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-visible">
            {sparks.map((s) => (
              <span
                key={s.id}
                className="spark-particle absolute rounded-full"
                style={
                  {
                    left: `${s.leftPct}%`,
                    top: "50%",
                    width: s.size,
                    height: s.size,
                    backgroundColor: s.color,
                    animationDelay: `${s.delay}ms`,
                    "--tx": `${s.tx}px`,
                    "--ty": `${s.ty}px`,
                  } as CSSProperties
                }
              />
            ))}
          </div>
        )}
      </div>

      <p className="mt-6 text-sm font-semibold text-zinc-100">On this page</p>
      <ul className="mt-3 space-y-2.5 border-l border-zinc-800 pl-4">
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              aria-current={activeId === s.id ? "true" : undefined}
              className={`block rounded-sm text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                activeId === s.id ? "font-medium text-emerald-400" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
