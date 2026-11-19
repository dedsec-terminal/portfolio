import Link from 'next/link';
import { getContent } from '@/lib/content';

export default function WriteupRow() {
  const writeups = getContent('writeups').slice(0, 5);
  const isEmpty = writeups.length === 0;

  return (
    <section
      aria-label="Writeups"
      className={`glass-surface mx-3 my-4 rounded-2xl ${isEmpty ? 'py-10 md:py-12' : 'py-16 md:py-20'}`}
    >
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        {/* Section header */}
        <header className="mb-8 flex items-baseline gap-3">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-subtle">
            <Link href="/writeups" className="hover:text-foreground transition-colors duration-200">
              Writeups
            </Link>
          </h2>
          <div
            className="h-px max-w-12 flex-1 bg-border/30"
            aria-hidden="true"
          />
          <Link href="/writeups" className="text-xs text-subtle hover:text-foreground transition-colors duration-200" aria-label="View all writeups">
            View all
          </Link>
        </header>

        {isEmpty ? (
          <p className="text-sm text-subtle">Coming soon.</p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-6 p-0">
            {writeups.map((writeup) => (
              <li key={writeup.slug}>
                <article>
                  <Link
                    href={`/writeups/${writeup.slug}`}
                    className="group flex flex-col gap-1.5"
                  >
                    <h3 className="text-sm font-medium leading-snug text-foreground transition-colors duration-200 group-hover:text-accent">
                      {writeup.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-muted">
                      {writeup.description}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-3">
                      {writeup.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={tag}
                          className="font-mono text-[10px] tracking-wider text-subtle"
                        >
                          {idx > 0 ? '• ' : ''}{tag}
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
