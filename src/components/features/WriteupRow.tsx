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
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section header */}
        <header className="mb-8 flex items-baseline gap-3">
          <h2 className="font-mono text-xs text-subtle tracking-[0.2em] uppercase">
            <Link href="/writeups" className="hover:text-foreground transition-colors duration-200">
              Writeups
            </Link>
          </h2>
          <div
            className="flex-1 h-px bg-border/30 max-w-12"
            aria-hidden="true"
          />
          <Link href="/writeups" className="text-xs text-subtle hover:text-foreground transition-colors duration-200" aria-label="View all writeups">
            View all
          </Link>
        </header>

        {isEmpty ? (
          <p className="text-sm text-subtle">Coming soon.</p>
        ) : (
          <ul className="flex flex-col list-none m-0 p-0">
            {writeups.map((writeup) => (
              <li
                key={writeup.slug}
                className="flex items-baseline gap-4 sm:gap-8 py-3 border-b border-border/20 last:border-0 group"
              >
                {/* Date */}
                <time
                  dateTime={writeup.date}
                  className="font-mono text-[10px] text-subtle tracking-wider shrink-0 w-20 hidden sm:block"
                >
                  {writeup.date}
                </time>

                {/* Title */}
                <Link
                  href={`/writeups/${writeup.slug}`}
                  className="text-sm text-muted group-hover:text-foreground transition-colors duration-200 leading-relaxed flex-1"
                >
                  {writeup.title}
                </Link>

                {/* Tags */}
                <div className="hidden md:flex items-center gap-3 shrink-0">
                  {writeup.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-[10px] text-subtle tracking-wider"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
