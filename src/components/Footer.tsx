import { personal } from "@/data/resume";

export default function Footer() {
  return (
    <footer className="min-w-0 border-t border-zinc-800">
      <div className="mx-auto max-w-4xl px-6 py-8 text-sm text-zinc-400">
        © {new Date().getFullYear()} {personal.name}
      </div>
    </footer>
  );
}
