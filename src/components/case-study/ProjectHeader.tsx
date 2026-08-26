import Link from "next/link";
import type { ProjectEntry } from "@/data/resume";

// Shared across every project-detail page, generic or dedicated: back
// navigation, GitHub button, title, tags. Kept identical regardless of
// which renderer a given project slug uses, so the surrounding chrome
// stays visually consistent across the portfolio.
export default function ProjectHeader({ project }: { project: ProjectEntry }) {
  return (
    <>
      <Link
        href="/#projects"
        className="inline-flex items-center gap-1.5 rounded-sm font-mono text-xs uppercase tracking-widest text-zinc-400 transition-colors hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
      >
        <span aria-hidden="true">←</span> Back to projects
      </Link>

      <div className="mt-4 flex justify-end">
        <a
          href={project.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-emerald-500/30 transition-colors hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
        >
          View on GitHub
          <span aria-hidden="true">→</span>
        </a>
      </div>

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
    </>
  );
}
