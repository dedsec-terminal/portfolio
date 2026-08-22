'use client';

import { useState } from 'react';
import type { SignalDayType } from '@/lib/signal/schemas';
import SignalDetailPanel from './SignalDetailPanel';
import SignalGraph from './SignalGraph';

interface SignalExperienceProps {
  data: SignalDayType;
}

export default function SignalExperience({ data }: SignalExperienceProps) {
  const [selectedNode, setSelectedNode] = useState<
    SignalDayType['nodes'][number] | null
  >(null);

  return (
    <section className="relative h-[calc(100svh-4.5rem)] min-h-[600px] w-full overflow-hidden bg-black/20 md:h-[calc(100svh-5.5rem)]">
      <SignalGraph
        data={data}
        className="h-full w-full"
        onNodeSelect={setSelectedNode}
      />

      <SignalDetailPanel
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
      />

      <div className="pointer-events-none absolute left-6 top-24 z-10 md:left-12">
        <h1 className="mb-1 font-sans text-3xl font-bold tracking-tight text-brand-neutral-100">
          The Signal
        </h1>
        <p className="font-mono text-xs uppercase tracking-widest text-brand-neutral-400">
          {data.date} :: {data.seed}
        </p>
      </div>
    </section>
  );
}
