export type SignalTreatment =
  | 'poster'
  | 'headline'
  | 'note'
  | 'strip'
  | 'fragment';

export type SignalMobileAlign = 'start' | 'center' | 'end';

export interface SignalVisualSlot {
  col: number;
  colSpan: number;
  row: number;
  rowSpan: number;
  treatment: SignalTreatment;
  mobileAlign: SignalMobileAlign;
  mobileWidth: number;
}

interface SignalLayoutGrammar {
  name: string;
  slots: SignalVisualSlot[];
}

export interface SignalVisualPlacement extends SignalVisualSlot {
  rotation: number;
}

export interface SignalVisualPlan {
  name: string;
  placements: SignalVisualPlacement[];
}

const LAYOUTS: SignalLayoutGrammar[] = [
  {
    name: 'scatter',
    slots: [
      { col: 1, colSpan: 5, row: 1, rowSpan: 5, treatment: 'poster', mobileAlign: 'start', mobileWidth: 92 },
      { col: 8, colSpan: 4, row: 2, rowSpan: 3, treatment: 'headline', mobileAlign: 'end', mobileWidth: 78 },
      { col: 4, colSpan: 4, row: 7, rowSpan: 3, treatment: 'note', mobileAlign: 'center', mobileWidth: 84 },
      { col: 9, colSpan: 4, row: 8, rowSpan: 5, treatment: 'poster', mobileAlign: 'end', mobileWidth: 88 },
      { col: 1, colSpan: 3, row: 11, rowSpan: 2, treatment: 'strip', mobileAlign: 'start', mobileWidth: 72 },
    ],
  },
  {
    name: 'front-page',
    slots: [
      { col: 1, colSpan: 8, row: 1, rowSpan: 7, treatment: 'poster', mobileAlign: 'start', mobileWidth: 100 },
      { col: 9, colSpan: 4, row: 1, rowSpan: 3, treatment: 'fragment', mobileAlign: 'end', mobileWidth: 66 },
      { col: 9, colSpan: 4, row: 5, rowSpan: 4, treatment: 'note', mobileAlign: 'end', mobileWidth: 82 },
      { col: 2, colSpan: 5, row: 9, rowSpan: 4, treatment: 'headline', mobileAlign: 'start', mobileWidth: 88 },
      { col: 8, colSpan: 5, row: 10, rowSpan: 3, treatment: 'strip', mobileAlign: 'end', mobileWidth: 76 },
    ],
  },
  {
    name: 'margins',
    slots: [
      { col: 1, colSpan: 3, row: 1, rowSpan: 4, treatment: 'note', mobileAlign: 'start', mobileWidth: 74 },
      { col: 9, colSpan: 4, row: 1, rowSpan: 6, treatment: 'poster', mobileAlign: 'end', mobileWidth: 90 },
      { col: 4, colSpan: 5, row: 5, rowSpan: 4, treatment: 'headline', mobileAlign: 'center', mobileWidth: 94 },
      { col: 1, colSpan: 4, row: 9, rowSpan: 4, treatment: 'poster', mobileAlign: 'start', mobileWidth: 86 },
      { col: 9, colSpan: 4, row: 10, rowSpan: 3, treatment: 'fragment', mobileAlign: 'end', mobileWidth: 70 },
    ],
  },
  {
    name: 'stack',
    slots: [
      { col: 2, colSpan: 6, row: 1, rowSpan: 5, treatment: 'poster', mobileAlign: 'center', mobileWidth: 94 },
      { col: 7, colSpan: 5, row: 3, rowSpan: 4, treatment: 'headline', mobileAlign: 'end', mobileWidth: 86 },
      { col: 1, colSpan: 4, row: 6, rowSpan: 3, treatment: 'strip', mobileAlign: 'start', mobileWidth: 72 },
      { col: 5, colSpan: 6, row: 7, rowSpan: 6, treatment: 'poster', mobileAlign: 'center', mobileWidth: 96 },
      { col: 1, colSpan: 4, row: 10, rowSpan: 3, treatment: 'note', mobileAlign: 'start', mobileWidth: 82 },
    ],
  },
  {
    name: 'index',
    slots: [
      { col: 1, colSpan: 6, row: 1, rowSpan: 3, treatment: 'headline', mobileAlign: 'start', mobileWidth: 96 },
      { col: 8, colSpan: 4, row: 2, rowSpan: 4, treatment: 'poster', mobileAlign: 'end', mobileWidth: 82 },
      { col: 2, colSpan: 3, row: 6, rowSpan: 3, treatment: 'fragment', mobileAlign: 'start', mobileWidth: 64 },
      { col: 5, colSpan: 7, row: 7, rowSpan: 4, treatment: 'note', mobileAlign: 'end', mobileWidth: 92 },
      { col: 1, colSpan: 5, row: 11, rowSpan: 2, treatment: 'strip', mobileAlign: 'start', mobileWidth: 78 },
    ],
  },
  {
    name: 'collision',
    slots: [
      { col: 1, colSpan: 7, row: 1, rowSpan: 6, treatment: 'poster', mobileAlign: 'start', mobileWidth: 98 },
      { col: 7, colSpan: 6, row: 2, rowSpan: 4, treatment: 'headline', mobileAlign: 'end', mobileWidth: 90 },
      { col: 2, colSpan: 5, row: 6, rowSpan: 3, treatment: 'note', mobileAlign: 'start', mobileWidth: 86 },
      { col: 6, colSpan: 7, row: 7, rowSpan: 6, treatment: 'poster', mobileAlign: 'end', mobileWidth: 96 },
      { col: 1, colSpan: 4, row: 10, rowSpan: 3, treatment: 'fragment', mobileAlign: 'start', mobileWidth: 68 },
    ],
  },
];

function hashString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createPrng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function getSignalVisualPlan(seed: string, count: number): SignalVisualPlan {
  const seedHash = hashString(seed);
  const grammar = LAYOUTS[seedHash % LAYOUTS.length];
  const random = createPrng(hashString(`${seed}:visual`));
  const slots = grammar.slots.map((slot) => ({ ...slot }));

  for (let index = slots.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [slots[index], slots[swapIndex]] = [slots[swapIndex], slots[index]];
  }

  const placements = Array.from({ length: count }, (_, index) => {
    const slot = slots[index % slots.length];
    const rotation = Math.round((random() - 0.5) * 3 * 10) / 10;
    return { ...slot, rotation };
  });

  return { name: grammar.name, placements };
}
