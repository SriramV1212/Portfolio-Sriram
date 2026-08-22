import type { CaseStudy } from "./types";
import { agenticRagSystem } from "./agentic-rag-system";
import { paymentProcessingBackend } from "./payment-processing-backend";
import { microservicesResilienceEngine } from "./microservices-resilience-engine";

export const caseStudies: Record<string, CaseStudy> = {
  "agentic-rag-system": agenticRagSystem,
  "payment-processing-backend": paymentProcessingBackend,
  "microservices-resilience-engine": microservicesResilienceEngine,
};
