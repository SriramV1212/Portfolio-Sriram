import type { TermPattern } from "@/lib/highlightGlossaryTerms";

// Patterns are hand-matched to how each glossary term actually shows up in
// this page's body prose (verb forms, hyphenated vs. spaced "cosine
// similarity") rather than derived mechanically from the glossary term's
// display string — same approach as the payment and gRPC pages' own
// termPatterns.ts. "Cosine similarity" and "Vector similarity" are kept
// deliberately non-overlapping: the former only matches the literal
// "cosine similarity"/"cosine-similarity" phrase, the latter matches the
// more general "similarity score(s)"/"vector search" wording used
// elsewhere, so the two terms don't compete for the same span.
export const RAG_TERM_PATTERNS: TermPattern[] = [
  { term: "RAG", pattern: /\bRAG\b/ },
  { term: "Embedding", pattern: /\bembeds?\b|\bembeddings?\b/i },
  { term: "Cosine similarity", pattern: /\bcosine[\s-]similarity\b/i },
  { term: "Vector similarity", pattern: /\bsimilarity scores?\b|\bvector search\b/i },
  { term: "Qdrant", pattern: /\bQdrant\b/ },
  { term: "MCP", pattern: /\bMCP\b/ },
  { term: "Agent", pattern: /\bagents?\b/i },
  { term: "Tool call", pattern: /\btool calls?\b/i },
  { term: "Grounding", pattern: /\bground(s|ed|ing)?\b/i },
  { term: "Abstention", pattern: /\babstentions?\b|\babstains?\b|\babstained\b|\babstaining\b/i },
  { term: "Retrieval inspector", pattern: /\bretrieval inspector\b/i },
];
