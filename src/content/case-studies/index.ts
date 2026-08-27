import type { CaseStudy } from "./types";

// All three projects now use their own dedicated content type and
// renderer (src/content/case-studies/payment + PaymentCaseStudy.tsx,
// src/content/case-studies/grpc + GrpcCaseStudy.tsx,
// src/content/case-studies/rag + RagCaseStudy.tsx) instead of this generic
// template — see src/app/projects/[slug]/page.tsx for how each slug is
// routed. Kept in place, empty, for any future project that hasn't
// outgrown the generic template yet.
export const caseStudies: Record<string, CaseStudy> = {};
