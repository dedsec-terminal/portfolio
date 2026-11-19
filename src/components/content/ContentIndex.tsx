/* eslint-disable @next/next/no-img-element -- Content authors use static public media URLs. */
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ContentItem, ContentType } from '@/lib/content';

const labels: Record<
  ContentType,
  { title: string; eyebrow: string; empty: string }
> = {
  writeups: {
    title: 'Writeups',
    eyebrow: 'Security archive',
    empty: 'No published writeups yet.',
  },
  blog: {
    title: 'Blog',
    eyebrow: 'Technical notes',
    empty: 'No published blog posts yet.',
  },
  journal: {
    title: 'Journal',
    eyebrow: 'Personal writing',
    empty: 'No published journal entries yet.',
  },
  art: {
    title: 'Art',
    eyebrow: 'Visual archive',
    empty: 'No published art entries yet.',
  },
  projects: {
    title: 'Projects',
    eyebrow: 'Selected work',
    empty: 'No published projects yet.',
  },
};

function Tags({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1">
      {tags.map((tag) => (
        <span
          key={tag}
          className="font-mono text-[10px] tracking-wider text-subtle"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

function ProjectList({ items }: { items: ContentItem[] }) {
  return (
    <ul className="grid list-none gap-4 p-0">
      {items.map(({ slug, title, description, tags }) => {
        const titleId = `project-title-${slug}`;
        const actionId = `project-action-${slug}`;

        return (
          <li key={slug}>
            <Link
              href={`/projects/${slug}`}
              aria-labelledby={`${actionId} ${titleId}`}
              className="project-link group grid gap-4 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-blue-300/70 hover:bg-surface-raised sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6 sm:p-6"
            >
              <div>
                <h2
                  id={titleId}
                  className="text-xl font-medium leading-snug text-foreground"
                >
                  {title}
                </h2>
                <p className="mt-2 max-w-[65ch] text-base leading-relaxed text-zinc-300">
                  {description}
                </p>
                {tags.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 font-mono text-xs text-zinc-400">
                    {tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                ) : null}
              </div>
              <span
                id={actionId}
                className="inline-flex min-h-11 items-center justify-self-start gap-2 rounded-lg border border-blue-400/50 bg-blue-950/60 px-3 text-sm font-medium text-blue-200 group-hover:bg-blue-900/70 group-focus-visible:bg-blue-900/70"
              >
                View project <ArrowRight aria-hidden="true" className="size-4" />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default function ContentIndex({
  type,
  items,
}: {
  type: ContentType;
  items: ContentItem[];
}) {
  const label = labels[type];
  const isArt = type === 'art';
  const isProjects = type === 'projects';

  return (
    <section
      className={`glass-surface mx-3 my-4 max-w-5xl rounded-2xl sm:mx-6 md:px-12 lg:mx-auto ${isProjects ? 'px-4 py-10 sm:px-6 md:py-16' : 'px-6 py-16 md:py-24'}`}
    >
      <header className={isProjects ? 'mb-7' : 'mb-12 border-b border-border/30 pb-8'}>
        <p
          className={`font-mono text-xs uppercase tracking-[0.2em] ${isProjects ? 'text-zinc-300' : 'text-subtle'}`}
        >
          {label.eyebrow}
        </p>
        <h1 className="mt-3 text-4xl font-medium tracking-tight text-foreground md:text-5xl">
          {label.title}
        </h1>
      </header>

      {items.length === 0 ? (
        <p className={isProjects ? 'text-sm text-zinc-300' : 'text-sm text-muted'}>
          {label.empty}
        </p>
      ) : isProjects ? (
        <ProjectList items={items} />
      ) : isArt ? (
        <ul className="grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2">
          {items.map((item) => {
            const media = item.type === 'art' ? item.media[0] : undefined;
            return (
              <li key={item.slug}>
                <Link
                  href={`/${type}/${item.slug}`}
                  className="group block overflow-hidden border border-border/30 bg-surface/30"
                >
                  {media ? (
                    <img
                      src={media.src}
                      alt={media.alt}
                      className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  ) : null}
                  <div className="p-5">
                    <h2 className="text-base text-foreground group-hover:text-accent">
                      {item.title}
                    </h2>
                    <p className="mt-2 font-mono text-[10px] tracking-wider text-subtle">
                      {item.date}
                    </p>
                    <div className="mt-3">
                      <Tags tags={item.tags} />
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <ul className="list-none divide-y divide-border/25 p-0">
          {items.map((item) => (
            <li key={item.slug}>
              <Link
                href={`/${type}/${item.slug}`}
                className="group block py-6 first:pt-0"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
                  <div>
                    <h2 className="text-lg text-foreground group-hover:text-accent">
                      {item.title}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
                      {item.description}
                    </p>
                  </div>
                  <time
                    dateTime={item.date}
                    className="shrink-0 font-mono text-[10px] tracking-wider text-subtle"
                  >
                    {item.date}
                  </time>
                </div>
                {type === 'writeups' && item.type === 'writeups' ? (
                  <p className="mt-3 font-mono text-[10px] tracking-wider text-subtle">
                    {[item.platform, item.category, item.difficulty]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                ) : null}
                <div className="mt-3">
                  <Tags tags={item.tags} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
