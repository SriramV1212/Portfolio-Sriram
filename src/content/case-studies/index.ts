import type { CaseStudy } from "./types";
import { agenticRagSystem } from "./agentic-rag-system";

// The payment-processing-backend and microservices-resilience-engine case
// studies each use their own dedicated content type and renderer
// (src/content/case-studies/payment + PaymentCaseStudy.tsx,
// src/content/case-studies/grpc + GrpcCaseStudy.tsx) instead of this
// generic template — see src/app/projects/[slug]/page.tsx for how each
// slug is routed.
export const caseStudies: Record<string, CaseStudy> = {
  "agentic-rag-system": agenticRagSystem,
};
