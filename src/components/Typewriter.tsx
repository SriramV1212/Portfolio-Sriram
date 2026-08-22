"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

const TYPE_SPEED_MS = 60;
const DELETE_SPEED_MS = 30;
const PAUSE_MS = 1500;

export default function Typewriter({ phrases }: { phrases: string[] }) {
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"typing" | "deleting">("typing");

  useEffect(() => {
    if (reducedMotion) return;
    const current = phrases[index];

    if (phase === "typing") {
      if (text.length < current.length) {
        const timeout = setTimeout(
          () => setText(current.slice(0, text.length + 1)),
          TYPE_SPEED_MS
        );
        return () => clearTimeout(timeout);
      }
      const timeout = setTimeout(() => setPhase("deleting"), PAUSE_MS);
      return () => clearTimeout(timeout);
    }

    if (text.length > 0) {
      const timeout = setTimeout(
        () => setText(current.slice(0, text.length - 1)),
        DELETE_SPEED_MS
      );
      return () => clearTimeout(timeout);
    }
    const timeout = setTimeout(() => {
      setIndex((i) => (i + 1) % phrases.length);
      setPhase("typing");
    }, DELETE_SPEED_MS);
    return () => clearTimeout(timeout);
  }, [text, phase, index, phrases, reducedMotion]);

  if (reducedMotion) {
    return <span>{phrases[0]}</span>;
  }

  return (
    <span>
      {text}
      <span className="cursor-blink" aria-hidden="true">
        |
      </span>
    </span>
  );
}
