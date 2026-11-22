import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { getContent } from '@/lib/content';

export default function FeaturedProjects() {
  const collection = getContent('projects');
  const projects = ['greyfield', 'traceir', 'kubesentinel']
    .flatMap((slug) => collection.filter((project) => project.slug === slug));
  if (!projects.length) return null;

  return (
    <section aria-labelledby="featured-projects-title" className="glass-surface mx-3 my-4 rounded-2xl py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <header className="mb-7 flex items-baseline gap-3">
          <h2 id="featured-projects-title" className="font-mono text-xs uppercase tracking-[0.2em] text-subtle">
            <Link href="/projects" className="transition-colors hover:text-foreground">Selected projects</Link>
          </h2>
          <div className="h-px max-w-12 flex-1 bg-border/30" aria-hidden="true" />
          <Link href="/projects" className="text-xs text-subtle transition-colors hover:text-foreground" aria-label="View all projects">View all</Link>
        </header>
        <ul className="m-0 grid list-none gap-3 p-0 md:grid-cols-3 md:gap-5">
          {projects.map((project) => (
            <li key={project.slug}>
              <Link
                href={`/projects/${project.slug}`}
                prefetch={false}
                className="group flex h-full flex-col rounded-xl border border-foreground/[0.06] bg-foreground/[0.025] px-5 py-5 transition-[background-color,border-color,box-shadow,transform,translate] duration-300 ease-out hover:border-foreground/20 hover:bg-foreground/[0.065] hover:shadow-[0_10px_28px_rgb(0_0_0_/_0.18),inset_0_1px_0_rgb(255_255_255_/_0.08)] motion-safe:hover:-translate-y-1 focus-visible:border-foreground/30 focus-visible:bg-foreground/[0.065] md:px-6 md:py-6"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-base font-medium text-foreground/90 transition-colors group-hover:text-foreground">{project.title}</h3>
                  <ArrowUpRight aria-hidden="true" className="size-3.5 shrink-0 self-center text-subtle transition-[color,transform,translate] duration-300 ease-out group-hover:text-foreground motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5" />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted">{project.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
