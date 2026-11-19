import Link from 'next/link';
import { getContent } from '@/lib/content';

export default function FeaturedProjects() {
  const collection = getContent('projects');
  const projects = ['greyfield', 'traceir', 'kubesentinel']
    .flatMap((slug) => collection.filter((project) => project.slug === slug));
  if (!projects.length) return null;
  return (
    <section aria-labelledby="featured-projects-title" className="glass-surface mx-3 my-4 rounded-2xl px-6 py-16 md:mx-6 md:px-12 md:py-20">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 id="featured-projects-title" className="font-mono text-xs uppercase tracking-[0.2em] text-subtle">Selected projects</h2>
          <Link href="/projects" className="text-sm text-muted underline underline-offset-4 hover:text-foreground">View all projects</Link>
        </header>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">Cloud deception, evidence-led investigation, and runtime security. Explore how each project works and the limits of its demonstration.</p>
        <ul className="mt-8 grid list-none gap-6 p-0 md:grid-cols-3">
          {projects.map((project) => (
            <li key={project.slug}>
              <Link href={`/projects/${project.slug}`} className="group block h-full rounded-lg border border-border bg-background/70 p-5 hover:border-foreground/50">
                <h3 className="text-lg text-foreground group-hover:underline">{project.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{project.description}</p>
                <span className="mt-5 block text-sm text-muted underline underline-offset-4">Read the case study</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
