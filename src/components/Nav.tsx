"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { personal } from "@/data/resume";

// Desktop/tablet (sm: and up): unchanged inline nav.
const sections = [
  { href: "/#about", label: "About" },
  { href: "/#projects", label: "My Work" },
];

// Mobile (below sm:): the hamburger menu's own list — includes Home,
// which the inline desktop nav doesn't need since the logo already does
// that job, but was explicitly asked for here.
const menuItems = [
  { href: "/", label: "Home" },
  { href: "/#about", label: "About" },
  { href: "/#projects", label: "My Work" },
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950";

const navLinkClass = `rounded-sm transition-colors hover:text-zinc-100 ${focusRing}`;

export default function Nav() {
  const [open, setOpen] = useState(false);

  // Close on Escape, matching the Glossary drawer's own convention.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 min-w-0 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
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

        {/* sm: and up only — identical to before this change. */}
        <ul className="hidden items-center gap-5 overflow-x-auto overflow-y-visible py-3 text-zinc-400 sm:flex [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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

        {/* Below sm: — a hamburger button replaces the whole inline list,
            since there isn't room for it. Same bordered-badge language as
            the logo above (border-zinc-700, hover -> emerald-500), no
            filled/colored background — just emerald bars on the site's
            own dark surface, animating into an X while open. */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-zinc-700 transition-colors hover:border-emerald-500 sm:hidden ${focusRing}`}
        >
          <span className="flex flex-col items-center gap-[5px]" aria-hidden="true">
            <span
              className={`block h-0.5 w-5 rounded-full bg-emerald-400 transition-transform duration-200 ${
                open ? "translate-y-[7px] rotate-45" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-5 rounded-full bg-emerald-400 transition-opacity duration-200 ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-5 rounded-full bg-emerald-400 transition-transform duration-200 ${
                open ? "-translate-y-[7px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </nav>

      {/* The dropdown itself: pushes page content down rather than
          overlaying it, so there's no backdrop/dismiss-by-tapping-outside
          to wire up — closing is via the button itself, Escape, or
          picking a link. */}
      {open && (
        <div id="mobile-menu" className="border-t border-zinc-800 sm:hidden">
          <ul className="mx-auto flex max-w-4xl flex-col px-6 py-2 text-sm">
            {menuItems.map((item) =>
              item.href === "/" ? (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`block rounded-sm py-3 text-zinc-300 transition-colors hover:text-zinc-100 ${focusRing}`}
                  >
                    {item.label}
                  </Link>
                </li>
              ) : (
                <li key={item.label}>
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`block rounded-sm py-3 text-zinc-300 transition-colors hover:text-zinc-100 ${focusRing}`}
                  >
                    {item.label}
                  </a>
                </li>
              )
            )}
            <li>
              <a
                href={personal.resumePdfPath}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className={`block rounded-sm py-3 text-zinc-300 transition-colors hover:text-zinc-100 ${focusRing}`}
              >
                Resume
              </a>
            </li>
            <li>
              <Link
                href="/#contact"
                onClick={() => setOpen(false)}
                className={`block rounded-sm py-3 font-semibold text-emerald-400 transition-colors hover:text-emerald-300 ${focusRing}`}
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
