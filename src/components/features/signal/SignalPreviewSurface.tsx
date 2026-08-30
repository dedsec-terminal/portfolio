'use client';

import { useEffect, useRef, useState } from 'react';
import type { SignalDayType } from '@/lib/signal/schemas';

type SignalNode = SignalDayType['nodes'][number];

const SLOT_ART: Record<NonNullable<SignalNode['slot']>, { mark: string; hue: number; label: string }> = {
  artwork: { mark: '✦', hue: 32, label: 'Public collection' },
  website: { mark: '◉', hue: 195, label: 'Open on the web' },
  frontier: { mark: '//', hue: 348, label: 'Current signal' },
  screen: { mark: '▤', hue: 262, label: 'On screen' },
  reading: { mark: '¶', hue: 142, label: 'On the page' },
  words: { mark: '“”', hue: 48, label: 'A line to keep' },
};

function hash(value: string) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

export default function SignalPreviewSurface({
  node,
  className = '',
}: {
  node: SignalNode;
  className?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const seed = hash(node.id);
  const slot = node.slot ?? 'frontier';
  const art = SLOT_ART[slot];
  const hue = (art.hue + seed % 38) % 360;
  const showImage = Boolean(node.image) && !imageFailed;
  const positioning = className?.includes('absolute') ? '' : 'relative';

  useEffect(() => {
    const image = imageRef.current;
    if (!image?.complete) return;
    if (image.naturalWidth > 0) setImageLoaded(true);
    else setImageFailed(true);
  }, [node.image]);

  return (
    <div className={`${positioning} isolate overflow-hidden bg-background ${className}`} aria-hidden="true">
      <div
        data-testid="signal-preview-fallback"
        className="absolute inset-0 bg-background"
        style={{
          backgroundImage: `radial-gradient(circle at 13% 18%, hsl(${hue} 76% 62% / 0.62), transparent 28%), radial-gradient(circle at 88% 82%, hsl(${(hue + 72) % 360} 72% 55% / 0.44), transparent 36%), linear-gradient(135deg, hsl(${hue} 44% 22%), hsl(${(hue + 26) % 360} 28% 9%) 62%, hsl(${hue} 32% 5%))`,
        }}
      >
        <span className="absolute inset-[11%] border border-background/45" />
        <span className="absolute left-[11%] top-[10%] font-mono text-[clamp(2.75rem,8vw,7rem)] font-semibold leading-none tracking-[-0.16em] text-background/55">
          {art.mark}
        </span>
        <span className="absolute bottom-[20%] left-0 h-px w-full bg-background/40" />
        <span className="absolute left-[62%] top-0 h-full w-px bg-background/35" />
        <span className="absolute bottom-4 left-4 font-mono text-[8px] uppercase tracking-[0.26em] text-background/80">
          {art.label}
        </span>
      </div>

      {showImage ? (
        <img
          ref={imageRef}
          data-testid="signal-preview-image"
          className={`absolute inset-0 h-full w-full object-cover grayscale transition duration-500 group-hover:grayscale-0 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          src={node.image}
          alt=""
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageFailed(true)}
        />
      ) : null}

      <span className="absolute inset-0 bg-gradient-to-t from-background/55 via-background/5 to-transparent" />
      <span className="absolute bottom-3 right-3 font-mono text-[9px] uppercase tracking-[0.3em] text-background/75">
        Signal {String((seed % 97) + 1).padStart(2, '0')}
      </span>
    </div>
  );
}
