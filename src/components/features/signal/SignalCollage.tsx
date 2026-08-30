'use client';

import type { CSSProperties } from 'react';
import type { SignalDayType } from '@/lib/signal/schemas';
import {
  getSignalVisualPlan,
  type SignalTreatment,
  type SignalVisualPlacement,
} from '@/lib/signal/visual';
import SignalPreviewSurface from './SignalPreviewSurface';
import { SIGNAL_SLOT_LABELS } from '@/lib/signal/types';

type SignalNode = SignalDayType['nodes'][number];

interface SignalCollageProps {
  data: SignalDayType;
  compact?: boolean;
  onSelect?: (node: SignalNode) => void;
}

const treatmentClass: Record<SignalTreatment, string> = {
  poster:
    'border-2 border-foreground/80 bg-background/80 text-left backdrop-blur-md hover:bg-background',
  headline:
    'border-y-2 border-foreground/80 bg-background/65 text-left backdrop-blur-md hover:border-accent hover:text-accent',
  note:
    'border border-border bg-background/70 text-left backdrop-blur-md hover:border-foreground',
  strip:
    'border-l-4 border-foreground/80 bg-background/65 text-left backdrop-blur-md hover:border-accent',
  fragment:
    'border border-dashed border-border bg-background/65 text-left backdrop-blur-md hover:border-foreground',
};

const titleClass: Record<SignalTreatment, string> = {
  poster: 'text-xl font-semibold leading-[0.95] tracking-[-0.04em] md:text-2xl',
  headline:
    'text-2xl font-semibold uppercase leading-[0.86] tracking-[-0.055em] md:text-3xl',
  note: 'text-lg font-medium leading-tight tracking-[-0.025em] md:text-xl',
  strip:
    'text-base font-medium uppercase leading-tight tracking-[-0.03em] md:text-lg',
  fragment:
    'text-base font-medium uppercase leading-tight tracking-[0.08em] md:text-xl',
};

const mobileAlignClass: Record<SignalVisualPlacement['mobileAlign'], string> = {
  start: 'self-start',
  center: 'self-center',
  end: 'self-end',
};

function objectStyle(placement: SignalVisualPlacement): CSSProperties {
  const zIndexByTreatment: Record<SignalTreatment, number> = {
    poster: 4,
    headline: 6,
    note: 5,
    strip: 3,
    fragment: 2,
  };

  return {
    gridColumn: `${placement.col} / span ${placement.colSpan}`,
    gridRow: `${placement.row} / span ${placement.rowSpan}`,
    '--signal-mobile-width': `${placement.mobileWidth}%`,
    transform: `rotate(${placement.rotation}deg)`,
    zIndex: zIndexByTreatment[placement.treatment],
  } as CSSProperties;
}

function SignalObject({
  node,
  placement,
  index,
  onSelect,
}: {
  node: SignalNode;
  placement: SignalVisualPlacement;
  index: number;
  onSelect?: (node: SignalNode) => void;
}) {
  const title = node.title.replace(/^\[SAMPLE\]\s*/i, '');
  const slotLabel = node.slot ? SIGNAL_SLOT_LABELS[node.slot] : node.category;
  const sharedClass = `group relative flex w-[var(--signal-mobile-width)] min-w-0 flex-col overflow-hidden p-0 transition-colors duration-200 md:h-full md:w-auto ${mobileAlignClass[placement.mobileAlign]} ${treatmentClass[placement.treatment]}`;

  const body = (
    <>
      {placement.treatment === 'poster' ? (
        <SignalPreviewSurface className="min-h-44 flex-1 md:h-[48%] md:min-h-0 md:flex-none" node={node} />
      ) : (
        <SignalPreviewSurface
          className="pointer-events-none absolute inset-0 opacity-55 transition-opacity duration-200 group-hover:opacity-75"
          node={node}
        />
      )}

      <div className="relative flex min-h-0 flex-1 flex-col justify-end bg-background/45 p-3 backdrop-blur-[2px] md:p-2">
        <span className="absolute left-3 top-3 font-mono text-[9px] uppercase leading-none tracking-[0.2em] opacity-60 md:left-2 md:top-2">
          {String(index + 1).padStart(2, '0')} / {slotLabel}
        </span>
        <h2 className={`line-clamp-2 ${titleClass[placement.treatment]}`}>{title}</h2>
        <span className="absolute bottom-3 right-4 font-mono text-sm opacity-35 transition group-hover:opacity-100">
          ↗
        </span>
      </div>
    </>
  );

  if (!onSelect) {
    return (
      <div className={sharedClass} style={objectStyle(placement)}>
        {body}
      </div>
    );
  }

  return (
    <button
      type="button"
      className={sharedClass}
      style={objectStyle(placement)}
      onClick={() => onSelect?.(node)}
      aria-label={`Open ${title}`}
    >
      {body}
    </button>
  );
}

export default function SignalCollage({
  data,
  compact = false,
  onSelect,
}: SignalCollageProps) {
  const plan = getSignalVisualPlan(data.seed, data.nodes.length);

  return (
    <div
      className={`flex min-w-0 flex-col gap-10 ${
        compact
          ? 'grid h-full min-h-0 grid-cols-12 grid-rows-12 gap-2 py-3 md:gap-3'
          : 'min-h-[760px] py-10 md:grid md:h-full md:min-h-0 md:grid-cols-12 md:grid-rows-12 md:gap-3 md:py-3'
      }`}
      data-composition={plan.name}
    >
      {data.nodes.map((node, index) => (
        <SignalObject
          key={node.id}
          node={node}
          placement={plan.placements[index]}
          index={index}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
