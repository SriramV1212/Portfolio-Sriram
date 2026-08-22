"use client";

import { useLayoutEffect, useState } from "react";

const LINES = [
  "$ compiling portfolio...",
  "$ optimizing assets...",
  "$ ready",
];

const SESSION_KEY = "portfolio-loading-shown";
const CHAR_DELAY_MS = 28;
const LINE_PAUSE_MS = 250;
const HOLD_MS = 350;
const FADE_MS = 400;

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [typedLines, setTypedLines] = useState<string[]>([]);
  const [activeLine, setActiveLine] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);

  useLayoutEffect(() => {
    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timeouts.push(setTimeout(resolve, ms));
      });

    async function play() {
      const alreadyVisited = sessionStorage.getItem(SESSION_KEY);
      if (alreadyVisited) {
        await Promise.resolve();
        if (!cancelled) setVisible(false);
        return;
      }
      sessionStorage.setItem(SESSION_KEY, "true");

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) {
        setTypedLines([...LINES]);
        setActiveLine(LINES.length);
        await wait(HOLD_MS);
      } else {
        for (let i = 0; i < LINES.length; i++) {
          if (cancelled) return;
          setActiveLine(i);
          const line = LINES[i];
          for (let j = 1; j <= line.length; j++) {
            if (cancelled) return;
            await wait(CHAR_DELAY_MS);
            setTypedLines((prev) => {
              const next = [...prev];
              next[i] = line.slice(0, j);
              return next;
            });
          }
          await wait(LINE_PAUSE_MS);
        }
        await wait(HOLD_MS);
      }
      if (cancelled) return;
      setFadingOut(true);
      await wait(FADE_MS);
      if (cancelled) return;
      setVisible(false);
    }

    document.documentElement.style.overflow = "hidden";
    play().finally(() => {
      document.documentElement.style.overflow = "";
    });

    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
      document.documentElement.style.overflow = "";
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950 transition-opacity duration-[400ms] ${
        fadingOut ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="w-full max-w-md px-6 font-mono text-sm text-emerald-400 sm:text-base">
        {LINES.map((line, i) => (
          <p key={line} className="min-h-[1.5em] whitespace-pre">
            {typedLines[i] ?? ""}
            {i === activeLine && !fadingOut && (
              <span className="cursor-blink">▋</span>
            )}
          </p>
        ))}
      </div>
    </div>
  );
}
