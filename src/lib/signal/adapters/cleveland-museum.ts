import { z } from 'zod';
import type { SignalItem, SignalSourceAdapter } from '../types';

const ENDPOINT = 'https://openaccess-api.clevelandart.org/api/artworks/';
const PAGE_SIZE = 12;

const paintingSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().trim().min(1),
  type: z.literal('Painting'),
  share_license_status: z.literal('CC0'),
  creation_date: z.string().nullish(),
  creators: z.array(z.object({ description: z.string().nullish() })).optional(),
  url: z.url(),
  images: z.object({ web: z.object({ url: z.url() }) }),
});

function isMuseumUrl(value: string, hosts: string[]): boolean {
  const url = new URL(value);
  return (
    url.protocol === 'https:' && !url.username && !url.password && !url.port &&
    hosts.includes(url.hostname)
  );
}

export class ClevelandMuseumAdapter implements SignalSourceAdapter {
  id = 'cleveland-museum';
  tier = 'Curated' as const;
  weight = 0.9;

  constructor(private readonly date: string) {}

  async fetchCandidates(): Promise<SignalItem[]> {
    const day = Math.floor(Date.parse(this.date) / 86_400_000);
    const url = new URL(ENDPOINT);
    url.search = new URLSearchParams({
      cc0: '1',
      has_image: '1',
      type: 'Painting',
      limit: String(PAGE_SIZE),
      skip: String((day % 60) * PAGE_SIZE),
    }).toString();

    const response = await fetch(url, { signal: AbortSignal.timeout(8_000) });
    if (!response.ok) throw new Error(`Cleveland Museum API returned HTTP ${response.status}`);

    const { data } = z.object({ data: z.array(z.unknown()) }).parse(await response.json());
    return data.flatMap((record) => {
      const result = paintingSchema.safeParse(record);
      if (!result.success) return [];
      const painting = result.data;
      const image = painting.images.web.url;
      if (
        !isMuseumUrl(painting.url, ['clevelandart.org', 'www.clevelandart.org']) ||
        !isMuseumUrl(image, ['openaccess-cdn.clevelandart.org'])
      ) return [];

      return [{
        id: `cma-${painting.id}`,
        title: painting.title,
        description: [
          painting.creators?.map((creator) => creator.description).filter(Boolean).join(', '),
          painting.creation_date,
        ].filter(Boolean).join(' · ') || 'A CC0 painting from the Cleveland Museum of Art.',
        url: painting.url,
        source: 'Cleveland Museum of Art',
        category: 'Art',
        slot: 'artwork',
        tier: this.tier,
        image,
      } satisfies SignalItem];
    });
  }
}
