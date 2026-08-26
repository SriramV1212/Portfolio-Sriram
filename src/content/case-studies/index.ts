import type { CaseStudy } from "./types";
import { agenticRagSystem } from "./agentic-rag-system";
import { microservicesResilienceEngine } from "./microservices-resilience-engine";

// The payment-processing-backend case study uses its own dedicated content
// type and renderer (src/content/case-studies/payment, PaymentCaseStudy.tsx)
// instead of this generic template — see src/app/projects/[slug]/page.tsx
// for how the slug is routed to it.
export const caseStudies: Record<string, CaseStudy> = {
  "agentic-rag-system": agenticRagSystem,
  "microservices-resilience-engine": microservicesResilienceEngine,
};
