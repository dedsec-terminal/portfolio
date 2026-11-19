import type { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import SignalArchiveExperience from '@/components/features/signal/SignalArchiveExperience';
import { signalDaySchema, type SignalDayType } from '@/lib/signal/schemas';

export const metadata: Metadata = {
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
};

export default function SignalArchivePage() {
  let days: SignalDayType[] = [];
  let error: string | null = null;

  try {
    const historyDir = path.join(process.cwd(), 'signal/history');
    if (fs.existsSync(historyDir)) {
      const files = fs
        .readdirSync(historyDir)
        .filter((file) => file.endsWith('.json'))
        .sort((a, b) => b.localeCompare(a))
        .slice(0, 24);

      days = files.flatMap((file) => {
        const raw = JSON.parse(fs.readFileSync(path.join(historyDir, file), 'utf8'));
        const parsed = signalDaySchema.safeParse(raw);
        return parsed.success ? [parsed.data] : [];
      });
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unable to load the Signal archive.';
  }

  const archiveSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Signal Archive | Swaraj Singh',
    description:
      'Historical archive of curated daily Signal editions by Swaraj Singh across visual art, open web links, frontier technology, cinema, books, and ideas.',
    url: 'https://dedsec-terminal.in/signal/archive',
    numberOfItems: days.length,
    itemListElement: days.slice(0, 10).map((day, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: `Signal Edition ${day.date}`,
      description: `Curated collection of ${day.nodes.length} cultural and technical discoveries from ${day.date}`,
    })),
  };

  return (
    <main className="min-h-screen px-5 pb-20 pt-24 md:px-10 md:pt-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(archiveSchema).replace(/</g, '\\u003c'),
        }}
      />
      <header className="mx-auto flex max-w-7xl items-end justify-between gap-8 border-b-2 border-foreground/80 pb-6">
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.28em] text-subtle">
            Past daily collisions
          </p>
          <h1 className="text-4xl font-semibold uppercase leading-none tracking-[-0.05em] md:text-7xl">
            Archive
          </h1>
        </div>
        <Link href="/signal" className="font-mono text-xs uppercase tracking-[0.16em] text-muted hover:text-foreground">
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
    </main>
  );
}
