/* eslint-disable @next/next/no-img-element -- Art media must remain simple static public URLs. */
import Link from 'next/link';
import { getContent } from '@/lib/content';

export default function ArtPreview() {
  const art = getContent('art').slice(0, 3);
  const isEmpty = art.length === 0;

  return (
    <section
      aria-label="Art and media"
      className={`glass-surface mx-3 md:mx-6 my-4 rounded-2xl ${isEmpty ? 'py-10 md:py-12' : 'py-16 md:py-20'}`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-12">
        <div>
          <header className="mb-6 flex items-baseline gap-3">
            <h2 className="font-mono text-xs text-subtle tracking-[0.2em] uppercase">
              <Link href="/art" className="hover:text-foreground transition-colors duration-200">
                Art &amp; Media
              </Link>
            </h2>
            <div className="flex-1 h-px bg-border/30 max-w-12" aria-hidden="true" />
            <Link href="/art" className="text-xs text-subtle hover:text-foreground transition-colors duration-200" aria-label="View all art">
              View all
            </Link>
          </header>

          {isEmpty ? (
            <p className="text-xs text-subtle">Coming soon.</p>
          ) : (
            <div className="grid grid-cols-3 gap-px bg-border/20">
              {art.map((entry) => (
                <Link key={entry.slug} href={`/art/${entry.slug}`} className="group relative aspect-square overflow-hidden bg-surface">
                  <img src={entry.media[0].src} alt={entry.media[0].alt} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
