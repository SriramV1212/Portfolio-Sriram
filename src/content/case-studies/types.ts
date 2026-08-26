import type { PipelineNode, PipelineEdge } from "@/components/case-study/visuals/PipelineFlow";
import type { ClusterPoint } from "@/components/case-study/visuals/PointCluster";
import type { MiniTableState } from "@/components/case-study/visuals/MiniTable";
import type { SMState, SMTransition } from "@/components/case-study/visuals/ClickableStateMachine";
import type { TimelineSegment } from "@/components/case-study/visuals/Timeline";

export type PrimitiveVisual =
  | { kind: "pipeline"; nodes: PipelineNode[]; edges: PipelineEdge[]; caption?: string }
  | {
      kind: "cluster";
      points: ClusterPoint[];
      clusterColors: Record<string, string>;
      caption?: string;
    }
  | { kind: "table"; columns: string[]; states: MiniTableState[]; caption?: string }
  | {
      kind: "state-machine";
      states: SMState[];
      transitions: SMTransition[];
      initialId: string;
      viewBox: string;
    }
  | {
      kind: "timeline";
      segments: TimelineSegment[];
      totalDuration: number;
      unit?: string;
      caption?: string;
    };

export type FoundationVisual =
  | PrimitiveVisual
  | {
      kind: "side-by-side";
      leftLabel: string;
      left: PrimitiveVisual;
      rightLabel: string;
      right: PrimitiveVisual;
      caption?: string;
    };

export type FoundationConcept = {
  term: string;
  plain: string;
  visual: FoundationVisual;
};

export type DiagramNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
};

export type DiagramEdge = {
  from: string;
  to: string;
  label?: string;
  // Optional second label for an edge that represents two distinct
  // operations along the same connection (e.g. "deliver event" one way,
  // "commit offset" the other) — avoids drawing two overlapping lines
  // between the same pair of nodes. Additive/optional so existing diagrams
  // that don't set it render exactly as before.
  labelReverse?: string;
  dashed?: boolean;
};

export type NodeDetail = {
  title: string;
  plain: string;
  techDetail?: string;
};

export type Decision = {
  title: string;
  plain: string;
  alternative: string;
  tradeoff: string;
  ifReversed: string;
  techDetail?: string;
  comparisonVisual?: FoundationVisual;
};

export type FlowStep = {
  title: string;
  plain: string;
  detail?: string;
};

export type CodeSnippet = {
  title: string;
  lang: string;
  code: string;
  explanation: string;
};

export type GlossaryTerm = {
  term: string;
  definition: string;
};

export type CaseStudy = {
  hook: string;
  foundations: FoundationConcept[];
  overview: string[];
  diagram: {
    nodes: DiagramNode[];
    edges: DiagramEdge[];
    details: Record<string, NodeDetail>;
    viewBox: string;
  };
  flow: FlowStep[];
  decisions: Decision[];
  failureScenario: {
    title: string;
    intro: string;
    steps: FlowStep[];
  };
  pathComparison?: {
    title: string;
    visual: FoundationVisual;
  };
  codeSnippets: CodeSnippet[];
  futureWork: string[];
  glossary: GlossaryTerm[];
};
