import fs from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PersonalCatalogueAdapter } from './personal';

afterEach(() => vi.restoreAllMocks());

describe('Personal catalogue publication', () => {
  it('excludes sample entries from future editions while retaining real editorial selections', async () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify([
      { id: 'sample', title: '[SAMPLE] Example film' },
      { id: 'real', title: 'An editorial selection' },
    ]));
    const candidates = await new PersonalCatalogueAdapter().fetchCandidates();
    expect(candidates).toHaveLength(4);
    expect(candidates.every((item) => item.id === 'real')).toBe(true);
    expect(candidates.map((item) => item.slot)).toEqual(['screen', 'words', 'website', 'reading']);
  });

  it('returns no personal candidates for an entirely sample catalogue', async () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify([
      { id: 'sample', title: '[SAMPLE] Example' },
    ]));
    expect(await new PersonalCatalogueAdapter().fetchCandidates()).toEqual([]);
  });
});
