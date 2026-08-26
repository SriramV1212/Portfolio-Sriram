import type { ProjectEntry } from "@/data/resume";
import { paymentCaseStudy } from "@/content/case-studies/payment/content";
import ProjectHeader from "@/components/case-study/ProjectHeader";
import DecisionCard from "@/components/case-study/DecisionCard";
import InteractiveDiagram from "@/components/case-study/InteractiveDiagram";
import CodeBlock from "@/components/case-study/CodeBlock";
import Glossary from "@/components/case-study/Glossary";
import PrerequisiteNote from "@/components/case-study/payment/PrerequisiteNote";
import InvariantPanel from "@/components/case-study/payment/InvariantPanel";
import FailureLab from "@/components/case-study/payment/FailureLab";
import ReliabilityMechanisms from "@/components/case-study/payment/ReliabilityMechanisms";
import ConsumerScalingLab from "@/components/case-study/payment/ConsumerScalingLab";
import DualWriteExplorer from "@/components/case-study/payment/DualWriteExplorer";

const sectionHeading = "font-mono text-sm uppercase tracking-widest text-zinc-400";

// Dedicated renderer for the payment-processing-backend case study —
// structured around invariants and failure scenarios ("Payment
// Reliability Lab") rather than the generic foundations/overview/flow
// template the other two projects use. Async because CodeBlock (used
// inside the Failure Lab) is itself an async Server Component using
// Shiki; those excerpts are pre-rendered here and handed down to the
// client-side FailureLab as plain ReactNodes.
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

  return (
    <main className="mx-auto max-w-3xl flex-1 px-6 py-16">
      <ProjectHeader project={project} />

      <p className="mt-8 text-lg text-zinc-200">{content.hook}</p>
      <p className="mt-3 text-zinc-400">{content.subhook}</p>

      <section className="mt-10">
        <PrerequisiteNote prerequisites={content.prerequisites} />
      </section>

      <section className="mt-10">
        <h2 className={sectionHeading}>{content.learningOutcomes.title}</h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-3">
          {content.learningOutcomes.items.map((item, i) => (
            <li
              key={item}
              className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 text-sm text-zinc-300"
            >
              <span className="font-mono text-xs text-zinc-600">{String(i + 1).padStart(2, "0")}</span>
              <p className="mt-1.5">{item}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10">
        <h2 className={sectionHeading}>{content.invariants.title}</h2>
        <div className="mt-4">
          <InvariantPanel items={content.invariants.items} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className={sectionHeading}>{content.architecture.title}</h2>
        <p className="mt-4 text-sm text-zinc-500">{content.architecture.intro}</p>
        <div className="mt-4">
          <InteractiveDiagram
            nodes={content.architecture.nodes}
            edges={content.architecture.edges}
            details={content.architecture.details}
            viewBox={content.architecture.viewBox}
          />
          {content.architecture.caption && (
            <p className="mt-3 text-sm text-zinc-400">{content.architecture.caption}</p>
          )}
        </div>
      </section>

      <section className="mt-10">
        <FailureLab
          title={content.failureLab.title}
          subtitle={content.failureLab.subtitle}
          scenarios={content.failureLab.scenarios}
          codeBlocks={failureLabCodeBlocks}
        />
      </section>

      <section className="mt-10">
        <h2 className={sectionHeading}>{content.mechanisms.title}</h2>
        <div className="mt-4">
          <ReliabilityMechanisms items={content.mechanisms.items} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className={sectionHeading}>{content.consumerScaling.title}</h2>
        <p className="mt-4 text-sm text-zinc-500">{content.consumerScaling.subtitle}</p>
        <div className="mt-4">
          <ConsumerScalingLab data={content.consumerScaling} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className={sectionHeading}>{content.dualWrite.title}</h2>
        <div className="mt-4">
          <DualWriteExplorer dualWrite={content.dualWrite} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className={sectionHeading}>Key decisions</h2>
        <div className="mt-4 space-y-8">
          {content.decisions.map((decision) => (
            <DecisionCard key={decision.title} decision={decision} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className={sectionHeading}>{content.futureWork.title}</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-zinc-300">
          {content.futureWork.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <Glossary terms={content.glossary} />

      <div className="mt-12 border-t border-zinc-800 pt-6">
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
