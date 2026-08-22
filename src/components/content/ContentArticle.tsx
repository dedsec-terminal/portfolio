/* eslint-disable @next/next/no-img-element -- Markdown content deliberately uses public URLs for Obsidian authoring. */
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import type { ContentItem, ContentType } from '@/lib/content';

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
  const type = item.type as ContentType;
  const writeupMeta =
    item.type === 'writeups'
      ? [item.platform, item.challenge, item.category, item.difficulty]
          .filter(Boolean)
          .join(' · ')
      : undefined;

  return (
    <article className="glass-surface mx-3 my-4 max-w-3xl rounded-2xl px-6 py-16 sm:mx-6 md:px-12 md:py-24 lg:mx-auto">
      <Link
        href={`/${type}`}
        className="font-mono text-xs tracking-wider text-subtle hover:text-accent"
      >
        ← {type}
      </Link>
      <header className="mt-8 border-b border-border/30 pb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">
          {type}
        </p>
        <h1 className="mt-3 text-3xl font-medium tracking-tight text-foreground md:text-5xl">
          {item.title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          {item.description}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <time
            dateTime={item.date}
            className="font-mono text-[10px] tracking-wider text-subtle"
          >
            {item.date}
            {item.updatedAt ? ` · updated ${item.updatedAt}` : ''}
          </time>
          <Tags tags={item.tags} />
        </div>
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
                alt={media.alt}
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
        <div
          className={`article-prose ${item.type === 'writeups' ? 'article-prose--dense' : ''}`}
        >
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
                  className="block py-4 text-sm text-muted hover:text-accent"
                >
                  {entry.title}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      ) : null}
    </article>
  );
}
