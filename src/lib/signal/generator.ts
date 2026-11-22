import {
  SIGNAL_SLOTS,
  type SignalDay,
  type SignalItem,
  type SignalNode,
  type SignalSlot,
} from './types';

const cyrb53 = (str: string, seed = 0): number => {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let index = 0, character; index < str.length; index += 1) {
    character = str.charCodeAt(index);
    h1 = Math.imul(h1 ^ character, 2654435761);
    h2 = Math.imul(h2 ^ character, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

class PRNG {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    const nextSeed = (this.seed += 0x6d2b79f5);
    let value = Math.imul(nextSeed ^ (nextSeed >>> 15), nextSeed | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  }
}

export interface GeneratorConfig {
  date: string;
  generatorVersion: string;
  historicalIds: string[];
  historicalTopicKeys?: string[];
  historicalWatchTitles?: string[];
  lastWatchFormat?: string;
}

function shuffled<T>(items: T[], prng: PRNG): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(prng.next() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function uniqueCandidates(candidates: SignalItem[]): SignalItem[] {
  const unique = new Map<string, SignalItem>();
  for (const item of candidates) {
    if (!unique.has(item.id)) unique.set(item.id, item);
  }
  return Array.from(unique.values());
}

const DAY_MS = 86_400_000;

function editorialPriority(
  item: SignalItem,
  editionEnd: number,
  historicalTopics: ReadonlySet<string>
): number {
  const hasSource = Number(Boolean(item.url));
  const hasContext = Number(item.description.trim().length >= 60);
  const hasImage = Number(Boolean(item.image));

  switch (item.slot) {
    case 'artwork':
      return 3 * hasImage + 2 * hasSource + hasContext;
    case 'website':
      return 3 * hasSource + 2 * hasContext;
    case 'frontier': {
      const age = editionEnd - Date.parse(item.timestamp ?? '');
      const recency = age >= 0 && age < 3 * DAY_MS ? 4 : age >= 0 && age < 7 * DAY_MS ? 2 : 0;
      const relevant = /\b(ai|artificial intelligence|cybersecurity|gemini|gpt|llm|machine learning|security research|vulnerability)\b/i.test(
        `${item.title} ${item.description}`
      );
      const repeated = item.topicKey && historicalTopics.has(item.topicKey);
      return 2 * hasSource + hasContext + recency + 2 * Number(relevant) - (repeated ? 4 : 0);
    }
    case 'screen':
      return 2 * hasContext + hasSource + hasImage;
    case 'reading':
      return 2 * hasContext + 2 * hasSource;
    case 'words':
      return 2 * hasSource + hasContext;
  }
}

function watchTitleKey(title: string): string {
  return title
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/\s*\(\d{4}\)\s*$/, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

function watchFormat(item: SignalItem): string {
  return item.category.trim().toLowerCase();
}

function rankWatch(
  ranked: SignalItem[],
  history: string[],
  limit: number,
  historicalIds: ReadonlySet<string>,
  previousFormat?: string
): SignalItem[] {
  const lastSeen = new Map<string, number>();
  history.forEach((title, index) => {
    const key = watchTitleKey(title);
    if (!lastSeen.has(key)) lastSeen.set(key, index);
  });

  const works = new Map<string, SignalItem>();
  for (const item of ranked) {
    const key = watchTitleKey(item.title) || item.id;
    if (!works.has(key)) works.set(key, item);
  }

  const unseen = Array.from(works).filter(([key, item]) => !lastSeen.has(key) && !historicalIds.has(item.id));
  if (unseen.length === 0) {
    // Prefer the least recently shown work when the entire pool is on cooldown.
    const oldest = Array.from(works).sort(([a], [b]) => (lastSeen.get(b) ?? -1) - (lastSeen.get(a) ?? -1));
    return oldest.slice(0, Math.min(1, limit)).map(([, item]) => item);
  }

  const previous = previousFormat?.trim().toLowerCase();
  const differentFormats = unseen.filter(([, item]) => watchFormat(item) !== previous);
  const pool = differentFormats.length > 0 ? differentFormats : unseen;
  const formats = new Set<string>();
  const leading: SignalItem[] = [];
  const remaining: SignalItem[] = [];
  for (const [, item] of pool) {
    const format = watchFormat(item);
    (formats.has(format) ? remaining : leading).push(item);
    formats.add(format);
  }
  return [...leading, ...remaining].slice(0, limit);
}

export class SignalGenerator {
  public shortlist(
    candidates: SignalItem[],
    config: GeneratorConfig,
    perSlot = 6
  ): SignalItem[] {
    const unique = uniqueCandidates(candidates);
    const historicalIds = new Set(config.historicalIds);
    const historicalTopics = new Set(config.historicalTopicKeys);
    const editionEnd = Date.parse(config.date) + DAY_MS;

    return SIGNAL_SLOTS.flatMap((slot) => {
      const slotCandidates = unique
        .filter((candidate) => candidate.slot === slot)
        .sort((a, b) => a.id.localeCompare(b.id));
      const fresh = slotCandidates.filter((candidate) => !historicalIds.has(candidate.id));
      const pool = slot !== 'screen' && fresh.length > 0 ? fresh : slotCandidates;
      const prng = new PRNG(cyrb53(`${config.date}-${config.generatorVersion}-${slot}`));
      const ranked = shuffled(pool, prng)
        .map((item) => ({ item, score: editorialPriority(item, editionEnd, historicalTopics) }))
        .sort((a, b) => b.score - a.score)
        .map(({ item }) => item);
      return slot === 'screen'
        ? rankWatch(ranked, config.historicalWatchTitles ?? [], perSlot, historicalIds, config.lastWatchFormat)
        : ranked.slice(0, perSlot);
    });
  }

  public generate(candidates: SignalItem[], config: GeneratorConfig): SignalDay {
    const seedString = `${config.date}-${config.generatorVersion}`;
    const prng = new PRNG(cyrb53(seedString));
    const selected = new Map<SignalSlot, SignalItem>();
    const unique = uniqueCandidates(candidates);

    for (const slot of SIGNAL_SLOTS) {
      const options = unique.filter((item) => item.slot === slot);
      if (options.length === 0) {
        throw new Error(`Signal generation is missing the required ${slot} slot.`);
      }
      selected.set(slot, options[Math.floor(prng.next() * options.length)]);
    }

    const nodes: SignalNode[] = SIGNAL_SLOTS.map((slot) => {
      const item = selected.get(slot)!;
      const radius = 20 + prng.next() * 80;
      const angle = prng.next() * Math.PI * 2;

      return {
        ...item,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        r: 2 + prng.next() * 4,
      };
    });

    return {
      date: config.date,
      seed: seedString,
      generatorVersion: config.generatorVersion,
      nodes,
    };
  }
}
