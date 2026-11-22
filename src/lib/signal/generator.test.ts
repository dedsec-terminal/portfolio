import { describe, expect, it } from 'vitest';
import { SignalGenerator } from './generator';
import { SIGNAL_SLOTS, type SignalItem, type SignalSlot } from './types';

function candidate(slot: SignalSlot, index: number): SignalItem {
  return {
    id: `${slot}-${index}`,
    title: `${slot} ${index}`,
    description: `A grounded description for ${slot} ${index}.`,
    source: `Source ${index}`,
    category: slot,
    slot,
    tier: index % 2 === 0 ? 'Curated' : 'Discovery',
  };
}

const candidates = SIGNAL_SLOTS.flatMap((slot) => [candidate(slot, 1), candidate(slot, 2)]);
const config = {
  date: '2026-08-30',
  generatorVersion: 'v2.0.0',
  historicalIds: [],
};

describe('SignalGenerator v2', () => {
  it('generates identical output for identical inputs', () => {
    const generator = new SignalGenerator();
    expect(generator.generate(candidates, config)).toEqual(generator.generate(candidates, config));
  });

  it('always emits exactly one item for every editorial slot', () => {
    const day = new SignalGenerator().generate(candidates, config);

    expect(day.nodes).toHaveLength(SIGNAL_SLOTS.length);
    expect(day.nodes.map((node) => node.slot)).toEqual(SIGNAL_SLOTS);
  });

  it('applies the cooldown independently within every slot', () => {
    const generator = new SignalGenerator();
    const shortlist = generator.shortlist(candidates, {
      ...config,
      historicalIds: SIGNAL_SLOTS.map((slot) => `${slot}-1`),
    });

    expect(shortlist.map((item) => item.id)).toEqual(
      SIGNAL_SLOTS.map((slot) => `${slot}-2`)
    );
  });

  it('relaxes cooldown only for a slot with no fresh candidate', () => {
    const generator = new SignalGenerator();
    const shortlist = generator.shortlist(
      SIGNAL_SLOTS.map((slot) => candidate(slot, 1)),
      { ...config, historicalIds: SIGNAL_SLOTS.map((slot) => `${slot}-1`) }
    );

    expect(shortlist).toHaveLength(SIGNAL_SLOTS.length);
  });

  it('removes duplicate IDs from a shortlist', () => {
    const shortlist = new SignalGenerator().shortlist([...candidates, ...candidates], config);
    expect(new Set(shortlist.map((item) => item.id)).size).toBe(shortlist.length);
  });

  it('prefers fresh frontier reporting and downranks repeated topics', () => {
    const older = { ...candidate('frontier', 1), title: 'AI news', timestamp: '2026-07-04' };
    const repeated = { ...candidate('frontier', 2), title: 'AI news', timestamp: '2026-08-30', topicKey: 'repeat' };
    const fresh = { ...candidate('frontier', 3), title: 'AI news', timestamp: '2026-08-29', topicKey: 'fresh' };
    const shortlist = new SignalGenerator().shortlist([older, repeated, fresh], {
      ...config,
      historicalTopicKeys: ['repeat'],
    });
    expect(shortlist[0].id).toBe(fresh.id);
  });

  it('excludes recently featured Watch titles across providers and includes several formats', () => {
    const entries = [
      { ...candidate('screen', 1), title: 'Café!' },
      { ...candidate('screen', 2), title: 'Cafe (2025)' },
      { ...candidate('screen', 3), title: 'City of Gold', category: 'Documentary' },
      { ...candidate('screen', 4), title: 'City of Gold!', category: 'Documentary' },
      { ...candidate('screen', 5), title: 'Unfolding the Universe with Webb', category: 'YouTube video' },
      { ...candidate('screen', 6), title: 'PlayTime', category: 'Film' },
    ];
    const shortlist = new SignalGenerator().shortlist(entries, {
      ...config,
      historicalWatchTitles: ['Cafe'],
    }, 3);
    expect(shortlist.map((item) => item.category).sort()).toEqual(['Documentary', 'Film', 'YouTube video']);
    expect(shortlist.some((item) => item.id === 'screen-1' || item.id === 'screen-2')).toBe(false);
  });

  it('changes the Watch format between editions when a fresh alternative exists', () => {
    const film = { ...candidate('screen', 1), category: 'Film' };
    const video = { ...candidate('screen', 2), category: 'YouTube video' };
    const generator = new SignalGenerator();
    const edition = { ...config, lastWatchFormat: 'Film' };
    expect(generator.shortlist([film, video], edition)).toEqual([video]);
    expect(generator.shortlist([film], edition)).toEqual([film]);
  });

  it('reuses the least recently shown Watch title if every work is on cooldown', () => {
    const recent = { ...candidate('screen', 1), title: 'Recent' };
    const older = { ...candidate('screen', 2), title: 'Older' };
    expect(new SignalGenerator().shortlist([recent, older], {
      ...config,
      historicalWatchTitles: ['Recent', 'Older', 'Recent'],
      historicalIds: [older.id],
    })).toEqual([older]);
  });

  it('fails instead of publishing an incomplete daily issue', () => {
    const incomplete = candidates.filter((item) => item.slot !== 'words');
    expect(() => new SignalGenerator().generate(incomplete, config)).toThrow(
      'missing the required words slot'
    );
  });
});
