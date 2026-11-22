import { siteConfig } from '@/lib/site';
import { pageMetadata } from '@/lib/page-metadata';
import type { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import SignalArchiveExperience from '@/components/features/signal/SignalArchiveExperience';
import { signalDaySchema, type SignalDayType } from '@/lib/signal/schemas';

export const metadata: Metadata = pageMetadata({
  title: 'Signal Archive',
  description:
    'Explore the historical archive of past daily Signal collections by Swaraj Singh, featuring curated collisions of art, web discoveries, cinema, and literature.',
  alternates: { canonical: '/signal/archive' },
  openGraph: {
    title: 'Signal Archive | Swaraj Singh',
    description:
      'Explore the historical archive of past daily Signal collections by Swaraj Singh, featuring curated collisions of art, web discoveries, cinema, and literature.',
    url: '/signal/archive',
    type: 'website',
  },
});

export default function SignalArchivePage() {
  let days: SignalDayType[] = [];
  let error: string | null = null;

  try {
    const historyDir = path.join(process.cwd(), 'signal/history');
    if (fs.existsSync(historyDir)) {
      const files = fs
        .readdirSync(historyDir)
        .filter((file) => file.endsWith('.json'))
        .sort((a, b) => b.localeCompare(a));

      days = files.flatMap((file) => {
        const raw = JSON.parse(fs.readFileSync(path.join(historyDir, file), 'utf8'));
        const parsed = signalDaySchema.safeParse(raw);
        return parsed.success ? [parsed.data] : [];
      });
    }
  } catch {
    error = 'The archive is temporarily unavailable. Please try again later.';
  }

  const archiveSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Signal Archive | Swaraj Singh',
    description:
      'Historical archive of curated daily Signal editions by Swaraj Singh across visual art, open web links, frontier technology, cinema, books, and ideas.',
    url: `${siteConfig.url}/signal/archive`,
    numberOfItems: days.length,
    itemListElement: days.slice(0, 10).map((day, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: `Signal Edition ${day.date}`,
      description: `Curated collection of ${day.nodes.length} cultural and technical discoveries from ${day.date}`,
    })),
  };

  return (
    <section className="min-h-screen px-5 pb-20 pt-24 md:px-10 md:pt-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(archiveSchema).replace(/</g, '\\u003c'),
        }}
      />
      <header className="mx-auto flex max-w-7xl flex-col items-start gap-3 border-b-2 border-foreground/80 pb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8 sm:pb-6">
        <div>
          <h1 className="text-4xl font-semibold uppercase leading-none tracking-[-0.05em] md:text-7xl">
            Archive
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">Past discoveries across art, technology, books, and the open web. Link to an edition by its date, or open a selection to visit its original source.</p>
        </div>
        <Link href="/signal" className="inline-flex min-h-11 shrink-0 items-center font-mono text-xs uppercase tracking-[0.16em] text-foreground underline underline-offset-4 hover:text-accent sm:min-h-0">
          Today ↗
        </Link>
      </header>

      <div className="mx-auto max-w-7xl">
        {error ? <p className="py-12 text-muted">{error}</p> : null}
        {!error && days.length === 0 ? (
          <p className="py-12 text-muted">No archived signals found.</p>
        ) : null}

        <SignalArchiveExperience days={days} />
      </div>
    </section>
  );
}
