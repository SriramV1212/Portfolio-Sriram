import {
  personal,
  experience,
  projects,
  skills,
  education,
} from "@/data/resume";

export default function ResumePage() {
  return (
    <main className="mx-auto w-full min-w-0 max-w-4xl flex-1 px-6 py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
            {personal.name}
          </h1>
          <p className="mt-1 font-mono text-emerald-400">{personal.role}</p>
        </div>
        <a
          href={personal.resumePdfPath}
          download
          className="rounded-md bg-emerald-500 px-4 py-2 font-medium text-zinc-950 transition-colors hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
        >
          Download PDF
        </a>
      </div>

      <section className="mt-12">
        <h2 className="font-mono text-sm uppercase tracking-widest text-zinc-400">
          Experience
        </h2>
        <div className="mt-4 space-y-8">
          {experience.map((entry) => (
            <div key={entry.company}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="font-semibold text-zinc-100">
                  {entry.title} · {entry.company}
                </h3>
                <span className="font-mono text-sm text-zinc-400">
                  {entry.dates}
                </span>
              </div>
              <p className="text-sm text-zinc-400">{entry.location}</p>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-zinc-300">
                {entry.bullets.map((bullet, i) => (
                  <li key={i}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-mono text-sm uppercase tracking-widest text-zinc-400">
          Projects
        </h2>
        <div className="mt-4 space-y-6">
          {projects.map((project) => (
            <div key={project.slug}>
              <h3 className="font-semibold text-zinc-100">{project.name}</h3>
              <p className="mt-1 text-zinc-300">{project.description}</p>
              <p className="mt-1 font-mono text-xs text-zinc-400">
                {project.tags.join(" · ")}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-mono text-sm uppercase tracking-widest text-zinc-400">
          Education
        </h2>
        <div className="mt-4 space-y-6">
          {education.map((entry) => (
            <div key={entry.school}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="font-semibold text-zinc-100">{entry.school}</h3>
                <span className="font-mono text-sm text-zinc-400">
                  {entry.dates}
                </span>
              </div>
              <p className="text-zinc-300">{entry.degree}</p>
              <p className="text-sm text-zinc-400">{entry.location}</p>
              <p className="mt-1 text-sm text-zinc-400">
                <span className="text-zinc-400">Courses: </span>
                {entry.courses}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-mono text-sm uppercase tracking-widest text-zinc-400">
          Skills
        </h2>
        <div className="mt-4 space-y-3">
          {skills.map((group) => (
            <p key={group.category} className="text-zinc-300">
              <span className="font-semibold text-zinc-100">
                {group.category}:{" "}
              </span>
              {group.items.join(", ")}
            </p>
          ))}
        </div>
      </section>
    </main>
  );
}
