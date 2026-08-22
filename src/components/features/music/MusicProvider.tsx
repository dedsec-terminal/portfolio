'use client';

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import catalogueData from '../../../content/music/catalogue.json';

export interface NormalizedTrack {
  id: string;
  title: string;
  artist: string;
  album?: string;
  artwork?: string;
  audioSource?: string;
}

interface MusicContextType {
  track: NormalizedTrack | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  isReady: boolean;
  canSeek: boolean;
  currentIndex: number;

  togglePlay: () => void;
  seek: (ms: number) => void;
  next: () => void;
  previous: () => void;
  playTrack: (index: number) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [track, setTrack] = useState<NormalizedTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [currentIndexState, setCurrentIndexState] = useState(-1);
  const currentIndexRef = useRef(-1);

  const setCurrentIndex = useCallback((index: number) => {
    currentIndexRef.current = index;
    setCurrentIndexState(index);
  }, []);

  const isPlayingRef = useRef(false);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize the first track if catalogue is not empty
  useEffect(() => {
    if (catalogueData.tracks.length > 0 && currentIndexRef.current === -1) {
      const first = catalogueData.tracks[0];
      setTrack({
        id: first.id,
        title: first.title,
        artist: first.artist,
        album: first.album,
        artwork: first.artwork,
        audioSource: first.audioSource,
      });
      setCurrentIndex(0);
      setIsReady(true);
    }
  }, [setCurrentIndex]);

  const loadAndPlayTrack = useCallback((index: number, attempt = 0) => {
    if (catalogueData.tracks.length === 0) return;
    if (attempt >= catalogueData.tracks.length) {
      console.warn("All tracks unavailable. Stopping playback.");
      setIsPlaying(false);
      return;
    }

    const safeIndex = index % catalogueData.tracks.length;
    const item = catalogueData.tracks[safeIndex];

    setCurrentIndex(safeIndex);
    setTrack({
      id: item.id,
      title: item.title,
      artist: item.artist,
      album: item.album,
      artwork: item.artwork,
      audioSource: item.audioSource,
    });
    setIsReady(true);

    if (audioRef.current && item.audioSource) {
      audioRef.current.src = item.audioSource;
      
      // We only attempt to play if it was already playing, OR if it's explicitly starting
      // But actually loadAndPlayTrack is used when we explicitly want to play.
      audioRef.current.play().catch((err) => {
        console.error("Playback failed for", item.title, err);
        // Skip to next track on failure
        loadAndPlayTrack(safeIndex + 1, attempt + 1);
      });
    }
  }, [setCurrentIndex]);

  const loadTrackOnly = useCallback((index: number) => {
    if (catalogueData.tracks.length === 0) return;
    const safeIndex = index % catalogueData.tracks.length;
    const item = catalogueData.tracks[safeIndex];

    setCurrentIndex(safeIndex);
    setTrack({
      id: item.id,
      title: item.title,
      artist: item.artist,
      album: item.album,
      artwork: item.artwork,
      audioSource: item.audioSource,
    });
    if (audioRef.current && item.audioSource) {
      audioRef.current.src = item.audioSource;
    }
  }, [setCurrentIndex]);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const handleTimeUpdate = () => setProgress(audio.currentTime * 1000);
    const handleDurationChange = () => setDuration(audio.duration * 1000 || 0);
    const handleEnded = () => {
      // Loop the catalogue automatically when a track naturally ends
      if (catalogueData.tracks.length > 0) {
        const nextIdx = (currentIndexRef.current + 1) % catalogueData.tracks.length;
        loadAndPlayTrack(nextIdx);
      }
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = () => {
      console.error("Audio playback error encountered.");
      // Skip to next track on failure if it was currently trying to play
      if (isPlayingRef.current || audioRef.current?.autoplay) {
        const nextIdx = (currentIndexRef.current + 1) % catalogueData.tracks.length;
        loadAndPlayTrack(nextIdx, 1);
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, [loadAndPlayTrack]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || catalogueData.tracks.length === 0) return;
    if (audioRef.current.paused) {
      // Ensure source is set if it was never loaded
      if (!audioRef.current.src && track?.audioSource) {
        audioRef.current.src = track.audioSource;
      }
      audioRef.current.play().catch((err) => {
        console.error("Playback failed on toggle:", err);
        // If the current track fails on toggle, skip to the next valid one
        loadAndPlayTrack((currentIndexRef.current + 1) % catalogueData.tracks.length, 1);
      });
    } else {
      audioRef.current.pause();
    }
  }, [track, loadAndPlayTrack]);

  const next = useCallback(() => {
    if (catalogueData.tracks.length === 0) return;
    const nextIdx = (currentIndexRef.current + 1) % catalogueData.tracks.length;
    if (isPlayingRef.current) {
      loadAndPlayTrack(nextIdx);
    } else {
      loadTrackOnly(nextIdx);
    }
  }, [loadAndPlayTrack, loadTrackOnly]);

  const previous = useCallback(() => {
    if (catalogueData.tracks.length === 0) return;
    const prevIdx = (currentIndexRef.current - 1 + catalogueData.tracks.length) % catalogueData.tracks.length;
    if (isPlayingRef.current) {
      loadAndPlayTrack(prevIdx);
    } else {
      loadTrackOnly(prevIdx);
    }
  }, [loadAndPlayTrack, loadTrackOnly]);

  const seek = useCallback((ms: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = ms / 1000;
      setProgress(ms);
    }
  }, []);

  const playTrack = useCallback((index: number) => {
    // Used by manual queue selection
    loadAndPlayTrack(index);
  }, [loadAndPlayTrack]);

  const contextValue: MusicContextType = {
    track,
    isPlaying,
    progress,
    duration,
    isReady,
    canSeek: true,
    currentIndex: currentIndexState,
    togglePlay,
    seek,
    next,
    previous,
    playTrack,
  };

  return (
    <MusicContext.Provider value={contextValue}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusicPlayer() {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusicPlayer must be used within a MusicProvider');
  }
  return context;
}
