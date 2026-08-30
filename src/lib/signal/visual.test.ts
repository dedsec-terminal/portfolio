import { describe, expect, it } from 'vitest';
import { SIGNAL_GRID, SIGNAL_LAYOUTS, rectanglesIntersect } from './visual';
import { SIGNAL_SLOTS } from './types';

describe('Signal desktop layout grammars', () => {
  it('maps every canonical slot to a distinct, in-bounds rectangle', () => {
    expect(SIGNAL_LAYOUTS).toHaveLength(6);

    for (const grammar of SIGNAL_LAYOUTS) {
      expect(grammar.slots).toHaveLength(SIGNAL_SLOTS.length);
      expect(grammar.slots.map((slot) => slot.slot)).toEqual(SIGNAL_SLOTS);

      for (const slot of grammar.slots) {
        expect(slot.x).toBeGreaterThanOrEqual(1);
        expect(slot.y).toBeGreaterThanOrEqual(1);
        expect(slot.x + slot.w - 1).toBeLessThanOrEqual(SIGNAL_GRID.columns);
        expect(slot.y + slot.h - 1).toBeLessThanOrEqual(SIGNAL_GRID.rows);
        expect(Math.abs(slot.rotation)).toBeLessThanOrEqual(0.3);
      }

      for (let left = 0; left < grammar.slots.length; left += 1) {
        for (let right = left + 1; right < grammar.slots.length; right += 1) {
          expect(rectanglesIntersect(grammar.slots[left], grammar.slots[right])).toBe(false);
        }
      }

      const artwork = grammar.slots.find((slot) => slot.slot === 'artwork')!;
      const words = grammar.slots.find((slot) => slot.slot === 'words')!;
      expect(rectanglesIntersect(artwork, words)).toBe(false);
      expect(artwork.rotation).toBe(0);
      expect(words.rotation).toBe(0);
    }
  });
});
