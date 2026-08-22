import fs from 'fs';
import path from 'path';
import { SignalSourceAdapter, SignalItem } from '../types';

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
            candidates = candidates.concat(items);
          }
        }
      } catch (error) {
        console.warn(`[PersonalCatalogueAdapter] Failed to load ${file}:`, error);
      }
    }

    return candidates;
  }
}
