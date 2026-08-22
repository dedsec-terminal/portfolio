/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, act, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MusicProvider, useMusicPlayer } from './MusicProvider';

// Mock catalogue data
vi.mock('../../../content/music/catalogue.json', () => ({
  default: {
    tracks: [
      { id: '1', title: 'Track A', artist: 'Artist A', audioSource: 'a.mp3' },
      { id: '2', title: 'Track B', artist: 'Artist B', audioSource: 'b.mp3' },
      { id: '3', title: 'Track C', artist: 'Artist C', audioSource: 'c.flac' },
    ],
  },
}));

// Mock Audio
class MockAudio {
  src: string = '';
  currentTime: number = 0;
  duration: number = 100;
  paused: boolean = true;
  autoplay: boolean = false;

  listeners: Record<string, Array<(...args: unknown[]) => void>> = {};

  addEventListener(event: string, cb: (...args: unknown[]) => void) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(cb);
  }

  removeEventListener(event: string, cb: (...args: unknown[]) => void) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter((l) => l !== cb);
    }
  }

  dispatchEvent(event: string, ...args: unknown[]) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((cb) => cb(...args));
    }
  }

  async play() {
    this.paused = false;
    this.dispatchEvent('play');
    return Promise.resolve();
  }

  pause() {
    this.paused = true;
    this.dispatchEvent('pause');
  }
}

describe('MusicProvider', () => {
  let mockAudioInstance: MockAudio;

  beforeEach(() => {
    mockAudioInstance = new MockAudio();
    vi.stubGlobal('Audio', function () {
      return mockAudioInstance;
    });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  const TestComponent = () => {
    const player = useMusicPlayer();
    return (
      <div>
        <div data-testid="title">{player.track?.title}</div>
        <div data-testid="is-playing">{String(player.isPlaying)}</div>
        <div data-testid="current-index">{player.currentIndex}</div>
        <button data-testid="play" onClick={player.togglePlay}>
          Play
        </button>
        <button data-testid="next" onClick={player.next}>
          Next
        </button>
        <button data-testid="prev" onClick={player.previous}>
          Prev
        </button>
        <button data-testid="select" onClick={() => player.playTrack(1)}>
          Select Track B
        </button>
      </div>
    );
  };

  it('1/15. initial render NEVER invokes playback, starts stopped', () => {
    render(
      <MusicProvider>
        <TestComponent />
      </MusicProvider>
    );
    expect(screen.getByTestId('title').textContent).toBe('Track A');
    expect(screen.getByTestId('is-playing').textContent).toBe('false');
    expect(screen.getByTestId('current-index').textContent).toBe('0');
    expect(mockAudioInstance.paused).toBe(true);
  });

  it('3/4. explicit Play and Pause', async () => {
    render(
      <MusicProvider>
        <TestComponent />
      </MusicProvider>
    );

    await act(async () => {
      screen.getByTestId('play').click();
    });

    expect(screen.getByTestId('is-playing').textContent).toBe('true');
    expect(mockAudioInstance.paused).toBe(false);

    await act(async () => {
      screen.getByTestId('play').click();
    });

    expect(screen.getByTestId('is-playing').textContent).toBe('false');
    expect(mockAudioInstance.paused).toBe(true);
  });

  it('5/6/7/8. Next while paused -> next track remains paused', async () => {
    render(
      <MusicProvider>
        <TestComponent />
      </MusicProvider>
    );

    await act(async () => {
      screen.getByTestId('next').click();
    });

    expect(screen.getByTestId('title').textContent).toBe('Track B');
    expect(screen.getByTestId('is-playing').textContent).toBe('false');
  });

  it('5. Next while playing -> next track plays', async () => {
    render(
      <MusicProvider>
        <TestComponent />
      </MusicProvider>
    );

    await act(async () => {
      screen.getByTestId('play').click();
    });

    await act(async () => {
      screen.getByTestId('next').click();
    });

    expect(screen.getByTestId('title').textContent).toBe('Track B');
    expect(screen.getByTestId('is-playing').textContent).toBe('true');
  });

  it('3. Next on final track -> first track (wrapping)', async () => {
    render(
      <MusicProvider>
        <TestComponent />
      </MusicProvider>
    );

    await act(async () => {
      screen.getByTestId('next').click(); // to B
      screen.getByTestId('next').click(); // to C
    });

    expect(screen.getByTestId('title').textContent).toBe('Track C');

    await act(async () => {
      screen.getByTestId('next').click(); // to A
    });

    expect(screen.getByTestId('title').textContent).toBe('Track A');
  });

  it('4. Previous on first track -> final track (wrapping)', async () => {
    render(
      <MusicProvider>
        <TestComponent />
      </MusicProvider>
    );

    await act(async () => {
      screen.getByTestId('prev').click(); // from A to C
    });

    expect(screen.getByTestId('title').textContent).toBe('Track C');
  });

  it('9. manual queue selection', async () => {
    render(
      <MusicProvider>
        <TestComponent />
      </MusicProvider>
    );

    await act(async () => {
      screen.getByTestId('select').click();
    });

    expect(screen.getByTestId('title').textContent).toBe('Track B');
  });

  it('1. middle track ends -> next track', async () => {
    render(
      <MusicProvider>
        <TestComponent />
      </MusicProvider>
    );

    await act(async () => {
      mockAudioInstance.dispatchEvent('ended');
    });

    expect(screen.getByTestId('title').textContent).toBe('Track B');
  });

  it('2. final track ends -> first track', async () => {
    render(
      <MusicProvider>
        <TestComponent />
      </MusicProvider>
    );

    await act(async () => {
      mockAudioInstance.dispatchEvent('ended'); // B
      mockAudioInstance.dispatchEvent('ended'); // C
      mockAudioInstance.dispatchEvent('ended'); // A
    });

    expect(screen.getByTestId('title').textContent).toBe('Track A');
  });

  it('10. broken track does not crash provider, skips to next', async () => {
    render(
      <MusicProvider>
        <TestComponent />
      </MusicProvider>
    );

    await act(async () => {
      screen.getByTestId('play').click();
    });

    // Mock an error during playback
    await act(async () => {
      mockAudioInstance.dispatchEvent('error');
    });

    // It should skip to B and try to play
    expect(screen.getByTestId('title').textContent).toBe('Track B');
    // We mocked a sync play resolution, so isPlaying is likely true immediately
  });
});
