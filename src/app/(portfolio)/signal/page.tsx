import fs from 'fs';
import path from 'path';
import SignalExperience from '@/components/features/signal/SignalExperience';
import { signalDaySchema } from '@/lib/signal/schemas';

export const metadata = {
  title: 'The Signal | Swaraj Singh',
  description: 'Five unrelated things, placed together for one day.',
};

export default function SignalPage() {
  let signalData = null;
  let error = null;

  try {
    const filePath = path.join(process.cwd(), 'signal/current.json');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      signalData = signalDaySchema.parse(JSON.parse(content));
    } else {
      error = 'No current signal generated yet.';
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unable to load Signal.';
  }

  if (error || !signalData) {
    return (
      <main className="min-h-[calc(100svh-4.5rem)] px-6 pt-32 lg:px-12">
        <h1 className="text-4xl font-semibold uppercase tracking-[-0.04em] text-foreground">
          The Signal
        </h1>
        <p className="mt-8 font-mono text-xs uppercase tracking-[0.16em] text-muted">
          {error || 'Unable to load Signal.'}
        </p>
      </main>
    );
  }

  return (
    <main className="h-full w-full">
      <SignalExperience data={signalData} />
    </main>
  );
}
