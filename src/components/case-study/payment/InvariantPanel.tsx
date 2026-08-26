import type { Invariant } from "@/content/case-studies/payment/types";

const statusStyles: Record<Invariant["status"], { glyph: string; color: string }> = {
  protected: { glyph: "✓", color: "text-emerald-400" },
  gap: { glyph: "!", color: "text-amber-400" },
};

// A concise editorial checkpoint, not a status dashboard — one lightly
// bordered panel holding four rows, rather than four separate cards.
export default function InvariantPanel({ items }: { items: Invariant[] }) {
  return (
    <ul className="divide-y divide-zinc-800 rounded-lg border border-zinc-800">
      {items.map((item) => {
        const style = statusStyles[item.status];
        return (
          <li key={item.statement} className="flex items-start justify-between gap-4 px-4 py-3">
            <span className="text-[1.0625rem] leading-snug text-zinc-200">{item.statement}</span>
            <span
              className={`mt-0.5 shrink-0 whitespace-nowrap font-mono text-xs uppercase tracking-wide ${style.color}`}
            >
              <span aria-hidden="true">{style.glyph} </span>
              {item.statusLabel}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
