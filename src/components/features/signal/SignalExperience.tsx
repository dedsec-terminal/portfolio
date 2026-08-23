'use client';

import { useState } from 'react';
import type { SignalDayType } from '@/lib/signal/schemas';
import SignalCollage from './SignalCollage';
import SignalDetailPanel from './SignalDetailPanel';

interface SignalExperienceProps {
  data: SignalDayType;
}

export default function SignalExperience({ data }: SignalExperienceProps) {
  const [selectedNode, setSelectedNode] = useState<
    SignalDayType['nodes'][number] | null
  >(null);

  return (
    <section className="relative min-h-[calc(100svh-4.5rem)] w-full overflow-hidden bg-background md:min-h-[calc(100svh-5.5rem)]">
      <header className="flex items-end justify-between gap-6 border-b-2 border-foreground/80 px-5 pb-5 pt-20 md:px-10 md:pb-7 md:pt-24">
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-subtle">
            Five things, placed together
          </p>
          <h1 className="text-4xl font-semibold uppercase leading-none tracking-[-0.055em] text-foreground md:text-7xl">
            The Signal
          </h1>
        </div>
        <div className="shrink-0 text-right font-mono text-[10px] uppercase tracking-[0.18em] text-muted md:text-xs">
          <p>{data.date}</p>
          <a href="/signal/archive" className="mt-2 inline-block hover:text-foreground">
            Archive ↗
          </a>
        </div>
      </header>

      <div className="px-5 md:px-10">
        <SignalCollage data={data} onSelect={setSelectedNode} />
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-4 border-t-2 border-foreground/80 px-5 py-5 font-mono text-[10px] uppercase tracking-[0.18em] text-subtle md:px-10">
        <span>{data.nodes.length} things / today</span>
        <span>Changes daily</span>
      </footer>

      <SignalDetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
    </section>
  );
}
