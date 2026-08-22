import Link from "next/link";
import { personal } from "@/data/resume";

const sections = [
  { href: "/#about", label: "About" },
  { href: "/#projects", label: "My Work" },
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950";

const navLinkClass = `rounded-sm transition-colors hover:text-zinc-100 ${focusRing}`;

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-6 text-sm"
      >
        <Link
          href="/"
          aria-label="Sriram Vivek — Home"
          className={`flex shrink-0 items-center justify-center rounded-md border border-zinc-700 px-2.5 py-1.5 transition-colors hover:border-emerald-500 ${focusRing}`}
        >
          <span
            aria-hidden="true"
            className="font-mono text-xl font-bold tracking-tighter text-white"
          >
            S<span className="ml-[-0.14em]">V</span>
          </span>
        </Link>
        <ul className="flex items-center gap-5 overflow-x-auto overflow-y-visible py-3 text-zinc-400 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {sections.map((section) => (
            <li key={section.href} className="shrink-0">
              <a href={section.href} className={navLinkClass}>
                {section.label}
              </a>
            </li>
          ))}
          <li className="shrink-0">
            <a
              href={personal.resumePdfPath}
              target="_blank"
              rel="noopener noreferrer"
              className={navLinkClass}
            >
              Resume
            </a>
          </li>
          <li className="shrink-0">
            <Link
              href="/#contact"
              className={`rounded-full bg-emerald-500 px-5 py-3 font-semibold text-zinc-950 shadow-lg shadow-emerald-500/30 transition-colors hover:bg-emerald-400 ${focusRing}`}
            >
              Contact
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
