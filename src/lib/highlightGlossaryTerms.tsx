import type { ReactNode } from "react";
import TermHighlight from "@/components/case-study/payment/TermHighlight";

// Patterns are hand-matched to how each glossary term actually shows up
// in body prose (plurals, the DLQ abbreviation, "outbox" alone) rather
// than derived mechanically from the glossary term's display string.
const TERM_PATTERNS: { term: string; pattern: RegExp }[] = [
  { term: "Partition", pattern: /\bpartitions?\b/i },
  { term: "Consumer group", pattern: /\bconsumer group\b/i },
  { term: "Offset", pattern: /\boffsets?\b/i },
  { term: "Idempotency", pattern: /\bidempotenc(?:y|ies)\b|\bidempotent\b/i },
  { term: "Dead-letter queue (DLQ)", pattern: /\bdead-letter queue\b|\bDLQ\b/i },
  { term: "Dual-write problem", pattern: /\bdual-write\b/i },
  { term: "Transactional outbox", pattern: /\btransactional outbox\b|\boutbox\b/i },
];

// Wraps the first not-yet-seen glossary term in `text` in a clickable
// green highlight that opens the glossary panel; every later mention
// (tracked via the shared `used` set, threaded through every call site in
// page render order) renders as plain text. A single string can contain
// more than one first-occurrence — each is found and wrapped in turn.
export function highlightFirstOccurrence(text: string, used: Set<string>): ReactNode {
  const parts: ReactNode[] = [];
  let cursor = 0;
  let remaining = text;
  let offset = 0;

  while (remaining.length > 0) {
    let earliest: { index: number; length: number; term: string } | null = null;
    for (const { term, pattern } of TERM_PATTERNS) {
      if (used.has(term)) continue;
      const match = pattern.exec(remaining);
      if (match && (earliest === null || match.index < earliest.index)) {
        earliest = { index: match.index, length: match[0].length, term };
      }
    }
    if (!earliest) break;

    const matchStart = offset + earliest.index;
    const matchEnd = matchStart + earliest.length;
    parts.push(text.slice(cursor, matchStart));
    parts.push(
      <TermHighlight key={`${earliest.term}-${matchStart}`} term={earliest.term}>
        {text.slice(matchStart, matchEnd)}
      </TermHighlight>
    );
    used.add(earliest.term);
    cursor = matchEnd;
    offset = matchEnd;
    remaining = text.slice(cursor);
  }

  parts.push(text.slice(cursor));
  return parts.length > 1 ? parts : text;
}
