import type { SignalDayType } from '@/lib/signal/schemas';
import { ExternalLink, X } from 'lucide-react';
import SignalPreviewSurface from './SignalPreviewSurface';
import { SIGNAL_SLOT_LABELS } from '@/lib/signal/types';

type SignalNode = SignalDayType['nodes'][0];

interface SignalDetailPanelProps {
  node: SignalNode | null;
  onClose: () => void;
}

export default function SignalDetailPanel({ node, onClose }: SignalDetailPanelProps) {
  if (!node) return null;

  const title = node.title.replace(/^\[SAMPLE\]\s*/i, '');
  const slotLabel = node.slot ? SIGNAL_SLOT_LABELS[node.slot] : node.category;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-background/92 p-4 backdrop-blur-sm md:items-center md:justify-center md:p-10">
      <article className="relative max-h-[88svh] w-full max-w-5xl overflow-y-auto border-2 border-foreground/80 bg-background">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex size-11 items-center justify-center border border-foreground/60 bg-background text-foreground transition-colors hover:bg-foreground hover:text-background"
          aria-label="Close details"
        >
          <X className="size-5" />
        </button>

        <div className="grid md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <SignalPreviewSurface className="min-h-72 border-b-2 border-foreground/80 md:min-h-[560px] md:border-b-0 md:border-r-2" node={node} />

          <div className="flex min-h-80 flex-col justify-between p-6 pr-20 md:p-10 md:pr-20">
            <div>
              <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.25em] text-subtle">
                {slotLabel} / found today
              </p>
              <h2 className="text-3xl font-semibold leading-[0.95] tracking-[-0.045em] text-foreground md:text-5xl">
                {title}
              </h2>
              {node.curiosity ? (
                <p className="mt-5 max-w-[38ch] font-mono text-xs uppercase leading-6 tracking-[0.14em] text-subtle">
                  {node.curiosity}
                </p>
              ) : null}
              <p className="mt-8 max-w-[48ch] whitespace-pre-line text-sm leading-7 text-muted md:text-base">
                {node.description}
              </p>
            </div>

            <div className="mt-10 border-t border-border pt-5">
              {node.url ? (
                <a
                  href={node.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-foreground hover:text-accent"
                >
                  Open source <ExternalLink className="size-4" />
                </a>
              ) : (
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
                  No external source
                </span>
              )}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
