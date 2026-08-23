import fs from 'fs';
import path from 'path';
import SignalCollage from '@/components/features/signal/SignalCollage';
import { signalDaySchema, type SignalDayType } from '@/lib/signal/schemas';

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

  return (
    <main className="min-h-screen px-5 pb-20 pt-24 md:px-10 md:pt-28">
      <header className="mx-auto flex max-w-7xl items-end justify-between gap-8 border-b-2 border-foreground/80 pb-6">
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.28em] text-subtle">
            Frozen daily collisions
          </p>
          <h1 className="text-4xl font-semibold uppercase leading-none tracking-[-0.05em] md:text-7xl">
            Signal Archive
          </h1>
        </div>
        <a href="/signal" className="font-mono text-xs uppercase tracking-[0.16em] text-muted hover:text-foreground">
          Today ↗
        </a>
      </header>

      <div className="mx-auto max-w-7xl">
        {error ? <p className="py-12 text-muted">{error}</p> : null}
        {!error && days.length === 0 ? (
          <p className="py-12 text-muted">No archived signals found.</p>
        ) : null}

        <div className="divide-y-2 divide-foreground/70">
          {days.map((day) => (
            <section key={day.date} className="grid gap-6 py-10 md:grid-cols-[150px_minmax(0,1fr)] md:py-14">
              <div className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
                <p>{day.date}</p>
                <p className="mt-2 text-[10px] text-subtle">{day.nodes.length} things</p>
              </div>
              <div className="h-[340px] overflow-hidden border border-border px-3 md:h-[380px] md:px-5">
                <SignalCollage data={day} compact />
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
