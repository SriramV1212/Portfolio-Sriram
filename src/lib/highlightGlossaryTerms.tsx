import type { ReactNode } from "react";
import TermHighlight from "@/components/case-study/TermHighlight";

// A glossary term paired with the regex that finds it in body prose.
// Patterns are hand-matched to how each term actually shows up in a given
// project's prose (plurals, verb forms, abbreviations vs. spelled-out
// phrases) rather than derived mechanically from the term's display
// string — each project defines its own list (see
// content/case-studies/payment/termPatterns.ts,
// content/case-studies/grpc/termPatterns.ts).
export type TermPattern = { term: string; pattern: RegExp };

// Wraps the first not-yet-seen glossary term in `text` in a clickable
// green highlight that opens the glossary panel; every later mention
// (tracked via the shared `used` set, threaded through every call site in
// page render order) renders as plain text. A single string can contain
// more than one first-occurrence — each is found and wrapped in turn.
export function highlightFirstOccurrence(
  text: string,
  used: Set<string>,
  patterns: TermPattern[]
): ReactNode {
  const parts: ReactNode[] = [];
  let cursor = 0;
  let remaining = text;
  let offset = 0;

  while (remaining.length > 0) {
    let earliest: { index: number; length: number; term: string } | null = null;
    for (const { term, pattern } of patterns) {
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
