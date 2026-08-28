import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <main className="min-w-0 flex-1">
      <Hero />
      <About />
      <Projects />
      <Contact />
    </main>
  );
}
