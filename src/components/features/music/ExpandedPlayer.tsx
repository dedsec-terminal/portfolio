'use client';

import React from 'react';
import * as Slider from '@radix-ui/react-slider';
import { Play, Pause, SkipBack, SkipForward, Music2, MonitorSpeaker } from 'lucide-react';
import { useMusicPlayer } from './MusicProvider';
import catalogueData from '../../../content/music/catalogue.json';

export default function ExpandedPlayer() {
  const { 
    track, 
    isPlaying, 
    progress, 
    duration, 
    togglePlay, 
    next, 
    previous, 
    seek, 
    currentIndex,
    playTrack
  } = useMusicPlayer();

  const formatTime = (ms: number) => {
    if (!ms || isNaN(ms)) return '0:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const value = duration > 0 ? (progress / duration) * 100 : 0;

  const handleSeek = (val: number[]) => {
    if (val[0] !== undefined) {
      const newMs = (val[0] / 100) * duration;
      seek(newMs);
    }
  };

  const hasCatalogue = catalogueData.tracks.length > 0;
  
  // Calculate upcoming tracks for queue (next 2 tracks)
  const upNextTracks = [];
  if (hasCatalogue) {
    const len = catalogueData.tracks.length;
    for (let i = 1; i <= 2 && i < len; i++) {
      const idx = (currentIndex + i) % len;
      upNextTracks.push({ ...catalogueData.tracks[idx], index: idx });
    }
  }

  return (
    <div className="w-full sm:w-[320px] p-5 flex flex-col gap-5">
      {/* Artwork & Details */}
      <div className="flex gap-4 items-center">
        <div className="w-16 h-16 shrink-0 bg-surface-raised border border-border/50 rounded flex items-center justify-center overflow-hidden">
          {track?.artwork ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={track.artwork} alt="Album Art" className="w-full h-full object-cover" />
          ) : (
            <Music2 size={24} className="text-muted/50" />
          )}
        </div>
        
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground truncate" title={track?.title || 'Nothing playing'}>
            {track?.title || 'Nothing playing'}
          </p>
          <p className="text-xs text-muted truncate mt-0.5" title={track?.artist || 'No artist'}>
            {track?.artist || '—'}
          </p>
          {track?.album && (
            <p className="text-[10px] text-muted/60 truncate mt-0.5">
              {track.album}
            </p>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex flex-col gap-1.5">
        <Slider.Root
          className="relative flex items-center select-none touch-none w-full h-4 group"
          value={[value]}
          max={100}
          step={1}
          onValueChange={handleSeek}
          disabled={!hasCatalogue}
          aria-label="Seek time"
        >
          <Slider.Track className="bg-border/40 relative grow rounded-full h-1">
            <Slider.Range className="absolute bg-foreground/70 rounded-full h-full" />
          </Slider.Track>
          <Slider.Thumb
            className="block w-2.5 h-2.5 bg-foreground rounded-full shadow transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:opacity-0 group-hover:opacity-100 data-[disabled]:opacity-0"
            aria-label="Seek time thumb"
          />
        </Slider.Root>
        <div className="flex justify-between text-[10px] text-muted/80 font-mono tracking-wide">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6">
        <button
          onClick={previous}
          disabled={!hasCatalogue}
          aria-label="Previous track"
          className="text-muted hover:text-foreground disabled:opacity-30 transition-colors"
        >
          <SkipBack size={18} fill="currentColor" />
        </button>
        
        <button
          onClick={togglePlay}
          disabled={!hasCatalogue}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-foreground text-background hover:scale-105 transition-transform disabled:opacity-50"
        >
          {isPlaying ? (
            <Pause size={18} fill="currentColor" />
          ) : (
            <Play size={18} fill="currentColor" className="ml-0.5" />
          )}
        </button>
        
        <button
          onClick={next}
          disabled={!hasCatalogue}
          aria-label="Next track"
          className="text-muted hover:text-foreground disabled:opacity-30 transition-colors"
        >
          <SkipForward size={18} fill="currentColor" />
        </button>
      </div>
      
      {/* Up Next Queue */}
      {upNextTracks.length > 0 && (
        <div className="pt-3 border-t border-border/40 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-muted/70 mb-1">
            <MonitorSpeaker size={12} />
            Up Next
          </div>
          {upNextTracks.map(t => (
            <button 
              key={t.id} 
              className="flex items-center gap-3 text-left hover:bg-surface-raised p-1.5 -mx-1.5 rounded transition-colors group"
              onClick={() => playTrack(t.index)}
            >
              <div className="w-8 h-8 shrink-0 bg-border/30 rounded flex items-center justify-center overflow-hidden">
                {t.artwork ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={t.artwork} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <Music2 size={12} className="text-muted/50" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-foreground/90 truncate">{t.title}</p>
                <p className="text-[10px] text-muted truncate">{t.artist}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
