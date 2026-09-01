import { SignalSourceAdapter, SignalItem } from '../types';

type MetSearchResponse = { objectIDs?: number[] };

export type MetObject = {
  objectID: number;
  title?: string;
  artistDisplayName?: string;
  artistNationality?: string;
  objectDate?: string;
  isPublicDomain?: boolean;
  primaryImage?: string;
  primaryImageSmall?: string;
  objectName?: string;
  classification?: string;
  medium?: string;
  department?: string;
  period?: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 8_000;
const MAX_OBJECT_IDS = 36;
const REQUEST_BATCH_SIZE = 6;

const PAINTING_MARKER = /\bpaintings?\b/i;
const PHYSICAL_OBJECT_MARKERS =
  /\b(bowl|cup|dish|plate|tile|vessel|fragment|ceramic|earthenware|porcelain|glass|textile|furniture|weapon|sculpture|statue|coin|medal|jewelry|manuscript|print|drawing|photograph)\b/i;

/**
 * The Met's broad search endpoint includes objects that merely mention paintings.
 * Signal's artwork slot is deliberately narrower: a public-domain work catalogued
 * by the museum as a painting, never a decorative or archaeological object.
 */
export function isEligibleMetPainting(
  object: MetObject | null | undefined
): object is MetObject {
  if (
    !object?.isPublicDomain ||
    !object.title ||
    !(object.primaryImageSmall || object.primaryImage)
  ) {
    return false;
  }

  const paintingFields = [object.objectName, object.classification]
    .filter(Boolean)
    .join(' ');
  const physicalObjectFields = [
    object.objectName,
    object.classification,
    object.medium,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    PAINTING_MARKER.test(paintingFields) &&
    !PHYSICAL_OBJECT_MARKERS.test(physicalObjectFields)
  );
}

async function fetchMetObject(id: number): Promise<MetObject | null> {
  try {
    const response = await fetch(
      `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`,
      { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) }
    );
    return response.ok ? ((await response.json()) as MetObject) : null;
  } catch {
    return null;
  }
}

export class MetMuseumAdapter implements SignalSourceAdapter {
  id = 'met-museum';
  tier = 'Curated' as const;
  weight = 0.9;

  async fetchCandidates(): Promise<SignalItem[]> {
    try {
      const searchResponse = await fetch(
        // Department 11 is the Met's European Paintings collection. Searching it
        // avoids the unrelated decorative objects returned by a collection-wide
        // keyword search while retaining Renaissance, historical, mythological,
        // Romantic, and later paintings.
        'https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&departmentId=11&q=painting',
        { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) }
      );
      if (!searchResponse.ok) {
        throw new Error(
          `Met Museum search failed: ${searchResponse.statusText}`
        );
      }

      const objectIds =
        ((await searchResponse.json()) as MetSearchResponse).objectIDs ?? [];
      if (objectIds.length === 0) return [];

      const start = Math.floor(Date.now() / DAY_MS) % objectIds.length;
      const ids = Array.from(
        { length: Math.min(MAX_OBJECT_IDS, objectIds.length) },
        (_, index) => objectIds[(start + index * 37) % objectIds.length]
      );

      const objects: MetObject[] = [];
      for (let offset = 0; offset < ids.length; offset += REQUEST_BATCH_SIZE) {
        const batch = await Promise.all(
          ids.slice(offset, offset + REQUEST_BATCH_SIZE).map(fetchMetObject)
        );
        objects.push(
          ...batch.filter((object): object is MetObject => object !== null)
        );
      }

      return objects.flatMap((object) => {
        if (!isEligibleMetPainting(object)) return [];

        const artist = [object.artistDisplayName, object.artistNationality]
          .filter(Boolean)
          .join(' · ');
        const context = [artist, object.objectDate, object.period]
          .filter(Boolean)
          .join(' · ');

        return [
          {
            id: `met-${object.objectID}`,
            title: object.title!,
            description:
              context ||
              'A public-domain work from The Metropolitan Museum of Art.',
            url: `https://www.metmuseum.org/art/collection/search/${object.objectID}`,
            source: 'The Metropolitan Museum of Art',
            category: 'Art',
            slot: 'artwork',
            tier: this.tier,
            image: object.primaryImageSmall ?? object.primaryImage!,
          } satisfies SignalItem,
        ];
      });
    } catch (error) {
      console.warn('[MetMuseumAdapter] fetch failed:', error);
      return [];
    }
  }
}
