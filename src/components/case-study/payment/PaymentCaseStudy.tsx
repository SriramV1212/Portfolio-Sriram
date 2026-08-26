import type { ProjectEntry } from "@/data/resume";
import { paymentCaseStudy } from "@/content/case-studies/payment/content";
import ProjectHeader from "@/components/case-study/ProjectHeader";
import PaymentArchitectureDiagram from "@/components/case-study/payment/PaymentArchitectureDiagram";
import CodeBlock from "@/components/case-study/CodeBlock";
import Glossary from "@/components/case-study/Glossary";
import PrerequisiteNote from "@/components/case-study/payment/PrerequisiteNote";
import InvariantPanel from "@/components/case-study/payment/InvariantPanel";
import FailureLab from "@/components/case-study/payment/FailureLab";
import ReliabilitySection from "@/components/case-study/payment/ReliabilitySection";
import ConsumerScalingLab from "@/components/case-study/payment/ConsumerScalingLab";
import DualWriteExplorer from "@/components/case-study/payment/DualWriteExplorer";
import Prose from "@/components/case-study/payment/Prose";
import TableOfContents from "@/components/case-study/payment/TableOfContents";
import ScrollToTopButton from "@/components/case-study/payment/ScrollToTopButton";
import { estimateReadingMinutes } from "@/lib/estimateReadingTime";

const majorHeading = "text-2xl font-bold text-emerald-400";
const subHeading = "mt-8 text-xl font-semibold text-zinc-100";

// Dedicated renderer for the payment-processing-backend case study —
// v2, an editorial pass toward a long-form article: text carries the
// story, visuals clarify hard ideas, interactions demonstrate behavior,
// code proves claims. Async because CodeBlock (used both directly below
// and inside the Failure Lab) is an async Server Component using Shiki;
// the Failure Lab's per-scenario excerpts are pre-rendered here and
// handed down to that client component as plain ReactNodes.
export default async function PaymentCaseStudy({ project }: { project: ProjectEntry }) {
  const content = paymentCaseStudy;

  const failureLabCodeBlocks = await Promise.all(
    content.failureLab.scenarios.map((scenario) =>
      scenario.code
        ? CodeBlock({
            title: scenario.code.title,
            lang: scenario.code.lang,
            code: scenario.code.code,
            explanation: scenario.code.explanation,
          })
        : Promise.resolve(null)
    )
  );

  // Shared, mutated in place across every Prose call below in the order
  // they actually render, so "first mention of a glossary term" reflects
  // true page order rather than being computed per-section in isolation.
  const usedTerms = new Set<string>();

  const readingMinutes = estimateReadingMinutes(content);

  const tocSections = [
    { id: "invariants", label: content.invariants.title },
    { id: "architecture", label: content.architecture.title },
    { id: "failure-lab", label: content.failureLab.title },
    { id: "reliability", label: content.reliability.title },
    { id: "consumer-scaling", label: content.consumerScaling.title },
    { id: "dual-write", label: content.dualWrite.title },
    { id: "decisions", label: content.decisions.title },
    { id: "code-proof", label: content.codeProof.title },
    { id: "future-work", label: content.futureWork.title },
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
        <Prose paragraphs={content.originStory} usedTerms={usedTerms} />
      </div>

      <div className="mt-8">
        <PrerequisiteNote note={content.prerequisiteNote} />
      </div>

      <section id="invariants" className="mt-10 scroll-mt-24">
        <h2 className={majorHeading}>{content.invariants.title}</h2>
        <div className="mt-4">
          <InvariantPanel items={content.invariants.items} />
        </div>
      </section>

      <section id="architecture" className="mt-10 scroll-mt-24">
        <h2 className={majorHeading}>{content.architecture.title}</h2>
        <p className="mt-4 text-sm text-zinc-400">{content.architecture.intro}</p>
        <div className="mt-4">
          <PaymentArchitectureDiagram diagram={content.architecture.diagram} />
        </div>
        <ol className="mt-6 list-decimal space-y-3 pl-5 marker:text-zinc-500">
          {content.architecture.pathSteps.map((step, i) => (
            <li key={i} className="text-[1.0625rem] leading-[1.75] text-zinc-200">
              {step}
            </li>
          ))}
        </ol>
      </section>

      <section id="failure-lab" className="mt-10 scroll-mt-24">
        <h2 className={majorHeading}>{content.failureLab.title}</h2>
        <p className="mt-4 text-[1.0625rem] leading-[1.75] text-zinc-200">
          {content.failureLab.intro}
        </p>
        <div className="mt-6">
          <FailureLab scenarios={content.failureLab.scenarios} codeBlocks={failureLabCodeBlocks} />
        </div>
      </section>

      <section id="reliability" className="mt-10 scroll-mt-24">
        <h2 className={majorHeading}>{content.reliability.title}</h2>
        <p className="mt-4 text-[1.0625rem] leading-[1.75] text-zinc-200">
          {content.reliability.intro}
        </p>
        <ReliabilitySection items={content.reliability.subsections} usedTerms={usedTerms} />
      </section>

      <section id="consumer-scaling" className="mt-10 scroll-mt-24">
        <h2 className={majorHeading}>{content.consumerScaling.title}</h2>
        <p className="mt-4 text-[1.0625rem] leading-[1.75] text-zinc-200">
          {content.consumerScaling.intro}
        </p>
        <div className="mt-4">
          <ConsumerScalingLab data={content.consumerScaling} />
        </div>
      </section>

      <section id="dual-write" className="mt-10 scroll-mt-24">
        <h2 className={majorHeading}>{content.dualWrite.title}</h2>
        <div className="mt-4">
          <DualWriteExplorer dualWrite={content.dualWrite} usedTerms={usedTerms} />
        </div>
      </section>

      <section id="decisions" className="mt-10 scroll-mt-24">
        <h2 className={majorHeading}>{content.decisions.title}</h2>
        {content.decisions.items.map((decision) => (
          <div key={decision.heading}>
            <h3 className={subHeading}>{decision.heading}</h3>
            <div className="mt-3">
              <Prose paragraphs={decision.paragraphs} usedTerms={usedTerms} />
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
        {content.futureWork.items.map((item) => (
          <div key={item.heading} className="mt-5">
            <h4 className="text-base font-semibold text-zinc-100">{item.heading}</h4>
            <p className="mt-1.5 text-[1.0625rem] leading-[1.75] text-zinc-200">{item.text}</p>
          </div>
        ))}
      </section>

      <section id="conclusion" className="mt-10 scroll-mt-24">
        <h2 className={majorHeading}>{content.conclusion.title}</h2>
        <div className="mt-4">
          <Prose paragraphs={content.conclusion.paragraphs} usedTerms={usedTerms} />
        </div>
      </section>

      <Glossary terms={content.glossary} />

      <div className="mt-12 border-t border-zinc-800 pt-8">
        <h2 className={majorHeading}>Check out my post on LinkedIn!</h2>
        {/* LinkedIn's public post-embed iframe has no documented dark-mode
            option — it's cross-origin content, so its own background/text
            colors aren't stylable from here. Framed in a dark card instead
            of fighting it, so the light widget reads as an intentional
            inset rather than a mismatched leftover. */}
        <div className="mx-auto mt-4 w-full max-w-[504px] rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
          <iframe
            src="https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7497505451161337856?collapsed=1"
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
