import { SignalSourceAdapter, SignalItem } from '../types';

type MetSearchResponse = { objectIDs?: number[] };

type MetObject = {
  objectID: number;
  title?: string;
  artistDisplayName?: string;
  artistNationality?: string;
  objectDate?: string;
  isPublicDomain?: boolean;
  primaryImage?: string;
  primaryImageSmall?: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 8_000;

export class MetMuseumAdapter implements SignalSourceAdapter {
  id = 'met-museum';
  tier = 'Curated' as const;
  weight = 0.9;

  async fetchCandidates(): Promise<SignalItem[]> {
    try {
      const searchResponse = await fetch(
        'https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=painting',
        { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) }
      );
      if (!searchResponse.ok) {
        throw new Error(`Met Museum search failed: ${searchResponse.statusText}`);
      }

      const objectIds = ((await searchResponse.json()) as MetSearchResponse).objectIDs ?? [];
      if (objectIds.length === 0) return [];

      const start = Math.floor(Date.now() / DAY_MS) % objectIds.length;
      const ids = Array.from({ length: Math.min(12, objectIds.length) }, (_, index) =>
        objectIds[(start + index * 37) % objectIds.length]
      );

      const objects = await Promise.all(
        ids.map(async (id) => {
          const response = await fetch(
            `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`,
            { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) }
          );
          return response.ok ? ((await response.json()) as MetObject) : null;
        })
      );

      return objects.flatMap((object) => {
        if (!object?.isPublicDomain || !object.title || !object.primaryImageSmall) return [];

        const artist = [object.artistDisplayName, object.artistNationality]
          .filter(Boolean)
          .join(' · ');
        const context = [artist, object.objectDate].filter(Boolean).join(' · ');

        return [{
          id: `met-${object.objectID}`,
          title: object.title,
          description: context || 'A public-domain work from The Metropolitan Museum of Art.',
          url: `https://www.metmuseum.org/art/collection/search/${object.objectID}`,
          source: 'The Metropolitan Museum of Art',
          category: 'Art',
          slot: 'artwork',
          tier: this.tier,
          image: object.primaryImageSmall || object.primaryImage,
        } satisfies SignalItem];
      });
    } catch (error) {
      console.warn('[MetMuseumAdapter] fetch failed:', error);
      return [];
    }
  }
}
