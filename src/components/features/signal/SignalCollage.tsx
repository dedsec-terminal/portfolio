'use client';

import type { CSSProperties } from 'react';
import type { SignalDayType } from '@/lib/signal/schemas';
import {
  getSignalVisualPlan,
  type SignalTreatment,
  type SignalVisualPlacement,
} from '@/lib/signal/visual';

type SignalNode = SignalDayType['nodes'][number];

interface SignalCollageProps {
  data: SignalDayType;
  compact?: boolean;
  onSelect?: (node: SignalNode) => void;
}

const treatmentClass: Record<SignalTreatment, string> = {
  poster:
    'border-2 border-foreground/80 bg-background text-left hover:bg-foreground hover:text-background',
  headline:
    'border-y-2 border-foreground/80 bg-transparent text-left hover:border-accent hover:text-accent',
  note:
    'border border-border bg-surface/70 text-left hover:border-foreground',
  strip:
    'border-l-4 border-foreground/80 bg-transparent text-left hover:border-accent',
  fragment:
    'border border-dashed border-border bg-transparent text-left hover:border-foreground',
};

const titleClass: Record<SignalTreatment, string> = {
  poster: 'text-2xl font-semibold leading-[0.95] tracking-[-0.04em] md:text-4xl',
  headline:
    'text-3xl font-semibold uppercase leading-[0.86] tracking-[-0.055em] md:text-6xl lg:text-7xl',
  note: 'text-xl font-medium leading-tight tracking-[-0.025em] md:text-3xl',
  strip:
    'text-xl font-medium uppercase leading-none tracking-[-0.03em] md:text-4xl',
  fragment:
    'text-lg font-medium uppercase leading-tight tracking-[0.08em] md:text-2xl',
};

const mobileAlignClass: Record<SignalVisualPlacement['mobileAlign'], string> = {
  start: 'self-start',
  center: 'self-center',
  end: 'self-end',
};

function objectStyle(placement: SignalVisualPlacement): CSSProperties {
  return {
    gridColumn: `${placement.col} / span ${placement.colSpan}`,
    gridRow: `${placement.row} / span ${placement.rowSpan}`,
    '--signal-mobile-width': `${placement.mobileWidth}%`,
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
  onSelect?: (node: SignalNode) => void;
}) {
  const title = node.title.replace(/^\[SAMPLE\]\s*/i, '');
  const sharedClass = `group relative flex w-[var(--signal-mobile-width)] min-w-0 flex-col overflow-hidden p-0 transition-colors duration-200 md:w-auto ${mobileAlignClass[placement.mobileAlign]} ${treatmentClass[placement.treatment]}`;

  const body = (
    <>
      {node.image ? (
        <div
          className={`relative overflow-hidden ${
            placement.treatment === 'poster'
              ? 'min-h-52 flex-1 md:min-h-64'
              : 'h-32 md:h-44'
          }`}
          aria-hidden="true"
        >
          {/* Remote sources vary daily, so this stays deliberately unoptimized. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="absolute inset-0 h-full w-full object-cover grayscale transition duration-300 group-hover:grayscale-0"
            src={node.image}
            alt=""
            loading="lazy"
          />
        </div>
      ) : null}

      <div className="relative flex min-h-24 flex-col justify-between gap-5 p-4 md:p-5">
        <span className="font-mono text-[10px] tracking-[0.24em] opacity-50">
          {String(index + 1).padStart(2, '0')}
        </span>
        <h2 className={titleClass[placement.treatment]}>{title}</h2>
        {!compact && placement.treatment === 'note' ? (
          <p className="line-clamp-3 max-w-[42ch] text-xs leading-relaxed opacity-60 md:text-sm">
            {node.description}
          </p>
        ) : null}
        <span className="absolute bottom-3 right-4 font-mono text-sm opacity-35 transition group-hover:opacity-100">
          ↗
        </span>
      </div>
    </>
  );

  if (compact) {
    return (
      <a href="/signal" className={sharedClass} style={objectStyle(placement)}>
        {body}
      </a>
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
          ? 'min-h-[520px] py-8 md:grid md:min-h-[620px] md:grid-cols-12 md:grid-rows-12 md:gap-3'
          : 'min-h-[760px] py-12 md:grid md:min-h-[980px] md:grid-cols-12 md:grid-rows-12 md:gap-4 md:py-16'
      }`}
      data-composition={plan.name}
    >
      {data.nodes.map((node, index) => (
        <SignalObject
          key={node.id}
          node={node}
          placement={plan.placements[index]}
          index={index}
          compact={compact}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
