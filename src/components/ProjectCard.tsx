import Link from "next/link";
import type { ProjectEntry } from "@/data/resume";
import ReadMore from "./ReadMore";

export default function ProjectCard({ project }: { project: ProjectEntry }) {
  return (
    <article className="rounded-lg border border-zinc-800 p-8 transition-colors hover:border-zinc-700">
      <h3 className="text-lg font-semibold text-zinc-100">{project.name}</h3>
      <div className="mt-3 text-zinc-300">
        <ReadMore>
          <p>{project.description}</p>
        </ReadMore>
      </div>
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
      <div className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <a
          href={project.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-zinc-300 transition-colors hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
        >
          View on GitHub
          <span aria-hidden="true">→</span>
        </a>
        <Link
          href={`/projects/${project.slug}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-emerald-500/30 transition-colors hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
        >
          Read full write-up
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
