/* eslint-disable @next/next/no-img-element -- Markdown content deliberately uses public URLs for Obsidian authoring. */
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import type { ContentItem } from '@/lib/content';

const projectLinkBase =
  'project-link inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 text-sm font-medium';
const projectLinkClass = `${projectLinkBase} border-zinc-500 bg-surface text-zinc-100 hover:border-blue-300 hover:text-blue-200`;
const projectSourceLinkClass = `${projectLinkBase} border-blue-400/60 bg-blue-950/80 text-blue-200 hover:border-blue-200 hover:bg-blue-900`;
const projectDateFormat = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeZone: 'UTC',
});

function ProjectsBackLink() {
  return (
    <Link href="/projects" className={projectLinkClass}>
      <ArrowLeft aria-hidden="true" className="size-4" />
      All projects
    </Link>
  );
}

function Tags({ tags, readable = false }: { tags: string[]; readable?: boolean }) {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1">
      {tags.map((tag) => (
        <span
          key={tag}
          className={
            readable
              ? 'font-mono text-xs text-zinc-300'
              : 'font-mono text-[10px] tracking-wider text-subtle'
          }
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
    ? 'glass-surface--readable mx-auto w-[calc(100%_-_1.5rem)] max-w-5xl px-5 py-12 sm:w-[calc(100%_-_3rem)] sm:px-6 md:px-12 md:py-16 lg:px-16 lg:py-20'
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
          .join(' · ')
      : undefined;

  return (
    <article className={`glass-surface my-4 rounded-2xl ${articleLayout}`}>
      {project ? (
        <ProjectsBackLink />
      ) : (
        <Link
          href={`/${type}`}
          className="font-mono text-xs tracking-wider text-subtle hover:text-accent"
        >
          ← {type}
        </Link>
      )}
      <header className="mt-8 border-b border-border/30 pb-8">
        {!project ? (
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">
            {type}
          </p>
        ) : null}
        <h1 className="mt-3 text-3xl font-medium tracking-tight text-foreground md:text-5xl">
          {item.title}
        </h1>
        <p
          className={`mt-4 max-w-2xl text-base leading-relaxed ${project || isWriting ? 'text-zinc-200' : 'text-muted'}`}
        >
          {item.description}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <time
              dateTime={item.date}
              className={
                project
                  ? 'font-mono text-xs text-zinc-300'
                  : 'font-mono text-[10px] tracking-wider text-subtle'
              }
            >
              {(() => {
                if (project) return projectDateFormat.format(new Date(item.date));
                const parts = item.date.split('-');
                if (parts.length === 3) {
                  return `${parts[2]}-${parts[1]}-${parts[0].slice(2)}`;
                }
                return item.date;
              })()}
              {item.updatedAt ? ` · updated ${item.updatedAt}` : ''}
            </time>
          </div>
          <Tags tags={item.tags} readable={Boolean(project)} />
        </div>
        {project && (project.liveUrl || project.codeUrl) ? (
          <div className="mt-5 flex flex-wrap gap-3">
            {project.codeUrl ? (
              <a
                href={project.codeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={projectSourceLinkClass}
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
        <div className={proseClasses}>
          <MDXRemote source={item.content} />
        </div>
      ) : null}

      {related.length > 0 ? (
        <aside className="mt-14 border-t border-border/30 pt-8">
          <h2
            className={`font-mono text-xs uppercase tracking-[0.2em] ${project ? 'text-zinc-300' : 'text-subtle'}`}
          >
            Related {type}
          </h2>
          <ul className="mt-5 list-none divide-y divide-border/20 p-0">
            {related.map((entry) => (
              <li key={entry.slug}>
                <Link
                  href={`/${entry.type}/${entry.slug}`}
                  className={`block py-4 text-sm ${project ? 'project-link text-zinc-200 underline underline-offset-4 hover:text-blue-200' : 'text-muted hover:text-accent'}`}
                >
                  {entry.title}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      ) : null}
      {project ? (
        <footer className="mt-10 border-t border-border/30 pt-6">
          <ProjectsBackLink />
        </footer>
      ) : null}
    </article>
  );
}
