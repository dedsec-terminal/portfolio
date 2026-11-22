'use client';

import { useState } from 'react';
import type { SignalDayType } from '@/lib/signal/schemas';
import SignalCollage from './SignalCollage';
import SignalDetailPanel from './SignalDetailPanel';

type SignalNode = SignalDayType['nodes'][number];

export default function SignalArchiveExperience({
  days,
}: {
  days: SignalDayType[];
}) {
  const [selection, setSelection] = useState<{ node: SignalNode; trigger: HTMLButtonElement } | null>(null);

  return (
    <>
      <div className="divide-y-2 divide-foreground/70">
        {days.map((day) => (
          <section
            key={day.date}
            id={`edition-${day.date}`}
            className="grid scroll-mt-20 grid-cols-[minmax(0,1fr)] gap-3 py-7 md:grid-cols-[150px_minmax(0,1fr)] md:gap-6 md:py-14"
          >
            <h2 className="font-mono text-sm font-medium tracking-wider text-foreground md:text-xs">
              <a href={`#edition-${day.date}`} className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-accent md:min-h-0">
                <time dateTime={day.date}>{day.date}</time>
              </a>
            </h2>
            <div className="min-w-0 md:h-[420px] md:overflow-hidden md:border md:border-border md:bg-background/35 md:px-5 md:backdrop-blur-sm">
              <SignalCollage
                data={day}
                compact
                onSelect={(node, trigger) => setSelection({ node, trigger })}
              />
            </div>
          </section>
        ))}
      </div>

      <SignalDetailPanel
        node={selection?.node ?? null}
        returnFocusTo={selection?.trigger}
        onClose={() => setSelection(null)}
      />
    </>
  );
}
