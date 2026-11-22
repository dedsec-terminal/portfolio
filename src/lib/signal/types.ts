export type SignalTier = 'Personal' | 'Curated' | 'Discovery';

export const SIGNAL_SLOTS = [
  'artwork',
  'website',
  'frontier',
  'screen',
  'reading',
  'words',
] as const;

export type SignalSlot = (typeof SIGNAL_SLOTS)[number];

export const SIGNAL_SLOT_LABELS: Record<SignalSlot, string> = {
  artwork: 'Artwork',
  website: 'Website',
  frontier: 'Cyber / AI',
  screen: 'Watch',
  reading: 'Read',
  words: 'Words',
};

export const SIGNAL_SLOT_BRIEFS: Record<SignalSlot, string> = {
  artwork: 'Choose an identifiable work with a visual detail or creator context supported by the catalogue.',
  website: 'Choose a useful or distinctive destination and explain what a visitor can do or discover there.',
  frontier: 'Choose timely, substantive cybersecurity reporting or AI research, favoring primary sources.',
  screen: 'Choose a specific film, series, documentary, short, talk, or video for its premise or craft. Prefer distinctive work over popularity.',
  reading: 'Choose a work with a clear subject, argument, or question worth reading about.',
  words: 'Choose an attributable line or idea that rewards reflection and retain its source.',
};

export interface SignalItem {
  id: string; // Globally unique among its tier/source to prevent duplicates
  title: string;
  description: string;
  url?: string;
  source: string; // e.g., "Personal Art", "Wikipedia", "Hacker News"
  category: string; // e.g., "film", "website", "article"
  slot: SignalSlot;
  tier: SignalTier;
  image?: string;
  curiosity?: string;
  topicKey?: string;
  timestamp?: string;
  metadata?: Record<string, unknown>;
}

export interface SignalSourceAdapter {
  id: string;
  tier: SignalTier;
  weight: number;
  fetchCandidates(): Promise<SignalItem[]>;
}

export interface SignalNode extends SignalItem {
  // Deterministic layout coordinates (placeholder units, to be mapped by frontend)
  x: number;
  y: number;
  r: number;
}

export interface SignalDay {
  date: string; // YYYY-MM-DD
  seed: string;
  generatorVersion: string;
  nodes: SignalNode[];
}
