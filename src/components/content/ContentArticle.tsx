/* eslint-disable @next/next/no-img-element -- Markdown content deliberately uses public URLs for Obsidian authoring. */
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import type { ContentItem, ContentType } from '@/lib/content';

const projectLinkClass =
  'project-link inline-flex min-h-11 items-center gap-2 font-mono text-xs tracking-wider text-zinc-400 underline decoration-foreground/35 underline-offset-4 transition-colors hover:text-foreground';
const projectDateFormat = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeZone: 'UTC',
});

function BackLink({ type }: { type: ContentType }) {
  if (type === 'projects') {
    return (
      <Link href="/projects" className={projectLinkClass}>
        <ArrowLeft aria-hidden="true" className="size-4" />
        All projects
      </Link>
    );
  }

  return (
    <Link
      href={`/${type}`}
      className="inline-flex items-center gap-2 font-mono text-xs tracking-wider text-subtle transition-colors hover:text-accent"
    >
      <ArrowLeft aria-hidden="true" className="size-3.5" />
      All {type}
    </Link>
  );
}

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

export default async function ContentArticle({
  item,
  related,
}: {
  item: ContentItem;
  related: ContentItem[];
}) {
  const type = item.type;
  const project = item.type === 'projects' ? item : undefined;
  const isWriting = type === 'journal' || type === 'writeups';
  const articleLayout = isWriting
    ? 'mx-auto w-[calc(100%_-_1.5rem)] max-w-5xl px-5 py-12 sm:w-[calc(100%_-_3rem)] sm:px-6 md:px-12 md:py-16 lg:px-16 lg:py-20'
    : `mx-3 px-6 py-16 sm:mx-6 md:px-12 md:py-24 lg:mx-auto ${project ? 'max-w-4xl' : 'max-w-3xl'}`;
  const proseClasses = [
    'article-prose',
    isWriting && 'article-prose--wide mt-8',
    type === 'writeups' && 'article-prose--dense',
    project && 'article-prose--project',
  ]
    .filter(Boolean)
    .join(' ');
  const writeupMeta =
    item.type === 'writeups'
      ? [item.platform, item.challenge, item.category, item.difficulty]
          .filter(Boolean)
          .join(' • ')
      : undefined;

  const schemaType =
    item.type === 'art'
      ? 'VisualArtwork'
      : item.type === 'projects'
        ? 'SoftwareApplication'
        : 'TechArticle';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    headline: item.title,
    description: item.description,
    author: {
      '@type': 'Person',
      name: 'Swaraj Singh',
      url: 'https://dedsec-terminal.in',
    },
    datePublished: `${item.date}T00:00:00.000Z`,
    dateModified: item.updatedAt ? `${item.updatedAt}T00:00:00.000Z` : `${item.date}T00:00:00.000Z`,
    mainEntityOfPage: `https://dedsec-terminal.in/${item.type}/${item.slug}`,
  };

  return (
    <article className={`glass-surface my-4 rounded-2xl ${articleLayout}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <BackLink type={type} />
      <header className="mt-8 border-b border-border/30 pb-8">
        <h1 className="text-3xl font-medium tracking-tight text-foreground md:text-5xl">
          {item.title}
        </h1>
        <p
          className={`mt-4 text-base leading-relaxed ${project ? 'text-zinc-200' : 'text-muted'}`}
        >
          {item.description}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {type !== 'writeups' ? (
              <time
                dateTime={item.date}
                className="font-mono text-[10px] tracking-wider text-subtle"
              >
                {project ? projectDateFormat.format(new Date(item.date)) : item.date}
                {item.updatedAt ? ` • updated ${item.updatedAt}` : ''}
              </time>
            ) : null}
          </div>
          <Tags tags={item.tags} />
        </div>
        {project && (project.liveUrl || project.codeUrl) ? (
          <div className="mt-5 flex flex-wrap gap-3">
            {project.codeUrl ? (
              <a
                href={project.codeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={projectLinkClass}
              >
                Source on GitHub <ArrowUpRight aria-hidden="true" className="size-4" />
              </a>
            ) : null}
            {project.liveUrl ? (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={projectLinkClass}
              >
                Live site <ArrowUpRight aria-hidden="true" className="size-4" />
              </a>
            ) : null}
          </div>
        ) : null}
        {writeupMeta ? (
          <p className="mt-3 font-mono text-[10px] tracking-wider text-subtle">
            {writeupMeta}
          </p>
        ) : null}
      </header>

      {item.type === 'art' ? (
        <div className="my-10 grid gap-6">
          {item.media.map((media) => (
            <figure key={media.src}>
              <img
                src={media.src}
                alt={media.alt || `${item.title} — visual artwork`}
                title={media.caption || item.title}
                className="h-auto w-full border border-border/30 bg-surface"
              />
              {media.caption ? (
                <figcaption className="mt-2 text-xs text-subtle">
                  {media.caption}
                </figcaption>
              ) : null}
            </figure>
          ))}
          {item.source ? (
            <p className="text-xs text-subtle">
              Source / attribution: {item.source}
            </p>
          ) : null}
        </div>
      ) : null}

      {item.content.trim() ? (
        <div className={proseClasses}>
          <MDXRemote source={item.content} />
        </div>
      ) : null}

      {related.length > 0 ? (
        <aside className="mt-14 border-t border-border/30 pt-8">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-subtle">
            Related {type}
          </h2>
          <ul className="mt-5 list-none divide-y divide-border/20 p-0">
            {related.map((entry) => (
              <li key={entry.slug}>
                <Link
                  href={`/${entry.type}/${entry.slug}`}
                  className={`block py-4 text-sm text-muted ${project ? 'project-link hover:text-foreground' : 'hover:text-accent'}`}
                >
                  {entry.title}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      ) : null}
      <footer className="mt-10 border-t border-border/30 pt-6">
        <BackLink type={type} />
      </footer>
    </article>
  );
}
