/** @vitest-environment jsdom */
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MusicShell from './MusicShell';

const player = {
  track: {
    id: '1',
    title: 'Arabesque (\u30a2\u30e9\u30d9\u30b9\u30af)',
    artist: 'Satie',
    artwork: '/cover.jpg',
  },
  isPlaying: false,
  isReady: true,
  togglePlay: vi.fn(),
  next: vi.fn(),
};

vi.mock('@/components/features/music/MusicProvider', () => ({
  useMusicPlayer: () => player,
}));

describe('MusicShell', () => {
  afterEach(cleanup);

  beforeEach(() => {
    player.isPlaying = false;
    player.togglePlay.mockClear();
    player.next.mockClear();
  });

  it('renders direct, accessible playback controls without a popover trigger', () => {
    render(<MusicShell />);

    expect(screen.getByRole('button', { name: 'Play music' })).toHaveProperty('disabled', false);
    expect(screen.getByRole('button', { name: 'Next track' })).toHaveProperty('disabled', false);
    expect(screen.queryByRole('button', { name: 'Open music player' })).toBeNull();
  });

  it('invokes the provider controls from the compact player', () => {
    render(<MusicShell />);

    fireEvent.click(screen.getByRole('button', { name: 'Play music' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next track' }));

    expect(player.togglePlay).toHaveBeenCalledOnce();
    expect(player.next).toHaveBeenCalledOnce();
  });

  it('labels the toggle as pause during playback', () => {
    player.isPlaying = true;
    render(<MusicShell />);

    expect(screen.getByRole('button', { name: 'Pause music' })).toHaveProperty('disabled', false);
  });
});
