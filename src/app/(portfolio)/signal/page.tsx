import fs from 'fs';
import path from 'path';
import SignalExperience from '@/components/features/signal/SignalExperience';
import { signalDaySchema } from '@/lib/signal/schemas';

export const metadata = {
  title: 'The Signal | Swaraj Singh',
  description: 'An interactive discovery of media and thoughts.',
};

export default function SignalPage() {
  let signalData = null;
  let error = null;

  try {
    const filePath = path.join(process.cwd(), 'signal/current.json');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const rawJson = JSON.parse(content);
      // Validate with zod
      signalData = signalDaySchema.parse(rawJson);
    } else {
      error = 'No current signal generated yet.';
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unable to load Signal.';
  }

  if (error || !signalData) {
    return (
      <div className="glass-surface m-3 flex min-h-[calc(100svh-4.5rem)] flex-col items-center rounded-2xl px-6 pt-32 lg:m-6 lg:px-12">
        <h1 className="text-4xl font-bold font-sans tracking-tight text-brand-neutral-100 mb-8">
          The Signal
        </h1>
        <p className="text-brand-neutral-400">
          {error || 'Unable to load Signal.'}
        </p>
      </div>
    );
  }

  return (
    <main className="h-full w-full p-3 md:p-5">
      <div className="glass-surface overflow-hidden rounded-2xl">
        <SignalExperience data={signalData} />
      </div>
    </main>
  );
}
