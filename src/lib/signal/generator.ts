import { SignalItem, SignalNode, SignalDay } from './types';

const cyrb53 = (str: string, seed = 0): number => {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
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
    let t = this.seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

export interface GeneratorConfig {
  date: string;
  generatorVersion: string;
  targetCount: number;
  historicalIds: string[];
}

export class SignalGenerator {
  public generate(candidates: SignalItem[], config: GeneratorConfig): SignalDay {
    const seedString = `${config.date}-${config.generatorVersion}`;
    const seed = cyrb53(seedString);
    const prng = new PRNG(seed);

    const uniqueCandidates = new Map<string, SignalItem>();
    for (const item of candidates) {
      if (!uniqueCandidates.has(item.id)) uniqueCandidates.set(item.id, item);
    }
    const allUnique = Array.from(uniqueCandidates.values());

    let available = allUnique.filter((candidate) => !config.historicalIds.includes(candidate.id));
    if (available.length < config.targetCount) available = allUnique;

    available.sort((a, b) => a.id.localeCompare(b.id));

    // The Signal is intentionally not balanced by category. The daily issue is a
    // chance collision of interesting things; the cooldown is the only editorial
    // constraint beyond deterministic selection.
    const selected: SignalItem[] = [];
    while (selected.length < config.targetCount && available.length > 0) {
      const index = Math.floor(prng.next() * available.length);
      selected.push(available[index]);
      available.splice(index, 1);
    }

    // Keep legacy coordinates in the artifact so all archived v1 days continue to
    // satisfy the existing schema. The current UI derives its composition from seed.
    const nodes: SignalNode[] = selected.map((item) => {
      const radius = 20 + prng.next() * 80;
      const angle = prng.next() * Math.PI * 2;
      const r = 2 + prng.next() * 4;

      return {
        ...item,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        r,
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
