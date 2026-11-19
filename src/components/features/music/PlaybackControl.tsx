'use client';

import { usePathname } from 'next/navigation';
import { useMusicPlayer } from './MusicProvider';

export default function PlaybackControl() {
  const pathname = usePathname();
  const { isPlaying, togglePlay, track } = useMusicPlayer();
  if (pathname === '/' || !isPlaying) return null;
  return (
    <button type="button" onClick={togglePlay}
      className="fixed bottom-24 right-4 z-40 max-w-[calc(100vw-2rem)] rounded border border-border bg-background px-4 py-3 text-sm text-foreground shadow-lg md:bottom-6"
      aria-label={`Pause music${track ? `: ${track.title}` : ''}`}>
      Pause music
    </button>
  );
}
