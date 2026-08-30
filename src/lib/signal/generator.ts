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

function editorialPriority(item: SignalItem): number {
  let score = 0;
  if (item.url) score += 1;
  if (item.image) score += 1;
  if (item.description.length >= 80) score += 1;

  if (item.slot === 'frontier') {
    if (item.timestamp) score += 3;
    if (/\b(ai|agent|cyber|exploit|gemini|gpt|grok|llm|malware|model|ransomware|security|vulnerability)\b/i.test(
      `${item.title} ${item.description}`
    )) {
      score += 5;
    }
  }

  return score;
}

export class SignalGenerator {
  public shortlist(
    candidates: SignalItem[],
    config: GeneratorConfig,
    perSlot = 6
  ): SignalItem[] {
    const unique = uniqueCandidates(candidates);
    const historicalIds = new Set(config.historicalIds);

    return SIGNAL_SLOTS.flatMap((slot) => {
      const slotCandidates = unique
        .filter((candidate) => candidate.slot === slot)
        .sort((a, b) => a.id.localeCompare(b.id));
      const fresh = slotCandidates.filter((candidate) => !historicalIds.has(candidate.id));
      const pool = fresh.length > 0 ? fresh : slotCandidates;
      const prng = new PRNG(cyrb53(`${config.date}-${config.generatorVersion}-${slot}`));
      return shuffled(pool, prng)
        .sort((a, b) => editorialPriority(b) - editorialPriority(a))
        .slice(0, perSlot);
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
