import fs from 'fs';
import path from 'path';
import { SignalSourceAdapter, SignalItem, type SignalSlot } from '../types';

const CATALOGUE_SLOTS: Record<string, SignalSlot> = {
  'films.json': 'screen',
  'music.json': 'words',
  'art.json': 'artwork',
  'websites.json': 'website',
  'reading.json': 'reading',
};

export class PersonalCatalogueAdapter implements SignalSourceAdapter {
  id = 'personal';
  tier = 'Personal' as const;
  weight = 1.0;

  async fetchCandidates(): Promise<SignalItem[]> {
    const catalogueDir = path.join(process.cwd(), 'src/content/personal-catalogue');
    const files = ['films.json', 'music.json', 'art.json', 'websites.json', 'reading.json'];
    
    let candidates: SignalItem[] = [];

    for (const file of files) {
      try {
        const filePath = path.join(catalogueDir, file);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf-8');
          const items = JSON.parse(content);
          if (Array.isArray(items)) {
            candidates = candidates.concat(
              items.map((item) => ({ ...item, slot: CATALOGUE_SLOTS[file] }))
            );
          }
        }
      } catch (error) {
        console.warn(`[PersonalCatalogueAdapter] Failed to load ${file}:`, error);
      }
    }

    return candidates;
  }
}
