import { projects } from "@/data/resume";
import ProjectCard from "./ProjectCard";

export default function Projects() {
  return (
    <section id="projects" className="mx-auto max-w-4xl scroll-mt-20 px-6 py-16">
      <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-emerald-400">
        My Work
      </h2>
      <div className="mt-6 space-y-6">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </section>
  );
}
