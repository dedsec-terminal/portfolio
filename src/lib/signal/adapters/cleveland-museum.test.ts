import { afterEach, describe, expect, it, vi } from 'vitest';
import { ClevelandMuseumAdapter } from './cleveland-museum';

const painting = {
  id: 42,
  title: 'Portrait',
  type: 'Painting',
  share_license_status: 'CC0',
  creation_date: '1810',
  creators: [{ description: 'Sample artist' }],
  url: 'https://clevelandart.org/art/1927.393',
  images: { web: { url: 'https://openaccess-cdn.clevelandart.org/1927.393/1927.393_web.jpg' } },
};

describe('ClevelandMuseumAdapter', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('accepts only CC0 paintings with museum-hosted images and attribution', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ data: [
      painting,
      { ...painting, id: 43, type: 'Sculpture' },
      { ...painting, id: 44, share_license_status: 'Copyrighted' },
      { ...painting, id: 45, images: null },
      { ...painting, id: 46, images: { web: { url: 'https://example.com/image.jpg' } } },
      null,
    ] }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await new ClevelandMuseumAdapter('2026-11-22').fetchCandidates();
    expect(result).toEqual([expect.objectContaining({
      id: 'cma-42',
      source: 'Cleveland Museum of Art',
      slot: 'artwork',
      description: 'Sample artist · 1810',
      image: painting.images.web.url,
    })]);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url.searchParams.get('cc0')).toBe('1');
    expect(url.searchParams.get('type')).toBe('Painting');
    expect(url.searchParams.get('has_image')).toBe('1');
    expect(options.signal).toBeInstanceOf(AbortSignal);
  });

  it('surfaces an upstream failure to source collection', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 503 })));
    await expect(new ClevelandMuseumAdapter('2026-11-22').fetchCandidates()).rejects.toThrow('HTTP 503');
  });
});
