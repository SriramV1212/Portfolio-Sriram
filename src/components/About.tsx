import { about, experience, featuredSkills } from "@/data/resume";
import SkillsPhysics from "./SkillsPhysics";

export default function About() {
  return (
    <section id="about" className="mx-auto max-w-4xl scroll-mt-20 px-6 py-16">
      <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-emerald-400">
        About
      </h2>
      <div className="mt-4 space-y-4 text-zinc-300">
        {about.paragraphs.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      <div className="mt-12">
        <h3 className="font-mono text-xs uppercase tracking-widest text-zinc-400">
          Experience
        </h3>
        <div className="mt-6 space-y-8 rounded-lg border border-zinc-800 bg-zinc-900/40 p-6">
          {experience.map((entry) => (
            <div
              key={entry.company}
              className="border-l-2 border-emerald-500/60 pl-4"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h4 className="text-lg font-semibold text-zinc-100">
                  <span className="text-emerald-400">{entry.title}</span> ·{" "}
                  {entry.company}
                </h4>
                <span className="font-mono text-sm text-zinc-400">
                  {entry.dates}
                </span>
              </div>
              <p className="text-sm text-zinc-400">{entry.location}</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-zinc-300">
                {entry.bullets.map((bullet, i) => (
                  <li key={i}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12">
        <h3 className="font-mono text-xs uppercase tracking-widest text-zinc-400">
          Skills
        </h3>
        <p className="mt-2 text-sm text-zinc-400">
          Drag them around — these are the top skills I work with as an
          Engineer!
        </p>
        <div className="mt-6">
          <SkillsPhysics skills={featuredSkills} />
        </div>
      </div>
    </section>
  );
}
