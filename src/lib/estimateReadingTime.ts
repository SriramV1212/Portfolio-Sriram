import type { PaymentCaseStudyContent } from "@/content/case-studies/payment/types";

const WORDS_PER_MINUTE = 200;

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// Counts words across the article's actual prose fields (paragraphs,
// captions, statements, definitions) — not structural data like node
// positions, icon names, or diagram-label strings, and not code-snippet
// bodies, which read at a very different pace than prose.
export function estimateReadingMinutes(content: PaymentCaseStudyContent): number {
  const strings: string[] = [
    content.hook,
    content.subhook,
    ...content.originStory.map((p) => p.text),
    content.prerequisiteNote,
    ...content.invariants.items.map((i) => i.statement),
    content.architecture.intro,
    ...content.architecture.pathSteps,
    content.failureLab.intro,
    ...content.failureLab.scenarios.flatMap((s) => [
      s.title,
      ...s.steps.flatMap((step) => [step.title, step.plain]),
      ...s.explanation.map((p) => p.text),
      ...(s.limitation ? [s.limitation] : []),
    ]),
    content.reliability.intro,
    ...content.reliability.subsections.flatMap((sub) => [
      sub.heading,
      ...sub.paragraphs.map((p) => p.text),
    ]),
    content.consumerScaling.intro,
    content.consumerScaling.assignmentNote,
    content.consumerScaling.measuredLabel,
    content.consumerScaling.disclaimer,
    content.consumerScaling.takeaway,
    content.dualWrite.subheading,
    ...content.dualWrite.paragraphs.map((p) => p.text),
    content.dualWrite.nextHeading,
    ...content.dualWrite.nextParagraphs.map((p) => p.text),
    content.dualWrite.lesson,
    ...content.decisions.items.flatMap((d) => [d.heading, ...d.paragraphs.map((p) => p.text)]),
    ...content.codeProof.items.map((c) => c.explanation),
    ...content.futureWork.items.flatMap((f) => [f.heading, f.text]),
    ...content.conclusion.paragraphs.map((p) => p.text),
    ...content.glossary.map((g) => g.definition),
  ];

  const totalWords = strings.reduce((sum, s) => sum + wordCount(s), 0);
  return Math.max(1, Math.round(totalWords / WORDS_PER_MINUTE));
}
