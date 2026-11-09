import { describe, expect, it } from 'vitest';
import { recoverArtworkCandidates } from './recovery';
import { SignalGenerator } from './generator';
import { SIGNAL_SLOTS, type SignalItem } from './types';

const history: SignalItem[] = SIGNAL_SLOTS.map((slot) => ({
  id: `saved-${slot}`,
  slot,
  title: slot,
  description: 'Previously validated source entry.',
  source: 'Museum',
  category: slot,
  tier: 'Curated',
}));

describe('artwork source outage recovery', () => {
  it('completes generation when the museum returns no candidates', () => {
    const live = history.filter((item) => item.slot !== 'artwork');
    const recovered = recoverArtworkCandidates(live, history);
    expect(
      new SignalGenerator().generate(recovered, {
        date: '2026-11-10',
        generatorVersion: 'test',
        historicalIds: [],
      }).nodes
    ).toHaveLength(SIGNAL_SLOTS.length);
    expect(recovered.find((item) => item.slot === 'artwork')).toBe(
      history.find((item) => item.slot === 'artwork')
    );
  });

  it('prefers live artwork and does not mutate the live pool', () => {
    expect(recoverArtworkCandidates(history, history)).toBe(history);
  });

  it('does not recycle news or invent artwork when history is absent', () => {
    expect(recoverArtworkCandidates([], history)).toEqual(
      history.filter((item) => item.slot === 'artwork')
    );
    expect(recoverArtworkCandidates([], [])).toEqual([]);
  });
});
