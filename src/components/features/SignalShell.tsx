import currentSignal from '../../../signal/current.json';
import { signalDaySchema } from '@/lib/signal/schemas';
import SignalCollage from './signal/SignalCollage';

const signalData = signalDaySchema.parse(currentSignal);

export default function SignalShell() {
  return (
    <section aria-labelledby="signal-heading" className="border-t border-border/30 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.24em] text-subtle">
              Changes daily
            </p>
            <h2 id="signal-heading" className="text-3xl font-semibold uppercase leading-none tracking-[-0.045em] text-foreground md:text-5xl">
              The Signal
            </h2>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">
            {signalData.date}
          </span>
        </div>

        <div className="overflow-hidden border-y-2 border-foreground/70 px-2 md:px-5">
          <SignalCollage data={signalData} compact />
        </div>

        <div className="mt-6 flex items-center justify-between gap-8">
          <p className="max-w-sm text-xs leading-relaxed text-subtle">
            Five unrelated things placed together for one day.
          </p>
          <a href="/signal" className="font-mono text-xs uppercase tracking-wider text-subtle transition-colors duration-200 hover:text-foreground">
            Enter today&apos;s issue ↗
          </a>
        </div>
      </div>
    </section>
  );
}
