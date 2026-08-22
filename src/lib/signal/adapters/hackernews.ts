import { SignalSourceAdapter, SignalItem } from '../types';

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

      for (const id of topIds) {
        const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        if (!storyResponse.ok) continue;
        
        const story = await storyResponse.json();
        if (story && !story.deleted && !story.dead) {
          candidates.push({
            id: `hn-${story.id}`,
            title: story.title,
            description: `Hacker News top story by ${story.by}`,
            url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
            source: 'Hacker News',
            category: 'Tech',
            tier: this.tier,
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
