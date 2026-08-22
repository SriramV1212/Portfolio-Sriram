import type { ReactNode } from "react";

export default function SideBySide({
  left,
  right,
  caption,
}: {
  left: { label: string; children: ReactNode };
  right: { label: string; children: ReactNode };
  caption?: string;
}) {
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-wide text-zinc-500">
            {left.label}
          </p>
          {left.children}
        </div>
        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-wide text-emerald-400">
            {right.label}
          </p>
          {right.children}
        </div>
      </div>
      {caption && <p className="mt-3 text-sm text-zinc-400">{caption}</p>}
    </div>
  );
}
