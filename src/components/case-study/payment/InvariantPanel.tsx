import type { Invariant } from "@/content/case-studies/payment/types";

const statusStyles: Record<Invariant["status"], { border: string; badge: string; glyph: string }> = {
  protected: {
    border: "border-l-emerald-500",
    badge: "border-emerald-800 bg-emerald-500/10 text-emerald-400",
    glyph: "✓",
  },
  gap: {
    border: "border-l-amber-500",
    badge: "border-amber-800 bg-amber-500/10 text-amber-400",
    glyph: "!",
  },
};

// Establishes what the rest of the page is protecting before showing any
// implementation — a small instructional matrix, not a status dashboard.
export default function InvariantPanel({ items }: { items: Invariant[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => {
        const style = statusStyles[item.status];
        return (
          <div
            key={item.title}
            className={`rounded-lg border border-zinc-800 border-l-4 bg-zinc-900/40 p-5 ${style.border}`}
          >
            <h3 className="font-semibold text-zinc-100">{item.title}</h3>
            <p className="mt-2 text-sm text-zinc-300">{item.statement}</p>
            <span
              className={`mt-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide ${style.badge}`}
            >
              <span aria-hidden="true">{style.glyph}</span>
              {item.statusLabel}
            </span>
          </div>
        );
      })}
    </div>
  );
}
