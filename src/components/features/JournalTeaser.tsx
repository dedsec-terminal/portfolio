import Link from 'next/link';
import { getContent } from '@/lib/content';

export default function JournalTeaser() {
  const entries = getContent('journal').slice(0, 3);
  const isEmpty = entries.length === 0;

  return (
    <section
      aria-label="Journal"
      className={`glass-surface mx-3 my-4 rounded-2xl ${isEmpty ? 'py-10 md:py-12' : 'py-16 md:py-20'}`}
    >
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <header className="mb-8 flex items-baseline gap-3">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-subtle">
            <Link href="/journal" className="hover:text-foreground transition-colors duration-200">
              Journal
            </Link>
          </h2>
          <div
            className="h-px max-w-12 flex-1 bg-border/30"
            aria-hidden="true"
          />
          <Link href="/journal" className="text-xs text-subtle hover:text-foreground transition-colors duration-200" aria-label="View all journal entries">
            View all
          </Link>
        </header>

        {isEmpty ? (
          <p className="text-sm text-subtle">Coming soon.</p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-6 p-0">
            {entries.map((entry) => (
              <li key={entry.slug}>
                <article>
                  <Link
                    href={`/journal/${entry.slug}`}
                    className="group flex flex-col gap-1.5"
                  >
                    <h3 className="text-sm font-medium leading-snug text-foreground transition-colors duration-200 group-hover:text-accent">
                      {entry.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-muted">
                      {entry.description}
                    </p>
                    <div className="mt-1 flex items-center gap-3">
                      <time
                        dateTime={entry.date}
                        className="font-mono text-[10px] tracking-wider text-subtle"
                      >
                        {entry.date}
                      </time>
                      {entry.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="font-mono text-[10px] tracking-wider text-subtle"
                        >
                          · {tag}
                        </span>
                      ))}
                    </div>
                  </Link>
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
