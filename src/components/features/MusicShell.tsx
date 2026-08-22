'use client';

import React from 'react';
import { Pause, Play, SkipForward } from 'lucide-react';
import { useMusicPlayer } from '@/components/features/music/MusicProvider';

export default function MusicShell() {
  const { track, isPlaying, togglePlay, next } = useMusicPlayer();

  return (
    <div
      className="flex w-full max-w-xs items-center gap-2 border border-border/30 bg-surface/40 px-2 py-2 text-left"
      aria-label="Music player"
    >
      <div
        className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden border border-border/30 bg-surface-raised"
        aria-hidden="true"
      >
        {track?.artwork ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={track.artwork}
            alt=""
            className="h-full w-full object-cover opacity-60"
          />
        ) : null}

        <div className="absolute inset-0 z-10 flex h-full items-end justify-center gap-0.5 pb-1.5">
          {[3, 5, 7, 4, 6].map((height, index) => (
            <span
              key={index}
              className="w-[2px] rounded-full bg-foreground/80"
              style={{
                height: `${height * 1.5}px`,
                transformOrigin: 'bottom',
                animation: isPlaying
                  ? `waveBar ${600 + index * 100}ms ease-in-out ${index * 80}ms infinite alternate`
                  : 'none',
                transform: isPlaying ? 'scaleY(0.3)' : 'scaleY(0.5)',
              }}
            />
          ))}
        </div>
      </div>

      <p
        className="min-w-0 flex-1 truncate text-xs font-medium leading-none text-foreground/80"
        title={track?.title ?? 'Music player'}
      >
        {track?.title ?? 'Music player'}
      </p>

      <div className="flex shrink-0 items-center gap-1 border-l border-border/30 pl-2">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause music' : 'Play music'}
          className="flex size-7 items-center justify-center text-muted transition-colors hover:text-foreground"
        >
          {isPlaying ? (
            <Pause size={14} fill="currentColor" aria-hidden="true" />
          ) : (
            <Play size={14} fill="currentColor" className="ml-0.5" aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Next track"
          className="flex size-7 items-center justify-center text-muted transition-colors hover:text-foreground"
        >
          <SkipForward size={14} fill="currentColor" aria-hidden="true" />
        </button>
      </div>

      <style>{`
        @keyframes waveBar {
          from { transform: scaleY(0.3); opacity: 0.4; }
          to   { transform: scaleY(1.0); opacity: 0.9; }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="waveBar"] { animation: none !important; transform: scaleY(0.6) !important; }
        }
      `}</style>
    </div>
  );
}
