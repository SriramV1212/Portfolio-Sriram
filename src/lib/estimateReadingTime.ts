const WORDS_PER_MINUTE = 200;

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// Counts words across a flat list of the article's actual prose strings
// (paragraphs, captions, statements, definitions) — callers build that list
// from their own content shape, excluding structural data (node positions,
// icon names, diagram labels) and code-snippet bodies, which read at a very
// different pace than prose.
export function estimateReadingMinutes(strings: string[]): number {
  const totalWords = strings.reduce((sum, s) => sum + wordCount(s), 0);
  return Math.max(1, Math.round(totalWords / WORDS_PER_MINUTE));
}
