// Dedicated content schema for the microservices-resilience-engine case
// study — same "own renderer, own schema" approach as the payment write-up
// (see src/content/case-studies/payment/types.ts), used here because this
// project also outgrew the generic beginner-oriented CaseStudy template:
// no Foundations section, denser prose, and two embedded static figures
// instead of an interactive SVG diagram. Reuses the generic CodeSnippet,
// GlossaryTerm, FlowStep, ProseParagraph, Invariant, and DecisionNarrative
// types wherever the shape already fits, rather than redefining them —
// decisions in particular use the same plain-prose DecisionNarrative shape
// the payment page settled on (not a bordered alternative/tradeoff card),
// per the same "blog-article, not boxes" direction.
import type {
  CodeSnippet,
  GlossaryTerm,
  FlowStep,
  ProseParagraph,
  Invariant,
  DecisionNarrative,
  FigureAsset,
} from "../types";

export type { FigureAsset };

export type ReliabilityTopic = {
  heading: string;
  paragraphs: ProseParagraph[];
};

export type GrpcCaseStudyContent = {
  hook: string;
  subhook: string;
  intro: ProseParagraph[];
  assumedKnowledge: string;
  invariants: { title: string; items: Invariant[] };
  architecture: {
    title: string;
    intro: string;
    figure: FigureAsset;
    // The request path, told as a click-through sequence directly beneath
    // the diagram — the diagram shows the shape of the system; this walks
    // one request through it step by step, the same pairing the Kafka
    // write-up's architecture section uses.
    steps: FlowStep[];
  };
  breakSystem: { title: string; intro: string; steps: FlowStep[] };
  observability: {
    title: string;
    figure: FigureAsset;
    paragraphs: ProseParagraph[];
  };
  reliability: { title: string; intro: string; topics: ReliabilityTopic[] };
  decisions: { title: string; items: DecisionNarrative[] };
  codeProof: { title: string; items: CodeSnippet[] };
  futureWork: { title: string; items: string[] };
  conclusion: { title: string; paragraphs: ProseParagraph[] };
  glossary: GlossaryTerm[];
};
