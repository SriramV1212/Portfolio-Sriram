import type { ProjectEntry } from "@/data/resume";
import { grpcCaseStudy } from "@/content/case-studies/grpc/content";
import { GRPC_TERM_PATTERNS } from "@/content/case-studies/grpc/termPatterns";
import ProjectHeader from "@/components/case-study/ProjectHeader";
import Prose from "@/components/case-study/Prose";
import InvariantPanel from "@/components/case-study/InvariantPanel";
import Figure from "@/components/case-study/Figure";
import StepThrough from "@/components/case-study/StepThrough";
import CodeBlock from "@/components/case-study/CodeBlock";
import Glossary from "@/components/case-study/Glossary";
import TableOfContents from "@/components/case-study/TableOfContents";
import ScrollToTopButton from "@/components/case-study/ScrollToTopButton";
import { estimateReadingMinutes } from "@/lib/estimateReadingTime";
import type { GrpcCaseStudyContent } from "@/content/case-studies/grpc/types";

const majorHeading = "text-2xl font-bold text-emerald-400";
const subHeading = "mt-8 text-xl font-semibold text-zinc-100";

// Flattens this page's actual prose fields into the plain string list the
// generic reading-time estimator expects.
function readingStrings(content: GrpcCaseStudyContent): string[] {
  return [
    content.hook,
    content.subhook,
    ...content.intro.map((p) => p.text),
    content.assumedKnowledge,
    ...content.invariants.items.map((i) => i.statement),
    content.architecture.intro,
    ...content.architecture.steps.flatMap((s) => [s.title, s.plain]),
    content.breakSystem.intro,
    ...content.breakSystem.steps.flatMap((s) => [s.title, s.plain]),
    ...content.observability.paragraphs.map((p) => p.text),
    content.reliability.intro,
    ...content.reliability.topics.flatMap((t) => [
      t.heading,
      ...t.paragraphs.map((p) => p.text),
    ]),
    ...content.decisions.items.flatMap((d) => [
      d.heading,
      ...d.paragraphs.map((p) => p.text),
    ]),
    ...content.codeProof.items.map((c) => c.explanation),
    ...content.futureWork.items,
    ...content.conclusion.paragraphs.map((p) => p.text),
    ...content.glossary.map((g) => g.definition),
  ];
}

