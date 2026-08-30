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

  it('fails instead of publishing an incomplete daily issue', () => {
    const incomplete = candidates.filter((item) => item.slot !== 'words');
    expect(() => new SignalGenerator().generate(incomplete, config)).toThrow(
      'missing the required words slot'
    );
  });
});
