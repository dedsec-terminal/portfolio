import { SignalSourceAdapter, SignalItem } from '../types';

type AniListMedia = {
  id: number;
  title: { romaji?: string; english?: string };
  description?: string;
  siteUrl?: string;
  coverImage?: { large?: string };
};

type AniListResponse = { data?: { Page?: { media?: AniListMedia[] } } };

export class AnilistAdapter implements SignalSourceAdapter {
  id = 'anilist';
  tier = 'Curated' as const;
  weight = 0.5;

  async fetchCandidates(): Promise<SignalItem[]> {
    const query = `
      query {
        Page(page: 1, perPage: 10) {
          media(sort: POPULARITY_DESC, type: ANIME, isAdult: false) {
            id
            title {
              romaji
              english
            }
            description
            siteUrl
            coverImage {
              large
            }
          }
        }
      }
    `;

    try {
      const response = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`AniList API failed: ${response.statusText}`);
      }

      const data = (await response.json()) as AniListResponse;
      const media = data.data?.Page?.media ?? [];

      return media.map((item) => ({
        id: `anilist-${item.id}`,
        title:
          item.title.english ?? item.title.romaji ?? 'Untitled AniList entry',
        description: (item.description || '').replace(/<[^>]*>?/gm, ''), // strip html
        url: item.siteUrl,
        source: 'AniList',
        category: 'Anime',
        tier: this.tier,
        image: item.coverImage?.large,
      }));
    } catch (error) {
      console.warn('[AnilistAdapter] fetch failed:', error);
      return [];
    }
  }
}
