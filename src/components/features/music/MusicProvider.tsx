'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react';
import catalogueData from '../../../content/music/catalogue.json';

export interface NormalizedTrack {
  id: string;
  title: string;
  artist: string;
  album?: string;
  artwork?: string;
  audioSource?: string;
}

type PlaybackIntent = 'idle' | 'playing' | 'paused';

const PAUSED_PLAYBACK_STORAGE_KEY = 'portfolio:music-paused';

function getInitialPlaybackIntent(): PlaybackIntent {
  if (typeof window === 'undefined') return 'idle';

  try {
    return window.sessionStorage.getItem(PAUSED_PLAYBACK_STORAGE_KEY) === 'true'
      ? 'paused'
      : 'idle';
  } catch {
    return 'idle';
  }
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
  const playbackIntentRef = useRef<PlaybackIntent>(getInitialPlaybackIntent());

  const setPlaybackIntent = useCallback((intent: PlaybackIntent) => {
    playbackIntentRef.current = intent;

    if (typeof window === 'undefined') return;

    try {
      if (intent === 'paused') {
        window.sessionStorage.setItem(PAUSED_PLAYBACK_STORAGE_KEY, 'true');
      } else {
        window.sessionStorage.removeItem(PAUSED_PLAYBACK_STORAGE_KEY);
      }
    } catch {
      // Storage is optional; playback still works in restricted browser contexts.
    }
  }, []);

  const setCurrentIndex = useCallback((index: number) => {
    if (currentIndexRef.current !== index) {
      setProgress(0);
      setDuration(0);
    }
    currentIndexRef.current = index;
    setCurrentIndexState(index);
  }, []);

  const isPlayingRef = useRef(false);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loadAndPlayTrackRef = useRef<(index: number, attempt?: number) => void>(
    () => {}
  );

  const retryPlaybackRef = useRef<(() => void) | null>(null);
  const disposeAudioRef = useRef<(() => void) | null>(null);

  const ensureAudio = useCallback(() => {
    if (audioRef.current) return audioRef.current;
    const audio = new Audio();
    audio.preload = 'none';
    audioRef.current = audio;

    const handleTimeUpdate = () => setProgress(audio.currentTime * 1000);
    const handleDurationChange = () => setDuration(audio.duration * 1000 || 0);
    const handleEnded = () => {
      // A paused player must never advance or resume itself.
      if (playbackIntentRef.current === 'playing' && catalogueData.tracks.length > 0) {
        const nextIdx =
          (currentIndexRef.current + 1) % catalogueData.tracks.length;
        loadAndPlayTrackRef.current(nextIdx);
      }
    };
    const handlePlay = () => {
      setPlaybackIntent('playing');
      setIsPlaying(true);
    };
    const handlePause = () => setIsPlaying(false);
    const handleError = () => {
      if (audio.error) retryPlaybackRef.current?.();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    disposeAudioRef.current = () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      retryPlaybackRef.current = null;
      audioRef.current = null;
    };
    return audio;
  }, [setPlaybackIntent]);

  useEffect(() => () => {
    disposeAudioRef.current?.();
    disposeAudioRef.current = null;
  }, []);

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

  const startPlayback = useCallback(
    (audio: HTMLAudioElement, index: number, attempt: number) => {
      setPlaybackIntent('playing');
      const retry = () => {
        if (
          retryPlaybackRef.current !== retry ||
          playbackIntentRef.current !== 'playing'
        ) return;
        retryPlaybackRef.current = null;
        loadAndPlayTrackRef.current(index + 1, attempt + 1);
      };
      retryPlaybackRef.current = retry;
      audio.play().catch(retry);
    },
    [setPlaybackIntent]
  );

  const loadAndPlayTrack = useCallback(
    (index: number, attempt = 0) => {
      if (catalogueData.tracks.length === 0) return;
      if (attempt >= catalogueData.tracks.length) {
        console.warn('All tracks unavailable. Stopping playback.');
        setPlaybackIntent('paused');
        audioRef.current?.pause();
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

      const audio = audioRef.current;
      if (audio && item.audioSource) {
        audio.src = item.audioSource;
        startPlayback(audio, safeIndex, attempt);
      }
    },
    [setCurrentIndex, setPlaybackIntent, startPlayback]
  );

  useEffect(() => {
    loadAndPlayTrackRef.current = loadAndPlayTrack;
  }, [loadAndPlayTrack]);

  const loadTrackOnly = useCallback(
    (index: number) => {
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
    },
    [setCurrentIndex]
  );

  const togglePlay = useCallback(() => {
    if (catalogueData.tracks.length === 0 || !track?.audioSource) return;
    const audio = ensureAudio();
    if (audio.paused) {
      if (!audio.src) audio.src = track.audioSource;
      startPlayback(audio, currentIndexRef.current, 0);
    } else {
      retryPlaybackRef.current = null;
      setPlaybackIntent('paused');
      audio.pause();
    }
  }, [track, ensureAudio, startPlayback, setPlaybackIntent]);

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
    const prevIdx =
      (currentIndexRef.current - 1 + catalogueData.tracks.length) %
      catalogueData.tracks.length;
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

  const playTrack = useCallback(
    (index: number) => {
      if (!catalogueData.tracks[index]?.audioSource) return;
      ensureAudio();
      loadAndPlayTrack(index);
    },
    [ensureAudio, loadAndPlayTrack]
  );

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
