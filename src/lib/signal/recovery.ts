import { type SignalItem } from './types';

/** Reuse sourced, validated artwork during outages; never recycle timely news. */
export function recoverArtworkCandidates(
  live: SignalItem[],
  history: SignalItem[]
): SignalItem[] {
  if (live.some((item) => item.slot === 'artwork')) return live;
  const artwork = history.filter((item) => item.slot === 'artwork');
  return [...live, ...artwork];
}
