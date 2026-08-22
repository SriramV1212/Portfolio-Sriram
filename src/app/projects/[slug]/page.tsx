import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "@/data/resume";
import { caseStudies } from "@/content/case-studies";
import InteractiveDiagram from "@/components/case-study/InteractiveDiagram";
import TechDetail from "@/components/case-study/TechDetail";
import StepThrough from "@/components/case-study/StepThrough";
import CodeBlock from "@/components/case-study/CodeBlock";
import Glossary from "@/components/case-study/Glossary";
import FoundationSection from "@/components/case-study/foundations/FoundationSection";
import FoundationVisualRenderer from "@/components/case-study/foundations/FoundationVisualRenderer";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: `${project.name} — Sriram Vivek`,
    description: project.description,
  };
}

const sectionHeading =
  "font-mono text-sm uppercase tracking-widest text-zinc-400";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  const caseStudy = caseStudies[slug];
  if (!project || !caseStudy) notFound();

  return (
    <main className="mx-auto max-w-3xl flex-1 px-6 py-16">
      <Link
        href="/#projects"
        className="inline-flex items-center gap-1.5 rounded-sm font-mono text-xs uppercase tracking-widest text-zinc-400 transition-colors hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
      >
        <span aria-hidden="true">←</span> Back to projects
      </Link>

      <h1 className="mt-4 text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">
        {project.name}
      </h1>

      <ul className="mt-4 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <li
            key={tag}
            className="rounded-full border border-zinc-700 px-2.5 py-1 font-mono text-xs text-zinc-400"
          >
            {tag}
          </li>
        ))}
      </ul>

      <a
        href={project.githubUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
      >
        View on GitHub
        <span aria-hidden="true">→</span>
      </a>

      <p className="mt-8 text-lg text-zinc-200">{caseStudy.hook}</p>

      <section className="mt-10">
        <h2 className={sectionHeading}>Foundations</h2>
        <p className="mt-4 text-sm text-zinc-500">
          Everything below builds up, one idea at a time, to what this project
          actually is. Click around — most of it is meant to be played with,
          not just read.
        </p>
        <div className="mt-6">
          <FoundationSection concepts={caseStudy.foundations} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className={sectionHeading}>Overview</h2>
        <div className="mt-4 space-y-4 text-zinc-300">
          {caseStudy.overview.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className={sectionHeading}>Architecture</h2>
        <p className="mt-4 text-sm text-zinc-500">
          Click a component below to see what it does.
        </p>
        <div className="mt-4">
          <InteractiveDiagram
            nodes={caseStudy.diagram.nodes}
            edges={caseStudy.diagram.edges}
            details={caseStudy.diagram.details}
            viewBox={caseStudy.diagram.viewBox}
          />
        </div>
      </section>

      <section className="mt-10">
        <h2 className={sectionHeading}>Request flow, step by step</h2>
        <div className="mt-4">
          <StepThrough steps={caseStudy.flow} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className={sectionHeading}>Key decisions</h2>
        <div className="mt-4 space-y-8">
          {caseStudy.decisions.map((decision) => (
            <div
              key={decision.title}
              className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5"
            >
              <h3 className="font-semibold text-zinc-100">
                {decision.title}
              </h3>
              <p className="mt-2 text-zinc-300">{decision.plain}</p>
              <dl className="mt-3 space-y-2 text-sm">
                <div>
                  <dt className="font-mono text-xs uppercase tracking-wide text-zinc-500">
                    Alternative considered
                  </dt>
                  <dd className="mt-0.5 text-zinc-400">
                    {decision.alternative}
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-xs uppercase tracking-wide text-zinc-500">
                    Tradeoff
                  </dt>
                  <dd className="mt-0.5 text-zinc-400">{decision.tradeoff}</dd>
                </div>
                <div>
                  <dt className="font-mono text-xs uppercase tracking-wide text-zinc-500">
                    If reversed
                  </dt>
                  <dd className="mt-0.5 text-zinc-400">
                    {decision.ifReversed}
                  </dd>
                </div>
              </dl>
              {decision.techDetail && (
                <TechDetail detail={decision.techDetail} />
              )}
              {decision.comparisonVisual && (
                <div className="mt-4">
                  <FoundationVisualRenderer visual={decision.comparisonVisual} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className={sectionHeading}>{caseStudy.failureScenario.title}</h2>
        <p className="mt-4 text-zinc-300">{caseStudy.failureScenario.intro}</p>
        <div className="mt-4">
          <StepThrough steps={caseStudy.failureScenario.steps} />
        </div>
      </section>

      {caseStudy.pathComparison && (
        <section className="mt-10">
          <h2 className={sectionHeading}>{caseStudy.pathComparison.title}</h2>
          <div className="mt-4">
            <FoundationVisualRenderer visual={caseStudy.pathComparison.visual} />
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className={sectionHeading}>Future work</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-zinc-300">
          {caseStudy.futureWork.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className={sectionHeading}>Code excerpts</h2>
        <div className="mt-4 space-y-6">
          {caseStudy.codeSnippets.map((snippet) => (
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

      <section className="mt-10">
        <Glossary terms={caseStudy.glossary} />
      </section>

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
