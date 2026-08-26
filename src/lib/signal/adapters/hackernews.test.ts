import { describe, expect, it } from 'vitest';
import { getHackerNewsTopicKey } from './hackernews';

describe('getHackerNewsTopicKey', () => {
  it('collapses noisy headlines about the same release', () => {
    expect(getHackerNewsTopicKey('GLM-5.3-Flash')).toBe(
      getHackerNewsTopicKey('GLM-5.3-Flash Intelligence, Performance and Price Analysis')
    );
  });

  it('keeps unrelated headlines distinct', () => {
    expect(getHackerNewsTopicKey('GLM-5.3-Flash')).not.toBe(
      getHackerNewsTopicKey('A browser engine written in Rust')
    );
  });
});
