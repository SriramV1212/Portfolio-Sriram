import Image from "next/image";
import { heroPhrases, personal } from "@/data/resume";
import CodeScreenIcon from "./CodeScreenIcon";
import {
  BracketsDoodle,
  CircleDoodle,
  PlusDoodle,
  SparkleDoodle,
  SquiggleDoodle,
  StarDoodle,
} from "./Doodles";
import Typewriter from "./Typewriter";
import ReadMore from "./ReadMore";

export default function Hero() {
  return (
    <section className="mx-auto flex max-w-4xl flex-col-reverse items-center gap-14 px-6 py-20 sm:flex-row sm:justify-between">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-zinc-50 sm:text-5xl">
          {personal.name}
        </h1>
        <p className="mt-2 font-mono text-lg text-emerald-400">
          <span className="text-zinc-500">{"<"}</span>
          <Typewriter phrases={heroPhrases} />
          <span className="text-zinc-500"> {"/>"}</span>
        </p>
        <div className="mt-6 max-w-md text-zinc-400">
          <ReadMore>
            <p>{personal.tagline}</p>
          </ReadMore>
        </div>
      </div>

      <div className="relative h-[min(18rem,80vw)] w-[min(18rem,80vw)] shrink-0 sm:h-80 sm:w-80">
        <SparkleDoodle className="absolute -right-2 top-2 z-20 h-6 w-6 text-emerald-400 sm:h-7 sm:w-7" />
        <SquiggleDoodle className="absolute -bottom-3 left-4 z-20 h-4 w-16 text-emerald-400" />
        <PlusDoodle className="absolute -left-5 top-1/2 z-20 h-5 w-5 -translate-y-1/2 text-emerald-400" />
        <StarDoodle className="absolute -top-7 left-1/2 z-20 h-5 w-5 -translate-x-1/2 text-emerald-400" />
        <CircleDoodle className="absolute -bottom-5 -right-4 z-20 h-6 w-6 text-emerald-400" />
        <BracketsDoodle className="absolute -right-7 top-1/3 z-20 h-5 w-5 text-emerald-400" />

        <div className="absolute left-0 top-0 w-44 -rotate-6 rounded-sm bg-zinc-100 p-3 pb-8 shadow-xl sm:w-52">
          <div className="aspect-square w-full overflow-hidden bg-zinc-950 p-5">
            <CodeScreenIcon className="h-full w-full" />
          </div>
        </div>

        <div className="absolute bottom-0 right-0 z-10 w-44 rotate-6 rounded-sm bg-zinc-100 p-3 pb-8 shadow-2xl sm:w-52">
          <div className="aspect-square w-full overflow-hidden bg-zinc-900">
            <Image
              src={personal.photoPath}
              alt={`Photo of ${personal.name}`}
              width={400}
              height={400}
              className="h-full w-full object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
