"use client";

import { useState } from "react";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950";

export default function TechDetail({
  detail,
  label = "Show technical detail",
}: {
  detail: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`inline-flex items-center gap-1.5 rounded-sm font-mono text-xs text-emerald-400 transition-colors hover:text-emerald-300 ${focusRing}`}
      >
        <span aria-hidden="true">{open ? "▾" : "▸"}</span>
        {open ? label.replace("Show", "Hide") : label}
      </button>
      {open && (
        <p className="mt-2 rounded-md border border-zinc-800 bg-zinc-900/60 p-3 font-mono text-xs leading-relaxed text-zinc-400">
          {detail}
        </p>
      )}
    </div>
  );
}
