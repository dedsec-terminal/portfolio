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
      <div className="min-h-screen pt-32 px-6 lg:px-12 flex flex-col items-center">
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
    <main className="w-full h-full bg-brand-neutral-950">
      <SignalExperience data={signalData} />
    </main>
  );
}
