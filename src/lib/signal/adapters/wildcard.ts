import { SignalSourceAdapter, SignalItem } from '../types';

export class WildcardAdapter implements SignalSourceAdapter {
  id = 'wildcard';
  tier = 'Discovery' as const;
  weight = 0.3;

  async fetchCandidates(): Promise<SignalItem[]> {
    // Deterministic generic fallbacks
    return [
      {
        id: 'wildcard-1',
        title: 'The Internet Archive',
        description: 'A non-profit library of millions of free books, movies, software, music, websites, and more.',
        url: 'https://archive.org/',
        source: 'Wildcard',
        category: 'Archive',
        tier: this.tier,
      },
      {
        id: 'wildcard-2',
        title: 'Project Gutenberg',
        description: 'A library of over 60,000 free eBooks.',
        url: 'https://www.gutenberg.org/',
        source: 'Wildcard',
        category: 'Archive',
        tier: this.tier,
      }
    ];
  }
}
