import { SignalSourceAdapter, SignalItem } from '../types';

const TOPIC_NOISE = new Set([
  'analysis',
  'and',
  'announcing',
  'announcement',
  'ask',
  'benchmark',
  'comparison',
  'explained',
  'flash',
  'hn',
  'intelligence',
  'launch',
  'performance',
  'price',
  'release',
  'review',
  'show',
  'the',
]);

export function getHackerNewsTopicKey(title: string): string {
  const tokens = title
    .toLocaleLowerCase('en-US')
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((token) => token.length > 0 && !TOPIC_NOISE.has(token));

  return tokens.slice(0, 8).join(' ') || title.toLocaleLowerCase('en-US');
}

export class HackerNewsAdapter implements SignalSourceAdapter {
  id = 'hackernews';
  tier = 'Discovery' as const;
  weight = 0.6;

  async fetchCandidates(): Promise<SignalItem[]> {
    try {
      const topResponse = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
      if (!topResponse.ok) throw new Error(`HN API failed: ${topResponse.statusText}`);

      const storyIds = (await topResponse.json()) as number[];
      const topStories = await Promise.all(
        storyIds.slice(0, 20).map(async (id) => {
          const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
          return response.ok ? response.json() : null;
        })
      );

      const since = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60;
      const focusedQueries = ['cybersecurity', 'AI model', 'ChatGPT', 'Gemini'];
      const focusedResults = await Promise.all(
        focusedQueries.map(async (query) => {
          const url = new URL('https://hn.algolia.com/api/v1/search_by_date');
          url.searchParams.set('query', query);
          url.searchParams.set('tags', 'story');
          url.searchParams.set('hitsPerPage', '5');
          url.searchParams.set('numericFilters', `created_at_i>${since}`);
          const response = await fetch(url);
          if (!response.ok) return [];
          const payload = (await response.json()) as {
            hits?: Array<{
              objectID: string;
              title?: string;
              url?: string;
              author?: string;
              created_at_i?: number;
            }>;
          };
          return payload.hits ?? [];
        })
      );

      const stories = [
        ...topStories,
        ...focusedResults.flat().map((hit) => ({
          id: Number(hit.objectID),
          title: hit.title,
          url: hit.url,
          by: hit.author,
          time: hit.created_at_i,
        })),
      ];

      const candidates: SignalItem[] = [];
      const seenTopics = new Set<string>();

      for (const story of stories) {
        if (story && !story.deleted && !story.dead) {
          const topicKey = getHackerNewsTopicKey(story.title);
          if (seenTopics.has(topicKey)) continue;
          seenTopics.add(topicKey);

          candidates.push({
            id: `hn-${story.id}`,
            title: story.title,
            description: `A recent Hacker News story shared by ${story.by ?? 'the community'}.`,
            url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
            source: 'Hacker News',
            category: 'Tech',
            slot: 'frontier',
            tier: this.tier,
            topicKey,
            timestamp: story.time ? new Date(story.time * 1000).toISOString() : undefined,
          });
        }
      }

      return candidates;
    } catch (error) {
      console.warn('[HackerNewsAdapter] fetch failed:', error);
      return [];
    }
  }
}
