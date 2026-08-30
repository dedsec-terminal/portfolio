import { SignalSourceAdapter, SignalItem } from '../types';

type TmdbMedia = {
  id: number;
  title?: string;
  original_title?: string;
  name?: string;
  original_name?: string;
  overview?: string;
  poster_path?: string;
};

type TmdbResponse = { results?: TmdbMedia[] };

export class TmdbAdapter implements SignalSourceAdapter {
  id = 'tmdb';
  tier = 'Curated' as const;
  weight = 0.7;

  async fetchCandidates(): Promise<SignalItem[]> {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      console.warn('[TmdbAdapter] TMDB_API_KEY is missing. Skipping.');
      return [];
    }

    try {
      const mediaTypes = ['movie', 'tv'] as const;
      const responses = await Promise.all(
        mediaTypes.map(async (mediaType) => {
          const response = await fetch(
            `https://api.themoviedb.org/3/trending/${mediaType}/day?api_key=${apiKey}`
          );
          if (!response.ok) {
            throw new Error(`TMDB ${mediaType} API failed: ${response.statusText}`);
          }
          return { mediaType, payload: (await response.json()) as TmdbResponse };
        })
      );

      return responses.flatMap(({ mediaType, payload }) =>
        (payload.results ?? []).map((item) => ({
          id: `tmdb-${mediaType}-${item.id}`,
          title:
            item.title ??
            item.name ??
            item.original_title ??
            item.original_name ??
            'Untitled screen entry',
          description: item.overview ?? 'No description available.',
          url: `https://www.themoviedb.org/${mediaType}/${item.id}`,
          source: 'TMDB',
          category: mediaType === 'movie' ? 'Film' : 'TV',
          slot: 'screen',
          tier: this.tier,
          image: item.poster_path
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : undefined,
        }))
      );
    } catch (error) {
      console.warn('[TmdbAdapter] fetch failed:', error);
      return [];
    }
  }
}
