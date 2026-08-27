import Image from "next/image";
import { education } from "@/data/resume";

// Subsection nested under #about, styled like the Experience/Skills
// subsections it sits between — a plain divider between the two entries
// stands in for a full timeline, rather than a bordered card treatment.
export default function Education() {
  return (
    <div className="mt-12">
      <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-emerald-400">
        Education
      </h3>
      <div className="mt-6 divide-y divide-zinc-800">
        {education.map((entry) => (
          <div
            key={entry.school}
            className="flex items-start gap-4 py-6 first:pt-0 last:pb-0 sm:gap-6"
          >
            <div className="relative h-20 w-28 shrink-0 sm:h-28 sm:w-40">
              <Image
                src={entry.logo}
                alt={`${entry.school} logo`}
                fill
                sizes="160px"
                className="object-contain"
              />
            </div>
            <div className="min-w-0">
              <h4 className="text-lg font-semibold text-zinc-100">
                {entry.school}
              </h4>
              <p className="mt-1 text-zinc-200">{entry.degree}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-400">
                <span className="font-mono">{entry.dates}</span>
                <span aria-hidden="true" className="text-zinc-700">
                  ·
                </span>
                <span>{entry.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
