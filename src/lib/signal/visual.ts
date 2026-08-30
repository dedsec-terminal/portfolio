import { SIGNAL_SLOTS, type SignalSlot } from './types';

export const SIGNAL_GRID = { columns: 12, rows: 12 } as const;

export type SignalTreatment = 'poster' | 'headline' | 'note' | 'strip' | 'fragment';
export type SignalMobileAlign = 'start' | 'center' | 'end';

export interface SignalRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SignalVisualSlot extends SignalRect {
  slot: SignalSlot;
  treatment: SignalTreatment;
  mobileAlign: SignalMobileAlign;
  mobileWidth: number;
  rotation: number;
}

export interface SignalLayoutGrammar {
  name: string;
  slots: SignalVisualSlot[];
}

export interface SignalVisualPlacement extends SignalVisualSlot {
  col: number;
  colSpan: number;
  row: number;
  rowSpan: number;
}

export interface SignalVisualPlan {
  name: string;
  placements: SignalVisualPlacement[];
}

function tile(
  slot: SignalSlot,
  x: number,
  y: number,
  w: number,
  h: number,
  treatment: SignalTreatment,
  mobileAlign: SignalMobileAlign,
  mobileWidth: number,
  rotation = 0
): SignalVisualSlot {
  return { slot, x, y, w, h, treatment, mobileAlign, mobileWidth, rotation };
}

// Coordinates map directly to canonical slots. One-cell gutters and subtle
// rotations retain the hand-cut rhythm without depending on z-index stacking.
export const SIGNAL_LAYOUTS: SignalLayoutGrammar[] = [
  {
    name: 'scatter',
    slots: [
      tile('artwork', 1, 1, 5, 5, 'poster', 'start', 92),
      tile('website', 8, 1, 5, 3, 'headline', 'end', 78, -0.3),
      tile('frontier', 6, 5, 3, 2, 'note', 'center', 84, 0.25),
      tile('screen', 9, 7, 4, 6, 'poster', 'end', 88, 0.2),
      tile('reading', 1, 8, 3, 3, 'strip', 'start', 72, -0.2),
      tile('words', 4, 10, 4, 3, 'fragment', 'center', 76),
    ],
  },
  {
    name: 'front-page',
    slots: [
      tile('artwork', 1, 1, 6, 6, 'poster', 'start', 100),
      tile('website', 1, 8, 6, 4, 'headline', 'start', 88, -0.2),
      tile('frontier', 9, 4, 4, 4, 'note', 'end', 82, 0.25),
      tile('screen', 7, 9, 6, 3, 'strip', 'end', 76, 0.2),
      tile('reading', 9, 1, 4, 3, 'fragment', 'end', 66, -0.25),
      tile('words', 7, 6, 2, 2, 'fragment', 'center', 68),
    ],
  },
  {
    name: 'margins',
    slots: [
      tile('artwork', 9, 1, 4, 6, 'poster', 'end', 90),
      tile('website', 1, 1, 3, 4, 'note', 'start', 74, -0.25),
      tile('frontier', 4, 5, 5, 4, 'headline', 'center', 94, 0.2),
      tile('screen', 1, 9, 4, 4, 'poster', 'start', 86, 0.25),
      tile('reading', 9, 8, 4, 3, 'fragment', 'end', 70, -0.2),
      tile('words', 5, 1, 3, 3, 'strip', 'center', 76),
    ],
  },
  {
    name: 'stack',
    slots: [
      tile('artwork', 2, 1, 6, 5, 'poster', 'center', 94),
      tile('website', 8, 2, 5, 4, 'headline', 'end', 86, -0.2),
      tile('frontier', 1, 6, 4, 3, 'strip', 'start', 72, 0.2),
      tile('screen', 7, 7, 6, 6, 'poster', 'center', 96, 0.2),
      tile('reading', 1, 9, 4, 4, 'note', 'start', 82, -0.2),
      tile('words', 5, 10, 2, 3, 'fragment', 'end', 70),
    ],
  },
  {
    name: 'index',
    slots: [
      tile('artwork', 8, 1, 5, 5, 'poster', 'end', 82),
      tile('website', 1, 1, 6, 4, 'headline', 'start', 96, -0.2),
      tile('frontier', 2, 6, 3, 3, 'fragment', 'start', 64, 0.2),
      tile('screen', 6, 7, 7, 4, 'note', 'end', 92, 0.2),
      tile('reading', 1, 10, 5, 3, 'strip', 'start', 78, -0.2),
      tile('words', 10, 11, 3, 2, 'fragment', 'end', 68),
    ],
  },
  {
    name: 'collision',
    slots: [
      tile('artwork', 1, 1, 6, 5, 'poster', 'start', 98),
      tile('website', 7, 2, 6, 3, 'headline', 'end', 90, -0.2),
      tile('frontier', 1, 8, 4, 4, 'note', 'start', 86, 0.2),
      tile('screen', 6, 7, 7, 6, 'poster', 'end', 96, 0.2),
      tile('reading', 2, 6, 3, 2, 'fragment', 'start', 68, -0.2),
      tile('words', 9, 5, 4, 2, 'strip', 'end', 76),
    ],
  },
];

export function rectanglesIntersect(a: SignalRect, b: SignalRect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function getSignalVisualPlan(seed: string, count: number = SIGNAL_SLOTS.length): SignalVisualPlan {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  const grammar = SIGNAL_LAYOUTS[(hash >>> 0) % SIGNAL_LAYOUTS.length];
  const placements = grammar.slots.slice(0, count).map((slot) => ({
    ...slot,
    col: slot.x,
    colSpan: slot.w,
    row: slot.y,
    rowSpan: slot.h,
  }));
  return { name: grammar.name, placements };
}
