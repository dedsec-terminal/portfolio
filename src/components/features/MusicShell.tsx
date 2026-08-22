'use client';

import React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { useMusicPlayer } from '@/components/features/music/MusicProvider';
import ExpandedPlayer from '@/components/features/music/ExpandedPlayer';

export default function MusicShell() {
  const { track, isPlaying } = useMusicPlayer();

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          className="flex items-center gap-3 px-4 py-3 border border-border/30 rounded-sm max-w-xs hover:bg-surface-raised transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-foreground/50 text-left"
          aria-label="Open music player"
        >
          {/* Album art / visualizer */}
          <div
            className="w-8 h-8 shrink-0 bg-surface-raised border border-border/30 rounded-sm flex items-center justify-center overflow-hidden relative"
            aria-hidden="true"
          >
            {track?.artwork ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={track.artwork} alt="" className="w-full h-full object-cover opacity-60" />
            ) : null}
            
            {/* Visualizer overlay */}
            <div className="absolute inset-0 flex items-end justify-center gap-0.5 pb-1.5 h-full z-10">
              {[3, 5, 7, 4, 6].map((height, i) => (
                <div
                  key={i}
                  className="w-[2px] bg-foreground/80 rounded-full"
                  style={{
                    height: `${height * 1.5}px`,
                    transformOrigin: 'bottom',
                    animation: isPlaying 
                      ? `waveBar ${600 + i * 100}ms ease-in-out ${i * 80}ms infinite alternate`
                      : 'none',
                    transform: isPlaying ? 'scaleY(0.3)' : 'scaleY(0.5)',
                  }}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>

          {/* Track info */}
          <div className="min-w-0">
            <p className="text-[11px] text-muted leading-none mb-0.5 truncate font-mono uppercase tracking-widest">
              Local Archive
            </p>
            <p className="text-xs text-foreground/80 leading-none truncate font-medium mt-1">
              {track ? track.title : '—'}
            </p>
          </div>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content 
          className="z-50 bg-background/95 backdrop-blur-xl border border-border/40 rounded-md shadow-2xl animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95" 
          sideOffset={8}
          align="start"
        >
          <ExpandedPlayer />
        </Popover.Content>
      </Popover.Portal>

      <style>{`
        @keyframes waveBar {
          from { transform: scaleY(0.3); opacity: 0.4; }
          to   { transform: scaleY(1.0); opacity: 0.9; }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="waveBar"] { animation: none !important; transform: scaleY(0.6) !important; }
        }
      `}</style>
    </Popover.Root>
  );
}
