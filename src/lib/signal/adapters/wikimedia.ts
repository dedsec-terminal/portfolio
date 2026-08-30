import { SignalSourceAdapter, SignalItem } from '../types';
import { getSignalDate } from '../runtime';

export class WikimediaAdapter implements SignalSourceAdapter {
  id = 'wikimedia';
  tier = 'Discovery' as const;
  weight = 0.6;

  async fetchCandidates(): Promise<SignalItem[]> {
    try {
      const [yyyy, mm, dd] = getSignalDate().split('-');
      const response = await fetch(
        `https://en.wikipedia.org/api/rest_v1/feed/featured/${yyyy}/${mm}/${dd}`,
        { headers: { 'Accept': 'application/json' } }
      );

      if (!response.ok) {
        throw new Error(`Wikimedia API failed: ${response.statusText}`);
      }

      const data = await response.json();
      const candidates: SignalItem[] = [];

      // Add featured article
      if (data.tfa) {
        candidates.push({
          id: `wiki-tfa-${data.tfa.pageid}`,
          title: data.tfa.titles?.normalized || data.tfa.title,
          description: data.tfa.extract || 'Featured Wikipedia Article',
          url: data.tfa.content_urls?.desktop?.page,
          source: 'Wikipedia',
          category: 'Article',
          slot: 'frontier',
          tier: this.tier,
          image: data.tfa.thumbnail?.source,
        });
      }

      return candidates;
    } catch (error) {
      console.warn('[WikimediaAdapter] fetch failed:', error);
      return [];
    }
  }
}
