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
    <section className="relative min-h-[calc(100svh-3rem)] w-full bg-background/65 backdrop-blur-sm md:flex md:h-[calc(100svh-3rem)] md:min-h-0 md:flex-col md:overflow-hidden">
      <header className="flex shrink-0 items-end justify-between gap-6 border-b-2 border-foreground/80 bg-background/20 px-5 pb-4 pt-8 md:px-10 md:pb-4 md:pt-6">
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-subtle">
            Five things, placed together now
          </p>
          <h1 className="text-4xl font-semibold uppercase leading-none tracking-[-0.055em] text-foreground md:text-5xl">
            Today
          </h1>
        </div>
        <div className="shrink-0 text-right font-mono text-[10px] uppercase tracking-[0.18em] text-muted md:text-xs">
          <p>{data.date}</p>
          <a href="/signal/archive" className="mt-2 inline-block hover:text-foreground">
            Archive ↗
          </a>
        </div>
      </header>

      <div className="px-5 md:min-h-0 md:flex-1 md:px-10">
        <SignalCollage data={data} onSelect={setSelectedNode} />
      </div>

      <footer className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-t-2 border-foreground/80 bg-background/20 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-subtle md:px-10">
        <span>{data.nodes.length} things / now</span>
        <span>Changes tomorrow</span>
      </footer>

      <SignalDetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
    </section>
  );
}
