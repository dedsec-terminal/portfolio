/* eslint-disable @next/next/no-img-element -- Content authors use static public media URLs. */
import Link from 'next/link';
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

export default function ContentIndex({
  type,
  items,
}: {
  type: ContentType;
  items: ContentItem[];
}) {
  const label = labels[type];
  const isArt = type === 'art';

  return (
    <section className="glass-surface mx-3 my-4 max-w-5xl rounded-2xl px-6 py-16 sm:mx-6 md:px-12 md:py-24 lg:mx-auto">
      <header className="mb-12 border-b border-border/30 pb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-subtle">
          {label.eyebrow}
        </p>
        <h1 className="mt-3 text-4xl font-medium tracking-tight text-foreground md:text-5xl">
          {label.title}
        </h1>
      </header>

      {items.length === 0 ? (
        <p className="text-sm text-muted">{label.empty}</p>
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
