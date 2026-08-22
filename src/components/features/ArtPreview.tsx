/* eslint-disable @next/next/no-img-element -- Art media must remain simple static public URLs. */
import Link from 'next/link';
import { getContent } from '@/lib/content';

export default function ArtPreview() {
  const art = getContent('art').slice(0, 3);

  return (
    <div>
      <div className="mb-6 flex items-baseline gap-3">
        <span className="font-mono text-xs text-subtle tracking-[0.2em] uppercase">
          Art &amp; Media
        </span>
        <div className="flex-1 h-px bg-border/30 max-w-12" aria-hidden="true" />
      </div>

      {art.length === 0 ? (
        <p className="text-xs text-subtle">No art published yet.</p>
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
  );
}
