import { SignalItem, SignalNode, SignalDay } from './types';

// Deterministic hash function (cyrb53)
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

// Seeded PRNG (mulberry32)
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
  date: string; // YYYY-MM-DD
  generatorVersion: string;
  targetCount: number;
  historicalIds: string[];
}

export class SignalGenerator {
  public generate(candidates: SignalItem[], config: GeneratorConfig): SignalDay {
    const seedString = `${config.date}-${config.generatorVersion}`;
    const seed = cyrb53(seedString);
    const prng = new PRNG(seed);

    // 1. Remove exact duplicates by ID from candidates pool
    const uniqueCandidates = new Map<string, SignalItem>();
    for (const item of candidates) {
      if (!uniqueCandidates.has(item.id)) {
        uniqueCandidates.set(item.id, item);
      }
    }
    const allUnique = Array.from(uniqueCandidates.values());

    // 2. Cooldown filtering
    let available = allUnique.filter(c => !config.historicalIds.includes(c.id));
    
    // If we filtered out too many, relax cooldown by falling back to all unique candidates
    if (available.length < config.targetCount) {
      available = allUnique;
    }

    // Sort deterministically to ensure stable baseline before random selection
    available.sort((a, b) => a.id.localeCompare(b.id));

    // 3. Selection
    const selected: SignalItem[] = [];
    const usedCategories = new Set<string>();

    // We want approximately config.targetCount items.
    while (selected.length < config.targetCount && available.length > 0) {
      // Pick random index
      const idx = Math.floor(prng.next() * available.length);
      const candidate = available[idx];
      
      // Try to avoid category repetition if we still have choices
      const hasOtherCategories = available.some(c => !usedCategories.has(c.category));
      if (usedCategories.has(candidate.category) && hasOtherCategories) {
        // Skip for now, try another one in the next iteration. 
        // To avoid infinite loops, we just remove it temporarily from this try and reshuffle,
        // but an easier way is just swapping with the last and popping, then trying again.
        // Actually, simpler: just remove it from available pool, but we might want it later if we run out.
        // For absolute simplicity in determinism: we just re-roll. If we re-roll, we might hit it again.
        // Let's just find the first available candidate that doesn't share a category, starting from idx.
        let found = false;
        for (let i = 0; i < available.length; i++) {
          const shiftIdx = (idx + i) % available.length;
          if (!usedCategories.has(available[shiftIdx].category)) {
            selected.push(available[shiftIdx]);
            usedCategories.add(available[shiftIdx].category);
            available.splice(shiftIdx, 1);
            found = true;
            break;
          }
        }
        if (!found) {
          // fallback, just take the originally picked one
          selected.push(candidate);
          usedCategories.add(candidate.category);
          available.splice(idx, 1);
        }
      } else {
        selected.push(candidate);
        usedCategories.add(candidate.category);
        available.splice(idx, 1);
      }
    }

    // 4. Layout (Deterministic coordinate calculation)
    // We want coordinates to look like a constellation. Just some pseudo-random spreads.
    const nodes: SignalNode[] = selected.map((item) => {
      // radius from center
      const radius = 20 + prng.next() * 80;
      // angle
      const angle = prng.next() * Math.PI * 2;
      
      // Node size r
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
