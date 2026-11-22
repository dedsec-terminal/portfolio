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
  onSelect?: (node: SignalNode, trigger: HTMLButtonElement) => void;
}

const treatmentClass: Record<SignalTreatment, string> = {
  poster:
    'border-2 border-foreground/80 bg-background/20 text-left hover:bg-background/30',
  headline:
    'border-y-2 border-foreground/80 bg-background/20 text-left hover:border-accent hover:text-accent',
  note:
    'border border-border bg-background/20 text-left hover:border-foreground',
  strip:
    'border-l-4 border-foreground/80 bg-background/20 text-left hover:border-accent',
  fragment:
    'border border-dashed border-border bg-background/20 text-left hover:border-foreground',
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

function objectStyle(placement: SignalVisualPlacement, compact: boolean): CSSProperties {
  return {
    gridColumn: `${placement.col} / span ${placement.colSpan}`,
    gridRow: `${placement.row} / span ${placement.rowSpan}`,
    '--signal-mobile-width': `${compact ? placement.mobileWidth : Math.max(76, placement.mobileWidth)}%`,
    transform: `rotate(${placement.rotation}deg)`,
  } as CSSProperties;
}

function SignalObject({
  node,
  placement,
  index,
  compact,
  onSelect,
}: {
  node: SignalNode;
  placement: SignalVisualPlacement;
  index: number;
  compact: boolean;
  onSelect?: (node: SignalNode, trigger: HTMLButtonElement) => void;
}) {
  const title = node.title;
  const slotLabel = node.slot ? SIGNAL_SLOT_LABELS[node.slot] : node.category;
  const sharedClass = `group relative flex w-[var(--signal-mobile-width)] min-w-0 flex-col overflow-hidden p-0 transition-colors duration-200 md:h-full md:w-auto ${mobileAlignClass[placement.mobileAlign]} ${treatmentClass[placement.treatment]}`;

  const body = (
    <>
      {placement.treatment === 'poster' ? (
        <SignalPreviewSurface
          className="min-h-44 flex-1 md:h-[48%] md:min-h-0 md:flex-none"
          node={node}
          featured={!compact && node.slot === 'artwork'}
          decorative={!compact}
        />
      ) : (
        <SignalPreviewSurface
          className="pointer-events-none absolute inset-0 transition-opacity duration-200 group-hover:opacity-90"
          node={node}
          decorative={!compact}
        />
      )}

      {compact ? (
        <div className="relative flex min-h-0 flex-1 flex-col justify-end bg-gradient-to-t from-background via-background/52 to-background/5 p-3 md:p-2">
          <span className="absolute left-3 top-3 font-mono text-[9px] uppercase leading-none tracking-[0.2em] opacity-60 md:left-2 md:top-2">
            {String(index + 1).padStart(2, '0')} / {slotLabel}
          </span>
          <h2 className={`line-clamp-2 ${titleClass[placement.treatment]}`}>{title}</h2>
          <span aria-hidden="true" className="absolute bottom-3 right-4 font-mono text-sm opacity-35 transition group-hover:opacity-100">
            ↗
          </span>
        </div>
      ) : (
        <div className="relative flex min-h-0 flex-1 flex-col justify-end gap-1.5 bg-gradient-to-t from-background via-background/95 to-background/75 p-3 md:gap-1 md:p-2">
          <p className="flex shrink-0 items-baseline justify-between gap-2 font-mono text-[10px] uppercase leading-tight tracking-[0.12em] text-muted">
            {slotLabel}
            {onSelect ? <span aria-hidden="true">↗</span> : null}
          </p>
          <h2 className={`line-clamp-2 break-words ${titleClass[placement.treatment]}`}>{title}</h2>
          {node.curiosity ? (
            <p className="line-clamp-2 text-xs leading-snug text-muted md:hidden">{node.curiosity}</p>
          ) : null}
        </div>
      )}
    </>
  );

  if (!onSelect) {
    return (
      <div className={sharedClass} style={objectStyle(placement, compact)}>
        {body}
      </div>
    );
  }

  return (
    <div className={sharedClass} style={objectStyle(placement, compact)}>
      {body}
      <button
        type="button"
        className="signal-card-trigger absolute inset-0 z-10 cursor-pointer bg-transparent"
        onClick={(event) => onSelect(node, event.currentTarget)}
        aria-label={compact ? `Open ${title}` : `Open ${slotLabel}: ${title}`}
      />
    </div>
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
      className={`min-w-0 ${
        compact
          ? 'grid h-full min-h-0 grid-cols-12 grid-rows-12 gap-2 py-3 md:gap-3'
          : 'flex flex-col gap-10 min-h-[760px] py-10 md:grid md:h-full md:min-h-0 md:grid-cols-12 md:grid-rows-12 md:gap-3 md:py-3'
      }`}
      data-composition={plan.name}
    >
      {data.nodes.map((node, index) => (
        <SignalObject
          key={node.id}
          node={node}
          placement={plan.placements.find((placement) => placement.slot === node.slot) ?? plan.placements[index]}
          index={index}
          compact={compact}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
