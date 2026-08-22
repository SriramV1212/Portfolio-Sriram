import { codeToHtml } from "shiki";

export default async function CodeBlock({
  title,
  lang,
  code,
  explanation,
}: {
  title: string;
  lang: string;
  code: string;
  explanation: string;
}) {
  const html = await codeToHtml(code, { lang, theme: "github-dark" });

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40">
      <div className="border-b border-zinc-800 px-4 py-3">
        <h4 className="font-mono text-sm font-semibold text-zinc-100">
          {title}
        </h4>
        <p className="mt-1 text-sm text-zinc-400">{explanation}</p>
      </div>
      <div
        className="overflow-x-auto p-4 text-sm [&_pre]:bg-transparent! [&_pre]:m-0"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
