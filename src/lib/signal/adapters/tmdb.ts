import { SignalSourceAdapter, SignalItem } from '../types';

type TmdbMovie = {
  id: number;
  title?: string;
  original_title?: string;
  overview?: string;
  poster_path?: string;
};

type TmdbResponse = { results?: TmdbMovie[] };

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
      const response = await fetch(
        `https://api.themoviedb.org/3/trending/movie/day?api_key=${apiKey}`
      );
      if (!response.ok)
        throw new Error(`TMDB API failed: ${response.statusText}`);

      const data = (await response.json()) as TmdbResponse;
      const results = data.results ?? [];

      return results.map((movie) => ({
        id: `tmdb-${movie.id}`,
        title: movie.title ?? movie.original_title ?? 'Untitled film',
        description: movie.overview ?? 'No description available.',
        url: `https://www.themoviedb.org/movie/${movie.id}`,
        source: 'TMDB',
        category: 'Film',
        tier: this.tier,
        image: movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : undefined,
      }));
    } catch (error) {
      console.warn('[TmdbAdapter] fetch failed:', error);
      return [];
    }
  }
}
