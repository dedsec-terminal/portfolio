import { SignalSourceAdapter, SignalItem } from '../types';

type OpenLibraryWork = {
  key: string;
  title: string;
  cover_i?: number;
  author_name?: string[];
};

type OpenLibraryResponse = { works?: OpenLibraryWork[] };

export class OpenLibraryAdapter implements SignalSourceAdapter {
  id = 'openlibrary';
  tier = 'Curated' as const;
  weight = 0.5;

  async fetchCandidates(): Promise<SignalItem[]> {
    try {
      // Fetch some trending books
      const response = await fetch('https://openlibrary.org/trending/daily.json?limit=10');
      if (!response.ok) throw new Error(`OpenLibrary API failed: ${response.statusText}`);
      
      const data = (await response.json()) as OpenLibraryResponse;
      const works = data.works ?? [];
      
      return works.map((work) => {
        const coverUrl = work.cover_i ? `https://covers.openlibrary.org/b/id/${work.cover_i}-L.jpg` : undefined;
        return {
          id: `openlibrary-${work.key}`,
          title: work.title,
          description: work.author_name?.length ? `By ${work.author_name.join(', ')}` : 'Trending Book',
          url: `https://openlibrary.org${work.key}`,
          source: 'Open Library',
          category: 'Book',
          slot: 'reading',
          tier: this.tier,
          image: coverUrl,
        };
      });
    } catch (error) {
      console.warn('[OpenLibraryAdapter] fetch failed:', error);
      return [];
    }
  }
}
