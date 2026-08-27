// Dedicated content schema for the agentic-rag-system case study — same
// "own renderer, own schema" approach as the payment and gRPC write-ups
// (see src/content/case-studies/payment/types.ts,
// src/content/case-studies/grpc/types.ts). This project's engineering
// story is grounding/trust-boundary/evidence-fidelity, not a request-
// reliability story, so its sections differ from both — but it reuses
// every generic prose/diagram primitive that already fits (ProseParagraph,
// Invariant, DecisionNarrative, CodeSnippet, GlossaryTerm, FigureAsset,
// the full ArchitectureDiagram/ArchNode/ArchEdge/ArchTraceStep shape for
// the interactive request trace, and PipelineFlow's node/edge types for
// the smaller linear/comparison diagrams) rather than inventing new ones.
import type {
  ProseParagraph,
  Invariant,
  DecisionNarrative,
  CodeSnippet,
  GlossaryTerm,
  FigureAsset,
  ArchitectureDiagram,
} from "../types";
import type { PipelineNode, PipelineEdge } from "@/components/case-study/visuals/PipelineFlow";
import type { MiniTableState } from "@/components/case-study/visuals/MiniTable";

export type { ProseParagraph, Invariant, DecisionNarrative, FigureAsset, ArchitectureDiagram };

export type MiniPipeline = { nodes: PipelineNode[]; edges: PipelineEdge[]; caption?: string };

export type RagCaseStudyContent = {
  hook: string;
  subhook: string;
  intro: ProseParagraph[];
  assumedKnowledge: string;

  invariants: { title: string; items: Invariant[] };

  architecture: {
    title: string;
    intro: string;
    figure: FigureAsset;
    traceIntro: string;
    trace: ArchitectureDiagram;
  };

  ingestion: {
    title: string;
    intro: string;
    pipeline: MiniPipeline;
    paragraphs: ProseParagraph[];
  };

  boundary: {
    title: string;
    intro: ProseParagraph[];
    left: { label: string; workingPath: MiniPipeline; alsoPossiblePath: MiniPipeline; note: string };
    right: { label: string; workingPath: MiniPipeline; blockedPath: MiniPipeline; note: string };
    lesson: string;
  };

  inspectorFidelity: {
    title: string;
    intro: ProseParagraph[];
    matchingCase: { label: string; agent: MiniPipeline; inspector: MiniPipeline };
    divergingCase: { label: string; agent: MiniPipeline; inspector: MiniPipeline };
    paragraphs: ProseParagraph[];
  };

  abstention: {
    title: string;
    intro: ProseParagraph[];
    table: { columns: string[]; states: MiniTableState[] };
    paragraphs: ProseParagraph[];
  };

  codeOverrule: {
    title: string;
    paragraphs: ProseParagraph[];
    code: CodeSnippet;
  };

  mcpTools: {
    title: string;
    intro: string;
    table: { columns: string[]; states: MiniTableState[] };
    paragraphs: ProseParagraph[];
  };

  deployment: {
    title: string;
    intro: ProseParagraph[];
    topology: MiniPipeline;
    paragraphs: ProseParagraph[];
  };

  decisions: { title: string; items: DecisionNarrative[] };

  codeProof: { title: string; items: CodeSnippet[] };

  limitations: {
    title: string;
    topics: { heading: string; paragraphs: ProseParagraph[] }[];
  };

  openProblems: { title: string; items: string[] };

  conclusion: { title: string; paragraphs: ProseParagraph[] };

  glossary: GlossaryTerm[];
};
