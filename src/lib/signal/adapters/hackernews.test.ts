import { describe, expect, it } from 'vitest';
import { cleanHackerNewsTitle, getHackerNewsTopicKey } from './hackernews';

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

describe('cleanHackerNewsTitle', () => {
  it('turns a hard-limited partial headline into a clean ellipsis', () => {
    expect(
      cleanHackerNewsTitle(
        'Security researchers find surveillance implants in Chinese-made routers sold wor'
      )
    ).toBe('Security researchers find surveillance implants in Chinese-made routers sold…');
  });

  it('leaves complete shorter headlines unchanged', () => {
    expect(cleanHackerNewsTitle('A complete security headline')).toBe(
      'A complete security headline'
    );
  });
});
