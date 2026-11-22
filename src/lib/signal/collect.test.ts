import { describe, expect, it, vi } from 'vitest';
import { collectSignalCandidates } from './collect';
import type { SignalItem } from './types';

describe('collectSignalCandidates', () => {
  it('limits active sources, keeps registration order, and isolates failures', async () => {
    vi.useFakeTimers();
    let active = 0;
    let peak = 0;
    const adapters = [30, 10, 20, 10, 10, 10].map((delay, index) => ({
      id: String(index),
      tier: 'Curated' as const,
      weight: 1,
      async fetchCandidates(): Promise<SignalItem[]> {
        peak = Math.max(peak, ++active);
        await new Promise<void>((resolve) => setTimeout(resolve, delay));
        active--;
        if (index === 2) throw new Error('Source unavailable');
        return [{
          id: String(index),
          title: 'Painting',
          description: 'Description',
          source: 'Museum',
          category: 'Art',
          slot: 'artwork',
          tier: 'Curated',
        }];
      },
    }));

    try {
      const result = collectSignalCandidates(adapters);
      await vi.advanceTimersByTimeAsync(30);
      expect((await result).map(({ id }) => id)).toEqual(['0', '1', '3', '4', '5']);
      expect(peak).toBe(3);
    } finally {
      vi.useRealTimers();
    }
  });
});
