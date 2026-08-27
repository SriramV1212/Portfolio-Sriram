// Dedicated content schema for the payment-processing-backend case study.
//
// v2 (editorial pass): the page reads as a long-form article — text tells
// the story, visuals clarify hard ideas, interactions demonstrate
// behavior, code proves claims. Most sections are now arrays of
// `ProseParagraph` (a paragraph, optionally with a bold inline label like
// "Tradeoff:") rendered by <Prose>, not bordered cards. Where a generic
// type already fits (CodeSnippet, GlossaryTerm, the architecture-diagram
// shapes, FlowStep, and the visual-primitive prop types), it's reused
// rather than redefined.
import type {
  CodeSnippet,
  GlossaryTerm,
  FlowStep,
  ProseParagraph,
  Invariant,
  DecisionNarrative,
  ArchIconKind,
  ArchNode,
  ArchEdge,
  ArchTraceStep,
  ArchitectureDiagram,
} from "../types";
import type { TimelineSegment } from "@/components/case-study/visuals/Timeline";
import type {
  PipelineNode,
  PipelineEdge,
} from "@/components/case-study/visuals/PipelineFlow";

export type { ProseParagraph, Invariant };

// The illustrated architecture diagram type — icons, multi-line labels,
// and a step-by-step request trace — now lives in the shared
// content/case-studies/types.ts (promoted once the RAG write-up became a
// second consumer of the same diagram shape/component). Re-exported here
// so nothing importing from this path needs to change.
export type { ArchIconKind, ArchNode, ArchEdge, ArchTraceStep, ArchitectureDiagram };

export type ScenarioVisual =
  | {
      kind: "timeline";
      segments: TimelineSegment[];
      totalDuration: number;
      unit?: string;
    }
  | {
      kind: "pipeline";
      nodes: PipelineNode[];
      edges: PipelineEdge[];
      caption?: string;
    }
  | {
      kind: "splitbrain";
      left: { label: string; state: string };
      right: { label: string; state: string };
      takeaway: string;
    };

export type FailureScenario = {
  id: string;
  tabLabel: string;
  title: string;
  steps: FlowStep[];
  visual?: ScenarioVisual;
  explanation: ProseParagraph[];
  limitation?: string;
  gapLabel?: string;
  code?: CodeSnippet;
};

export type InlineCode = { label: string; lang: string; code: string };

export type ReliabilitySubsection = {
  heading: string;
  paragraphs: ProseParagraph[];
  codeBad?: InlineCode;
  codeGood?: InlineCode;
  comparisonDiagram?: string;
  solves?: string[];
  doesNotSolve?: string[];
};

export type ConsumerScalingMeasurement = { consumers: number; seconds: number };

export type ConsumerScaling = {
  title: string;
  intro: string;
  assignmentNote: string;
  partitionCount: number;
  consumerOptions: number[];
  measured: ConsumerScalingMeasurement[];
  measuredLabel: string;
  disclaimer: string;
  takeaway: string;
};

export type DualWrite = {
  title: string;
  subheading: string;
  currentDiagram: string;
  paragraphs: ProseParagraph[];
  nextHeading: string;
  nextStatusLabel: string;
  nextDiagram: string;
  nextParagraphs: ProseParagraph[];
  lesson: string;
};

export type { DecisionNarrative };

export type FutureWorkItem = { heading: string; text: string };

export type PaymentCaseStudyContent = {
  hook: string;
  subhook: string;
  originStory: ProseParagraph[];
  prerequisiteNote: string;
  invariants: { title: string; items: Invariant[] };
  architecture: {
    title: string;
    intro: string;
    diagram: ArchitectureDiagram;
    pathSteps: string[];
  };
  failureLab: { title: string; intro: string; scenarios: FailureScenario[] };
  reliability: { title: string; intro: string; subsections: ReliabilitySubsection[] };
  consumerScaling: ConsumerScaling;
  dualWrite: DualWrite;
  decisions: { title: string; items: DecisionNarrative[] };
  codeProof: { title: string; items: CodeSnippet[] };
  futureWork: { title: string; items: FutureWorkItem[] };
  conclusion: { title: string; paragraphs: ProseParagraph[] };
  glossary: GlossaryTerm[];
};
