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
  const [selectedNode, setSelectedNode] = useState<SignalNode | null>(null);

  return (
    <>
      <div className="divide-y-2 divide-foreground/70">
        {days.map((day) => (
          <section
            key={day.date}
            className="grid gap-6 py-10 md:grid-cols-[150px_minmax(0,1fr)] md:py-14"
          >
            <div className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
              <p>{day.date}</p>
              <p className="mt-2 text-[10px] text-subtle">
                {day.nodes.length} things
              </p>
            </div>
            <div className="h-[360px] overflow-hidden border border-border bg-background/35 px-3 backdrop-blur-sm md:h-[420px] md:px-5">
              <SignalCollage data={day} compact onSelect={setSelectedNode} />
            </div>
          </section>
        ))}
      </div>

      <SignalDetailPanel
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
      />
    </>
  );
}
