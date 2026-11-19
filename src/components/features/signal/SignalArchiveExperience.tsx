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
            id={`edition-${day.date}`}
            className="grid gap-6 py-10 md:grid-cols-[150px_minmax(0,1fr)] md:py-14"
          >
            <div className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
              <a href={`#edition-${day.date}`} className="underline underline-offset-4">{day.date}</a>
              <p className="mt-2 text-[10px] text-subtle">
                {day.nodes.length} things
              </p>
            </div>
            <ul className="m-0 list-none divide-y divide-border p-0 md:hidden">
              {day.nodes.map((node) => (
                <li key={node.id} className="py-4">
                  <button type="button" onClick={() => setSelectedNode(node)} className="block min-h-11 w-full text-left text-foreground underline underline-offset-4">
                    {node.title}
                  </button>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{node.description}</p>
                  {node.url ? <a href={node.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block min-h-11 text-sm text-muted underline underline-offset-4">Source: {node.source}</a> : null}
                </li>
              ))}
            </ul>
            <div className="hidden h-[420px] overflow-hidden border border-border bg-background/35 px-5 backdrop-blur-sm md:block">
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
