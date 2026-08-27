import type { TermPattern } from "@/lib/highlightGlossaryTerms";

// Patterns are hand-matched to how each glossary term actually shows up
// in this page's body prose (plurals, the DLQ abbreviation, "outbox"
// alone) rather than derived mechanically from the glossary term's
// display string.
export const PAYMENT_TERM_PATTERNS: TermPattern[] = [
  { term: "Partition", pattern: /\bpartitions?\b/i },
  { term: "Consumer group", pattern: /\bconsumer group\b/i },
  { term: "Offset", pattern: /\boffsets?\b/i },
  { term: "Idempotency", pattern: /\bidempotenc(?:y|ies)\b|\bidempotent\b/i },
  { term: "Dead-letter queue (DLQ)", pattern: /\bdead-letter queue\b|\bDLQ\b/i },
  { term: "Dual-write problem", pattern: /\bdual-write\b/i },
  { term: "Transactional outbox", pattern: /\btransactional outbox\b|\boutbox\b/i },
];
