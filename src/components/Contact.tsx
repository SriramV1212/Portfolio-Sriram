import { personal } from "@/data/resume";
import { GitHubIcon, LinkedInIcon } from "./SocialIcons";

const inputClasses =
  "mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 outline-none focus:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500";

const linkFocus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950";

export default function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-4xl scroll-mt-20 px-6 py-16">
      <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-emerald-400">
        Contact
      </h2>
      <div className="mt-6 grid gap-10 sm:grid-cols-2">
        <form
          action={`https://formspree.io/f/${personal.formspreeFormId}`}
          method="POST"
          className="space-y-4"
        >
          <div>
            <label htmlFor="name" className="block text-sm text-zinc-400">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm text-zinc-400">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm text-zinc-400">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              required
              className={inputClasses}
            />
          </div>
          <button
            type="submit"
            className={`rounded-full bg-emerald-500 px-5 py-3 font-semibold text-zinc-950 shadow-lg shadow-emerald-500/30 transition-colors hover:bg-emerald-400 ${linkFocus}`}
          >
            Send
          </button>
        </form>
        <div className="space-y-4 text-zinc-300">
          <a
            href={`mailto:${personal.email}`}
            className={`block w-fit rounded-sm transition-colors hover:text-emerald-400 ${linkFocus}`}
          >
            {personal.email}
          </a>
          <div className="flex gap-4">
            <a
              href={personal.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className={`rounded-sm text-emerald-400 transition-colors hover:text-emerald-300 ${linkFocus}`}
            >
              <LinkedInIcon className="h-7 w-7" />
            </a>
            <a
              href={personal.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className={`rounded-sm text-emerald-400 transition-colors hover:text-emerald-300 ${linkFocus}`}
            >
              <GitHubIcon className="h-7 w-7" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
