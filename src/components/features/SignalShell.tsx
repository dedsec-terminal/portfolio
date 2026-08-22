import currentSignal from '../../../signal/current.json';
import { signalDaySchema } from '@/lib/signal/schemas';
import SignalGraph from './signal/SignalGraph';

const signalData = signalDaySchema.parse(currentSignal);

export default function SignalShell() {
  return (
    <section aria-labelledby="signal-heading" className="border-t border-border/30 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="mb-8 flex items-baseline gap-3">
          <h2
            id="signal-heading"
            className="font-mono text-xs uppercase tracking-[0.2em] text-subtle"
          >
            Signal
          </h2>
          <div className="h-px max-w-12 flex-1 bg-border/30" aria-hidden="true" />
        </div>

        <SignalGraph
          data={signalData}
          compact
          openLinksOnClick
          className="h-[360px] border-y border-border/30 md:h-[430px]"
        />

        <div className="mt-8 flex items-center justify-between gap-8">
          <p className="max-w-sm text-xs leading-relaxed text-subtle">
            Drag to rearrange. Scroll to zoom. Select a signal to follow its source.
          </p>
          <a
            href="/signal"
            className="font-mono text-xs uppercase tracking-wider text-subtle transition-colors duration-200 hover:text-muted"
          >
            Explore ↗
          </a>
        </div>
      </div>
    </section>
  );
}
