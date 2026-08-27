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
} from "../types";
import type { TimelineSegment } from "@/components/case-study/visuals/Timeline";
import type {
  PipelineNode,
  PipelineEdge,
} from "@/components/case-study/visuals/PipelineFlow";

export type { ProseParagraph, Invariant };

// The illustrated architecture diagram — icons, multi-line labels, and a
// step-by-step request trace. Distinct from the generic `DiagramNode`/
// `DiagramEdge` shapes used by the other two projects' InteractiveDiagram,
// since this one needs icons, multi-line labels, and parallel edges
// between the same two nodes (Kafka <-> Consumer), none of which the
// generic click-to-inspect diagram was designed for.
export type ArchIconKind = "monitor" | "braces" | "database" | "kafka" | "gear" | "tray";

export type ArchNode = {
  id: string;
  label: string[];
  icon: ArchIconKind;
  color: string;
  x: number;
  y: number;
};

export type ArchEdge = {
  id: string;
  from: string;
  to: string;
  label: string[];
  dashed?: boolean;
  parallelOffset?: number;
};

export type ArchTraceStep = {
  caption: string;
  nodeIds: string[];
  edgeIds: string[];
};

export type ArchitectureDiagram = {
  viewBox: string;
  nodes: ArchNode[];
  edges: ArchEdge[];
  trace: ArchTraceStep[];
};

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
