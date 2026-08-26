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
      // Fetch top stories ids
      const topResponse = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
      if (!topResponse.ok) throw new Error(`HN API failed: ${topResponse.statusText}`);
      
      const storyIds = await topResponse.json();
      const topIds = storyIds.slice(0, 10); // get first 10
      
      const candidates: SignalItem[] = [];
      const seenTopics = new Set<string>();

      for (const id of topIds) {
        const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        if (!storyResponse.ok) continue;
        
        const story = await storyResponse.json();
        if (story && !story.deleted && !story.dead) {
          const topicKey = getHackerNewsTopicKey(story.title);
          if (seenTopics.has(topicKey)) continue;
          seenTopics.add(topicKey);

          candidates.push({
            id: `hn-${story.id}`,
            title: story.title,
            description: `Hacker News top story by ${story.by}`,
            url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
            source: 'Hacker News',
            category: 'Tech',
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