// Dedicated renderer for microservices-resilience-engine — same "own
// content schema, own renderer" approach as the payment write-up, adopted
// here because this project also outgrew the generic beginner-oriented
// CaseStudy template. Reuses every shared long-form-article piece the
// payment page established (TableOfContents, ScrollToTopButton, Prose,
// InvariantPanel, CodeBlock, Glossary, clickable glossary-term highlights)
// rather than rebuilding them, plus a new shared Figure component for the
// two embedded static diagrams this project asked for (not interactive —
// plain framed images). Decisions render as plain prose (heading + Prose),
// the same blog-article treatment payment's decisions settled on, not a
// bordered alternative/tradeoff card.
export default function GrpcCaseStudy({ project }: { project: ProjectEntry }) {
  const content = grpcCaseStudy;
  const readingMinutes = estimateReadingMinutes(readingStrings(content));

  // Shared, mutated in place across every Prose call below in the order
  // they actually render, so "first mention of a glossary term" reflects
  // true page order — same pattern as PaymentCaseStudy.tsx.
  const usedTerms = new Set<string>();

  const tocSections = [
    { id: "invariants", label: content.invariants.title },
    { id: "architecture", label: content.architecture.title },
    { id: "break-system", label: content.breakSystem.title },
    { id: "observability", label: content.observability.title },
    { id: "reliability", label: content.reliability.title },
    { id: "decisions", label: content.decisions.title },
    { id: "code-proof", label: content.codeProof.title },
    { id: "future-work", label: content.futureWork.title },
    { id: "conclusion", label: content.conclusion.title },
  ];

  return (
    <main className="mx-auto w-full min-w-0 max-w-[46rem] flex-1 px-6 pb-16 pt-28 2xl:pt-16">
      <TableOfContents sections={tocSections} readingMinutes={readingMinutes} />
      <ScrollToTopButton />
      <ProjectHeader project={project} />

      <p className="mt-8 text-xl leading-snug text-zinc-100">{content.hook}</p>
      <p className="mt-3 text-[1.0625rem] leading-[1.75] text-zinc-200">
        {content.subhook}
      </p>

      <div className="mt-6">
        <Prose
          paragraphs={content.intro}
          usedTerms={usedTerms}
          termPatterns={GRPC_TERM_PATTERNS}
        />
      </div>

      <p className="mt-8 border-l-2 border-zinc-800 pl-4 text-sm text-zinc-400">
        {content.assumedKnowledge}
      </p>

      <section id="invariants" className="mt-10 scroll-mt-24">
        <h2 className={majorHeading}>{content.invariants.title}</h2>
        <div className="mt-4">
          <InvariantPanel items={content.invariants.items} />
        </div>
      </section>

      <section id="architecture" className="mt-10 scroll-mt-24">
        <h2 className={majorHeading}>{content.architecture.title}</h2>
        <p className="mt-4 text-sm text-zinc-400">{content.architecture.intro}</p>
        <Figure
          src={content.architecture.figure.src}
          alt={content.architecture.figure.alt}
          width={content.architecture.figure.width}
          height={content.architecture.figure.height}
          caption={content.architecture.figure.caption}
        />
        <p className="mt-6 text-sm text-zinc-400">
          Step through the same path one request at a time:
        </p>
        <div className="mt-3">
          <StepThrough steps={content.architecture.steps} />
        </div>
      </section>

      <section id="break-system" className="mt-10 scroll-mt-24">
        <h2 className={majorHeading}>{content.breakSystem.title}</h2>
        <p className="mt-4 text-[1.0625rem] leading-[1.75] text-zinc-200">
          {content.breakSystem.intro}
        </p>
        <div className="mt-4">
          <StepThrough steps={content.breakSystem.steps} />
        </div>
      </section>

      <section id="observability" className="mt-10 scroll-mt-24">
        <h2 className={majorHeading}>{content.observability.title}</h2>
        <Figure
          src={content.observability.figure.src}
          alt={content.observability.figure.alt}
          width={content.observability.figure.width}
          height={content.observability.figure.height}
          caption={content.observability.figure.caption}
        />
        <div className="mt-6">
          <Prose
            paragraphs={content.observability.paragraphs}
            usedTerms={usedTerms}
            termPatterns={GRPC_TERM_PATTERNS}
          />
        </div>
      </section>

      <section id="reliability" className="mt-10 scroll-mt-24">
        <h2 className={majorHeading}>{content.reliability.title}</h2>
        <p className="mt-4 text-[1.0625rem] leading-[1.75] text-zinc-200">
          {content.reliability.intro}
        </p>
        {content.reliability.topics.map((topic) => (
          <div key={topic.heading}>
            <h3 className={subHeading}>{topic.heading}</h3>
            <div className="mt-3">
              <Prose
                paragraphs={topic.paragraphs}
                usedTerms={usedTerms}
                termPatterns={GRPC_TERM_PATTERNS}
              />
            </div>
          </div>
        ))}
      </section>

      <section id="decisions" className="mt-10 scroll-mt-24">
        <h2 className={majorHeading}>{content.decisions.title}</h2>
        {content.decisions.items.map((decision) => (
          <div key={decision.heading}>
            <h3 className={subHeading}>{decision.heading}</h3>
            <div className="mt-3">
              <Prose
                paragraphs={decision.paragraphs}
                usedTerms={usedTerms}
                termPatterns={GRPC_TERM_PATTERNS}
              />
            </div>
          </div>
        ))}
      </section>

      <section id="code-proof" className="mt-10 scroll-mt-24">
        <h2 className={majorHeading}>{content.codeProof.title}</h2>
        <div className="mt-4 space-y-6">
          {content.codeProof.items.map((snippet) => (
            <CodeBlock
              key={snippet.title}
              title={snippet.title}
              lang={snippet.lang}
              code={snippet.code}
              explanation={snippet.explanation}
            />
          ))}
        </div>
      </section>

      <section id="future-work" className="mt-10 scroll-mt-24">
        <h2 className={majorHeading}>{content.futureWork.title}</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-[1.0625rem] leading-[1.75] text-zinc-200">
          {content.futureWork.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </section>

      <section id="conclusion" className="mt-10 scroll-mt-24">
        <h2 className={majorHeading}>{content.conclusion.title}</h2>
        <div className="mt-4">
          <Prose
            paragraphs={content.conclusion.paragraphs}
            usedTerms={usedTerms}
            termPatterns={GRPC_TERM_PATTERNS}
          />
        </div>
      </section>

      <Glossary terms={content.glossary} />

      <div className="mt-10 border-t border-zinc-800 pt-6">
        <a
          href={project.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
        >
          View source on GitHub
          <span aria-hidden="true">→</span>
        </a>
      </div>
    </main>
  );
}
