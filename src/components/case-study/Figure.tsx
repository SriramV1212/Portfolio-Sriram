import Image from "next/image";

// A static, embedded diagram — not an interactive one. Renders a
// pre-made image (e.g. an exported architecture/observability diagram)
// as a first-class part of the article: framed, centered, responsive,
// with an optional caption underneath. Shared across any dedicated
// case-study renderer that needs to embed a figure like this.
export default function Figure({
  src,
  alt,
  width,
  height,
  caption,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
}) {
  return (
    <figure className="mt-6">
      <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 sm:p-5">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes="(min-width: 46rem) 46rem, 100vw"
          className="h-auto w-full rounded-md"
        />
      </div>
      {caption && (
        <figcaption className="mt-3 text-center text-sm text-zinc-400">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
