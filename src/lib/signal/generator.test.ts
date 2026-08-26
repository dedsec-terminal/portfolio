import { describe, it, expect } from 'vitest';
import { SignalGenerator } from './generator';
import { SignalItem } from './types';

describe('SignalGenerator', () => {
  const dummyCandidates: SignalItem[] = [
    { id: '1', title: 'A', description: 'Desc A', source: 'S', category: 'C1', tier: 'Personal' },
    { id: '2', title: 'B', description: 'Desc B', source: 'S', category: 'C2', tier: 'Discovery' },
    { id: '3', title: 'C', description: 'Desc C', source: 'S', category: 'C3', tier: 'Curated' },
    { id: '4', title: 'D', description: 'Desc D', source: 'S', category: 'C1', tier: 'Personal' },
    { id: '5', title: 'E', description: 'Desc E', source: 'S', category: 'C2', tier: 'Discovery' },
    { id: '6', title: 'F', description: 'Desc F', source: 'S', category: 'C3', tier: 'Curated' },
  ];

  it('generates identical output for identical inputs', () => {
    const generator = new SignalGenerator();
    const config = {
      date: '2026-08-22',
      generatorVersion: 'v1',
      targetCount: 3,
      historicalIds: [],
    };

    const run1 = generator.generate(dummyCandidates, config);
    const run2 = generator.generate(dummyCandidates, config);

    expect(run1).toEqual(run2);
  });

  it('generates different output for different dates', () => {
    const generator = new SignalGenerator();
    const run1 = generator.generate(dummyCandidates, { date: '2026-08-22', generatorVersion: 'v1', targetCount: 3, historicalIds: [] });
    const run2 = generator.generate(dummyCandidates, { date: '2026-08-23', generatorVersion: 'v1', targetCount: 3, historicalIds: [] });

    expect(run1).not.toEqual(run2);
  });

  it('respects cooldown and historical IDs', () => {
    const generator = new SignalGenerator();
    const config = {
      date: '2026-08-22',
      generatorVersion: 'v1',
      targetCount: 3,
      historicalIds: ['1', '2', '3'],
    };

    const run = generator.generate(dummyCandidates, config);
    const selectedIds = run.nodes.map(n => n.id);
    
    // Should select from 4, 5, 6
    expect(selectedIds).not.toContain('1');
    expect(selectedIds).not.toContain('2');
    expect(selectedIds).not.toContain('3');
  });

  it('relaxes cooldown gracefully if candidate pool is too small', () => {
    const generator = new SignalGenerator();
    const config = {
      date: '2026-08-22',
      generatorVersion: 'v1',
      targetCount: 5,
      // all but 1 are in history
      historicalIds: ['1', '2', '3', '4', '5'],
    };

    const run = generator.generate(dummyCandidates, config);
    expect(run.nodes.length).toBe(5);
    // Should include items from history because it had to relax
  });

  it('removes exact duplicate IDs before selection', () => {
    const generator = new SignalGenerator();
    const duplicates = [...dummyCandidates, ...dummyCandidates];
    const config = {
      date: '2026-08-22',
      generatorVersion: 'v1',
      targetCount: 6,
      historicalIds: [],
    };

    const run = generator.generate(duplicates, config);
    const selectedIds = run.nodes.map(n => n.id);
    const uniqueIds = new Set(selectedIds);
    expect(selectedIds.length).toBe(uniqueIds.size);
  });

  it('keeps the daily mix visually grounded and source-diverse when possible', () => {
    const candidates: SignalItem[] = [
      { id: 'art', title: 'Art', description: 'A work of art', source: 'Gallery', category: 'Art', tier: 'Personal', image: 'https://example.com/art.jpg' },
      { id: 'book', title: 'Book', description: 'A book', source: 'Library', category: 'Book', tier: 'Curated', image: 'https://example.com/book.jpg' },
      { id: 'news', title: 'News', description: 'A story', source: 'News', category: 'Tech', tier: 'Discovery' },
      { id: 'anime', title: 'Anime', description: 'A show', source: 'AniList', category: 'Anime', tier: 'Curated', image: 'https://example.com/anime.jpg' },
    ];

    const day = new SignalGenerator().generate(candidates, {
      date: '2026-08-26',
      generatorVersion: 'v1.1.0',
      targetCount: 3,
      historicalIds: [],
    });

    expect(day.nodes.some((node) => node.category === 'Art' || node.category === 'Book' || node.category === 'Anime')).toBe(true);
    expect(new Set(day.nodes.map((node) => node.source)).size).toBeGreaterThan(1);
  });

  it('does not select two candidates that share a topic key', () => {
    const candidates: SignalItem[] = [
      { id: 'glm-1', title: 'GLM 5.3 Flash', description: 'First story', source: 'Hacker News', category: 'Tech', tier: 'Discovery', topicKey: 'glm 5 3' },
      { id: 'glm-2', title: 'GLM 5.3 Flash analysis', description: 'Second story', source: 'Hacker News', category: 'Tech', tier: 'Discovery', topicKey: 'glm 5 3' },
      { id: 'book', title: 'Book', description: 'A book', source: 'Library', category: 'Book', tier: 'Curated', image: 'https://example.com/book.jpg' },
      { id: 'news', title: 'News', description: 'A story', source: 'News', category: 'Tech', tier: 'Discovery' },
    ];

    const day = new SignalGenerator().generate(candidates, {
      date: '2026-08-26',
      generatorVersion: 'v1.1.0',
      targetCount: 3,
      historicalIds: [],
    });

    expect(day.nodes.filter((node) => node.topicKey === 'glm 5 3')).toHaveLength(1);
  });
});
