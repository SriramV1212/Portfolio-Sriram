import type { ProjectEntry } from "@/data/resume";
import { ragCaseStudy } from "@/content/case-studies/rag/content";
import { RAG_TERM_PATTERNS } from "@/content/case-studies/rag/termPatterns";
import ProjectHeader from "@/components/case-study/ProjectHeader";
import Prose from "@/components/case-study/Prose";
import InvariantPanel from "@/components/case-study/InvariantPanel";
import Figure from "@/components/case-study/Figure";
import TracedArchitectureDiagram from "@/components/case-study/TracedArchitectureDiagram";
import CodeBlock from "@/components/case-study/CodeBlock";
import Glossary from "@/components/case-study/Glossary";
import TableOfContents from "@/components/case-study/TableOfContents";
import ScrollToTopButton from "@/components/case-study/ScrollToTopButton";
import PipelineFlow from "@/components/case-study/visuals/PipelineFlow";
import SideBySide from "@/components/case-study/visuals/SideBySide";
import MiniTable from "@/components/case-study/visuals/MiniTable";
import { estimateReadingMinutes } from "@/lib/estimateReadingTime";
import type { RagCaseStudyContent } from "@/content/case-studies/rag/types";

const majorHeading = "text-2xl font-bold text-emerald-400";
const subHeading = "mt-8 text-xl font-semibold text-zinc-100";

function readingStrings(content: RagCaseStudyContent): string[] {
  return [
    content.hook,
    content.subhook,
    ...content.intro.map((p) => p.text),
    content.assumedKnowledge,
    ...content.invariants.items.map((i) => i.statement),
    content.architecture.intro,
    content.architecture.traceIntro,
    ...content.architecture.trace.trace.map((s) => s.caption),
    content.ingestion.intro,
    ...content.ingestion.paragraphs.map((p) => p.text),
    ...content.boundary.intro.map((p) => p.text),
    content.boundary.left.note,
    content.boundary.right.note,
    content.boundary.lesson,
    ...content.inspectorFidelity.intro.map((p) => p.text),
    ...content.inspectorFidelity.paragraphs.map((p) => p.text),
    ...content.abstention.intro.map((p) => p.text),
    ...content.abstention.paragraphs.map((p) => p.text),
    ...content.codeOverrule.paragraphs.map((p) => p.text),
    content.mcpTools.intro,
    ...content.mcpTools.paragraphs.map((p) => p.text),
    ...content.deployment.intro.map((p) => p.text),
    ...content.deployment.paragraphs.map((p) => p.text),
    ...content.decisions.items.flatMap((d) => [d.heading, ...d.paragraphs.map((p) => p.text)]),
    ...content.codeProof.items.map((c) => c.explanation),
    ...content.limitations.topics.flatMap((t) => [t.heading, ...t.paragraphs.map((p) => p.text)]),
    ...content.openProblems.items,
    ...content.conclusion.paragraphs.map((p) => p.text),
    ...content.glossary.map((g) => g.definition),
  ];
}

