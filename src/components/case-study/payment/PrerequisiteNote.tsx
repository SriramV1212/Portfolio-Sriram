// A single subtle inline callout, not a bordered card with chips — this
// should read like a footnote-weight aside, not a section of its own.
export default function PrerequisiteNote({ note }: { note: string }) {
  return (
    <p className="border-l-2 border-zinc-700 pl-3 text-sm text-zinc-400">
      <strong className="text-zinc-300">Assumed knowledge:</strong> {note}
    </p>
  );
}
