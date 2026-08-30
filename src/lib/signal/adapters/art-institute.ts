import { SignalSourceAdapter, SignalItem } from '../types';

type Artwork = {
  id: number;
  title?: string;
  artist_display?: string;
  date_display?: string;
  image_id?: string;
};

type ArtInstituteResponse = {
  data?: Artwork[];
  config?: { iiif_url?: string };
};

export class ArtInstituteAdapter implements SignalSourceAdapter {
  id = 'art-institute-chicago';
  tier = 'Curated' as const;
  weight = 0.9;

  async fetchCandidates(): Promise<SignalItem[]> {
    try {
      const response = await fetch(
        'https://api.artic.edu/api/v1/artworks/search?query[term][is_public_domain]=true&limit=24&fields=id,title,artist_display,date_display,image_id'
      );
      if (!response.ok) {
        throw new Error(`Art Institute API failed: ${response.statusText}`);
      }

      const payload = (await response.json()) as ArtInstituteResponse;
      const iiifUrl = payload.config?.iiif_url ?? 'https://www.artic.edu/iiif/2';

      return (payload.data ?? [])
        .filter((artwork) => artwork.image_id && artwork.title)
        .map((artwork) => {
          const context = [artwork.artist_display, artwork.date_display]
            .filter(Boolean)
            .join(' · ');

          return {
            id: `artic-${artwork.id}`,
            title: artwork.title ?? 'Untitled artwork',
            description: context || 'A public-domain work from the Art Institute of Chicago collection.',
            url: `https://www.artic.edu/artworks/${artwork.id}`,
            source: 'Art Institute of Chicago',
            category: 'Art',
            slot: 'artwork',
            tier: this.tier,
            image: `${iiifUrl}/${artwork.image_id}/full/843,/0/default.jpg`,
          } satisfies SignalItem;
        });
    } catch (error) {
      console.warn('[ArtInstituteAdapter] fetch failed:', error);
      return [];
    }
  }
}