// Dedicated renderer for agentic-rag-system — same "own content schema, own
// renderer" approach as the payment and gRPC write-ups, adopted here
// because this project's engineering story (grounding, trust boundaries,
// evidence fidelity, deterministic safeguards over a probabilistic model)
// doesn't fit the generic beginner-oriented CaseStudy template either.
// Reuses every shared long-form-article piece already established
// (TableOfContents, ScrollToTopButton, Prose + clickable glossary-term
// highlights, InvariantPanel, Figure, CodeBlock, Glossary) plus the
// TracedArchitectureDiagram + PipelineFlow/SideBySide/MiniTable visual
// primitives already proven on the payment/gRPC pages and in the
// Foundations visual set — no new bespoke diagram component was needed for
// this page beyond a RAG-specific icon set and node/edge data.
export default function RagCaseStudy({ project }: { project: ProjectEntry }) {
  const content = ragCaseStudy;
  const readingMinutes = estimateReadingMinutes(readingStrings(content));

  // Shared, mutated in place across every Prose call below in the order
  // they actually render, so "first mention of a glossary term" reflects
  // true page order — same pattern as PaymentCaseStudy.tsx / GrpcCaseStudy.tsx.
  const usedTerms = new Set<string>();

  const tocSections = [
    { id: "invariants", label: content.invariants.title },
    { id: "architecture", label: content.architecture.title },
    { id: "request-trace", label: "Follow one question through the system" },
    { id: "ingestion", label: content.ingestion.title },
    { id: "boundary", label: content.boundary.title },
    { id: "inspector-fidelity", label: content.inspectorFidelity.title },
    { id: "abstention", label: content.abstention.title },
    { id: "deployment", label: content.deployment.title },
    { id: "decisions", label: content.decisions.title },
    { id: "code-proof", label: content.codeProof.title },
    { id: "limitations", label: content.limitations.title },
    { id: "open-problems", label: content.openProblems.title },
    { id: "conclusion", label: content.conclusion.title },
  ];

  return (
    <main className="mx-auto max-w-[46rem] flex-1 px-6 py-16">
      <TableOfContents sections={tocSections} readingMinutes={readingMinutes} />
      <ScrollToTopButton />
      <ProjectHeader project={project} />

      <p className="mt-8 text-xl leading-snug text-zinc-100">{content.hook}</p>
      <p className="mt-3 text-[1.0625rem] leading-[1.75] text-zinc-200">{content.subhook}</p>

      <div className="mt-6">
        <Prose paragraphs={content.intro} usedTerms={usedTerms} termPatterns={RAG_TERM_PATTERNS} />
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
      </section>

      <section id="request-trace" className="mt-10 scroll-mt-24">
        <h2 className={majorHeading}>Follow one question through the system</h2>
        <p className="mt-4 text-sm text-zinc-400">{content.architecture.traceIntro}</p>
        <div className="mt-4">
          <TracedArchitectureDiagram diagram={content.architecture.trace} />
        </div>
      </section>

      <section id="ingestion" className="mt-10 scroll-mt-24">
        <h2 className={majorHeading}>{content.ingestion.title}</h2>
        <p className="mt-4 text-sm text-zinc-400">{content.ingestion.intro}</p>
        <div className="mt-4">
          <PipelineFlow
            nodes={content.ingestion.pipeline.nodes}
            edges={content.ingestion.pipeline.edges}
            caption={content.ingestion.pipeline.caption}
          />
        </div>
        <div className="mt-6">
          <Prose
            paragraphs={content.ingestion.paragraphs}
            usedTerms={usedTerms}
            termPatterns={RAG_TERM_PATTERNS}
          />
        </div>
      </section>

      <section id="boundary" className="mt-10 scroll-mt-24">
        <h2 className={majorHeading}>{content.boundary.title}</h2>
        <div className="mt-4">
          <Prose paragraphs={content.boundary.intro} usedTerms={usedTerms} termPatterns={RAG_TERM_PATTERNS} />
        </div>

        <div className="mt-6">
          <SideBySide
            left={{
              label: content.boundary.left.label,
              children: (
                <div className="space-y-3">
                  <PipelineFlow
                    nodes={content.boundary.left.workingPath.nodes}
                    edges={content.boundary.left.workingPath.edges}
                    caption={content.boundary.left.workingPath.caption}
                  />
                  <PipelineFlow
                    nodes={content.boundary.left.alsoPossiblePath.nodes}
                    edges={content.boundary.left.alsoPossiblePath.edges}
                    caption={content.boundary.left.alsoPossiblePath.caption}
                  />
                  <p className="text-sm text-zinc-400">{content.boundary.left.note}</p>
                </div>
              ),
            }}
            right={{
              label: content.boundary.right.label,
              children: (
                <div className="space-y-3">
                  <PipelineFlow
                    nodes={content.boundary.right.workingPath.nodes}
                    edges={content.boundary.right.workingPath.edges}
                    caption={content.boundary.right.workingPath.caption}
                  />
                  <PipelineFlow
                    nodes={content.boundary.right.blockedPath.nodes}
                    edges={content.boundary.right.blockedPath.edges}
                    caption={content.boundary.right.blockedPath.caption}
                  />
                  <p className="text-sm text-zinc-400">{content.boundary.right.note}</p>
                </div>
              ),
            }}
          />
        </div>

        <p className="mt-6 text-[1.0625rem] leading-[1.75] text-zinc-200">{content.boundary.lesson}</p>

        <h3 className={subHeading}>{content.mcpTools.title}</h3>
        <p className="mt-3 text-sm text-zinc-400">{content.mcpTools.intro}</p>
        <div className="mt-4">
          <MiniTable columns={content.mcpTools.table.columns} states={content.mcpTools.table.states} />
        </div>
        <div className="mt-4">
          <Prose
            paragraphs={content.mcpTools.paragraphs}
            usedTerms={usedTerms}
            termPatterns={RAG_TERM_PATTERNS}
          />
        </div>
      </section>

      <section id="inspector-fidelity" className="mt-10 scroll-mt-24">
        <h2 className={majorHeading}>{content.inspectorFidelity.title}</h2>
        <div className="mt-4">
          <Prose
            paragraphs={content.inspectorFidelity.intro}
            usedTerms={usedTerms}
            termPatterns={RAG_TERM_PATTERNS}
          />
        </div>

        <div className="mt-6">
          <p className="mb-2 font-mono text-xs uppercase tracking-wide text-emerald-400">
            {content.inspectorFidelity.matchingCase.label}
          </p>
          <div className="space-y-3">
            <PipelineFlow
              nodes={content.inspectorFidelity.matchingCase.agent.nodes}
              edges={content.inspectorFidelity.matchingCase.agent.edges}
              caption={content.inspectorFidelity.matchingCase.agent.caption}
            />
            <PipelineFlow
              nodes={content.inspectorFidelity.matchingCase.inspector.nodes}
              edges={content.inspectorFidelity.matchingCase.inspector.edges}
              caption={content.inspectorFidelity.matchingCase.inspector.caption}
            />
          </div>
        </div>

        <div className="mt-6">
          <p className="mb-2 font-mono text-xs uppercase tracking-wide text-amber-400">
            {content.inspectorFidelity.divergingCase.label}
          </p>
          <div className="space-y-3">
            <PipelineFlow
              nodes={content.inspectorFidelity.divergingCase.agent.nodes}
              edges={content.inspectorFidelity.divergingCase.agent.edges}
              caption={content.inspectorFidelity.divergingCase.agent.caption}
            />
            <PipelineFlow
              nodes={content.inspectorFidelity.divergingCase.inspector.nodes}
              edges={content.inspectorFidelity.divergingCase.inspector.edges}
              caption={content.inspectorFidelity.divergingCase.inspector.caption}
            />
          </div>
        </div>

        <div className="mt-6">
          <Prose
            paragraphs={content.inspectorFidelity.paragraphs}
            usedTerms={usedTerms}
            termPatterns={RAG_TERM_PATTERNS}
          />
        </div>
      </section>

      <section id="abstention" className="mt-10 scroll-mt-24">
        <h2 className={majorHeading}>{content.abstention.title}</h2>
        <div className="mt-4">
          <Prose
            paragraphs={content.abstention.intro}
            usedTerms={usedTerms}
            termPatterns={RAG_TERM_PATTERNS}
          />
        </div>
        <div className="mt-4">
          <MiniTable columns={content.abstention.table.columns} states={content.abstention.table.states} />
        </div>
        <div className="mt-4">
          <Prose
            paragraphs={content.abstention.paragraphs}
            usedTerms={usedTerms}
            termPatterns={RAG_TERM_PATTERNS}
          />
        </div>

        <h3 className={subHeading}>{content.codeOverrule.title}</h3>
        <div className="mt-3">
          <Prose
            paragraphs={content.codeOverrule.paragraphs}
            usedTerms={usedTerms}
            termPatterns={RAG_TERM_PATTERNS}
          />
        </div>
        <div className="mt-4">
          <CodeBlock
            title={content.codeOverrule.code.title}
            lang={content.codeOverrule.code.lang}
            code={content.codeOverrule.code.code}
            explanation={content.codeOverrule.code.explanation}
          />
        </div>
      </section>

      <section id="deployment" className="mt-10 scroll-mt-24">
        <h2 className={majorHeading}>{content.deployment.title}</h2>
        <div className="mt-4">
          <Prose
            paragraphs={content.deployment.intro}
            usedTerms={usedTerms}
            termPatterns={RAG_TERM_PATTERNS}
          />
        </div>
        <div className="mt-4">
          <PipelineFlow
            nodes={content.deployment.topology.nodes}
            edges={content.deployment.topology.edges}
            caption={content.deployment.topology.caption}
          />
        </div>
        <div className="mt-4">
          <Prose
            paragraphs={content.deployment.paragraphs}
            usedTerms={usedTerms}
            termPatterns={RAG_TERM_PATTERNS}
          />
        </div>
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
                termPatterns={RAG_TERM_PATTERNS}
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

      <section id="limitations" className="mt-10 scroll-mt-24">
        <h2 className={majorHeading}>{content.limitations.title}</h2>
        {content.limitations.topics.map((topic) => (
          <div key={topic.heading}>
            <h3 className={subHeading}>{topic.heading}</h3>
            <div className="mt-3">
              <Prose
                paragraphs={topic.paragraphs}
                usedTerms={usedTerms}
                termPatterns={RAG_TERM_PATTERNS}
              />
            </div>
          </div>
        ))}
      </section>

      <section id="open-problems" className="mt-10 scroll-mt-24">
        <h2 className={majorHeading}>{content.openProblems.title}</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-[1.0625rem] leading-[1.75] text-zinc-200">
          {content.openProblems.items.map((item, i) => (
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
            termPatterns={RAG_TERM_PATTERNS}
          />
        </div>
      </section>

      <Glossary terms={content.glossary} />

      <div className="mt-12 border-t border-zinc-800 pt-8">
        <h2 className={majorHeading}>Check out my post on LinkedIn!</h2>
        {/* LinkedIn's public post-embed iframe has no documented dark-mode
            option — it's cross-origin content, so its own background/text
            colors aren't stylable from here. Framed in a dark card instead
            of fighting it, so the light widget reads as an intentional
            inset rather than a mismatched leftover. Same treatment as the
            payment write-up's LinkedIn embed. */}
        <div className="mx-auto mt-4 w-full max-w-[504px] rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
          <iframe
            src="https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7482365626854961153?collapsed=1"
            title="Embedded post"
            loading="lazy"
            allowFullScreen
            frameBorder={0}
            style={{ width: "100%", aspectRatio: "504 / 567" }}
            className="rounded-md"
          />
        </div>
      </div>

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
