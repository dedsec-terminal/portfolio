import path from 'path';
import { parseContent } from '@/lib/mdx';
import { writeupSchema } from '@/lib/schemas';

type Writeup = {
  title: string;
  date: string;
  description: string;
  tags: string[];
  event?: string;
  slug: string;
  content: string;
};

function getWriteups(): Writeup[] {
  try {
    const dir = path.join(process.cwd(), 'src/content/professional/writeups');
    return parseContent(dir, writeupSchema)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);
  } catch {
    return [];
  }
}

export default function WriteupRow() {
  const writeups = getWriteups();

  return (
    <section aria-label="Writeups" className="py-16 md:py-20 border-t border-border/30">
      <div className="max-w-7xl mx-auto px-6 md:px-12">

        {/* Section header */}
        <div className="mb-8 flex items-baseline gap-3">
          <span className="font-mono text-xs text-subtle tracking-[0.2em] uppercase">
            Writeups
          </span>
          <div className="flex-1 h-px bg-border/30 max-w-12" aria-hidden="true" />
        </div>

        {writeups.length === 0 ? (
          <p className="text-sm text-subtle">No writeups yet.</p>
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
                <span className="text-sm text-muted group-hover:text-foreground transition-colors duration-200 leading-relaxed flex-1">
                  {writeup.title}
                </span>

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
