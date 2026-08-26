// Dedicated content schema for the payment-processing-backend case study.
//
// This project gets its own renderer (see PaymentCaseStudy.tsx) instead of
// going through the generic `CaseStudy` template used by the other two
// projects — the page is structured around invariants/failure scenarios,
// not foundations/overview/flow, so forcing it into that shape would make
// both schemas awkward. Where a generic type already fits (Decision,
// CodeSnippet, GlossaryTerm, the architecture-diagram shapes, FlowStep,
// and the visual-primitive prop types), it's reused rather than redefined.
import type {
  Decision,
  CodeSnippet,
  GlossaryTerm,
  DiagramNode,
  DiagramEdge,
  NodeDetail,
  FlowStep,
} from "../types";
import type { TimelineSegment } from "@/components/case-study/visuals/Timeline";
import type {
  PipelineNode,
  PipelineEdge,
} from "@/components/case-study/visuals/PipelineFlow";

export type Invariant = {
  title: string;
  statement: string;
  status: "protected" | "gap";
  statusLabel: string;
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
  explanationTitle: string;
  explanation: string;
  limitation?: string;
  gapLabel?: string;
  code?: CodeSnippet;
};

export type ReliabilityMechanism = {
  title: string;
  protectsAgainst: string;
  mechanism: string;
  note?: string;
  doesNotSolve?: string[];
};

export type ConsumerScalingMeasurement = { consumers: number; seconds: number };

export type ConsumerScaling = {
  title: string;
  subtitle: string;
  partitionCount: number;
  consumerOptions: number[];
  measured: ConsumerScalingMeasurement[];
  measuredLabel: string;
  disclaimer: string;
  takeaway: string;
};

export type DualWrite = {
  title: string;
  currentLabel: string;
  currentDiagram: string;
  currentNote: string;
  nextLabel: string;
  nextDiagram: string;
  nextStatusLabel: string;
  nextNote: string;
  tradeoffNote: string;
  reconciliationNote?: string;
  lesson: string;
};

export type PaymentCaseStudyContent = {
  hook: string;
  subhook: string;
  prerequisites: {
    title: string;
    intro: string;
    chips: string[];
    kafkaNote: string;
  };
  learningOutcomes: { title: string; items: string[] };
  invariants: { title: string; items: Invariant[] };
  architecture: {
    title: string;
    intro: string;
    nodes: DiagramNode[];
    edges: DiagramEdge[];
    details: Record<string, NodeDetail>;
    viewBox: string;
    caption?: string;
  };
  failureLab: { title: string; subtitle: string; scenarios: FailureScenario[] };
  mechanisms: { title: string; items: ReliabilityMechanism[] };
  consumerScaling: ConsumerScaling;
  dualWrite: DualWrite;
  decisions: Decision[];
  futureWork: { title: string; items: string[] };
  glossary: GlossaryTerm[];
};
