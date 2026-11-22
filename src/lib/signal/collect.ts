import type { SignalItem, SignalSourceAdapter } from './types';

const MAX_CONCURRENT_SOURCES = 3;

export async function collectSignalCandidates(
  adapters: readonly SignalSourceAdapter[]
): Promise<SignalItem[]> {
  const results: SignalItem[][] = Array.from({ length: adapters.length }, () => []);
  const remaining = adapters.entries();

  async function collect() {
    for (const [index, adapter] of remaining) {
      const startedAt = performance.now();
      try {
        const items = await adapter.fetchCandidates();
        results[index] = items;
        console.log(
          `[Signal Engine] ${adapter.id}: ${items.length} candidates in ${Math.round(performance.now() - startedAt)} ms.`
        );
      } catch (error) {
        console.warn(`[Signal Engine] ${adapter.id} failed:`, error);
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(MAX_CONCURRENT_SOURCES, adapters.length) }, collect)
  );
  return results.flat();
}
