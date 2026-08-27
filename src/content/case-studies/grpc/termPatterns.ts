import type { TermPattern } from "@/lib/highlightGlossaryTerms";

// Patterns are hand-matched to how each glossary term actually shows up
// in this page's body prose (verb forms, the spelled-out "mutual TLS",
// the code-style HALF_OPEN) rather than derived mechanically from the
// glossary term's display string — same approach as the payment page's
// termPatterns.ts.
export const GRPC_TERM_PATTERNS: TermPattern[] = [
  { term: "gRPC", pattern: /\bgRPC\b/ },
  { term: "Protobuf", pattern: /\bprotobuf\b/i },
  { term: "Retry", pattern: /\bretr(?:y|ies|ying)\b/i },
  { term: "Exponential backoff", pattern: /\bexponential backoff\b|\bbackoff\b/i },
  { term: "Circuit breaker", pattern: /\bcircuit breaker\b/i },
  { term: "Half-open", pattern: /\bhalf[\s_-]?open\b/i },
  { term: "mTLS (mutual TLS)", pattern: /\bmTLS\b|\bmutual TLS\b/i },
  { term: "Trace", pattern: /\btrace(?:s|d|able)?\b/i },
  { term: "Span", pattern: /\bspans?\b/i },
  { term: "Prometheus", pattern: /\bPrometheus\b/i },
  { term: "Grafana", pattern: /\bGrafana\b/i },
  { term: "Jaeger", pattern: /\bJaeger\b/i },
];
