import { describe, expect, it } from 'vitest';
import {
  createPreviewResolver,
  extractOpenGraphImage,
  isAllowedPreviewUrl,
  isPublicIpAddress,
  type PreviewResolverDependencies,
} from './previews';

function response(status: number, headers: Record<string, string>, body: string | Uint8Array = '') {
  const stream = (async function* () {
    if (typeof body === 'string' ? body.length > 0 : body.byteLength > 0) {
      yield typeof body === 'string' ? new TextEncoder().encode(body) : body;
    }
  })();
  return {
    status,
    headers,
    body: stream,
    destroy: () => undefined,
  };
}

function resolverFor(routes: Record<string, ReturnType<typeof response> | Error>, addresses: Record<string, string[]> = {}) {
  const requests: string[] = [];
  const dependencies: PreviewResolverDependencies = {
    resolve: async (hostname) => addresses[hostname] ?? ['93.184.216.34'],
    request: async ({ url }) => {
      requests.push(url.toString());
      const route = routes[url.toString()];
      if (route instanceof Error) throw route;
      if (!route) throw new Error(`No route for ${url}`);
      return route;
    },
  };
  return { resolver: createPreviewResolver(dependencies), requests };
}

describe('Signal preview URL safety', () => {
  it('accepts only valid public HTTPS preview locations', () => {
    expect(isAllowedPreviewUrl('https://example.com/card.jpg')).toBe(true);
    expect(isAllowedPreviewUrl('http://example.com/card.jpg')).toBe(false);
    expect(isAllowedPreviewUrl('not a URL')).toBe(false);
    expect(isAllowedPreviewUrl('https://localhost/card.jpg')).toBe(false);
    expect(isAllowedPreviewUrl('https://127.0.0.1/card.jpg')).toBe(false);
    expect(isAllowedPreviewUrl('https://user:pass@example.com/card.jpg')).toBe(false);
  });

  it('rejects private, loopback, link-local, documentation, and IPv6 special-use addresses', () => {
    expect(isPublicIpAddress('8.8.8.8')).toBe(true);
    expect(isPublicIpAddress('10.0.0.1')).toBe(false);
    expect(isPublicIpAddress('127.0.0.1')).toBe(false);
    expect(isPublicIpAddress('169.254.169.254')).toBe(false);
    expect(isPublicIpAddress('192.168.1.1')).toBe(false);
    expect(isPublicIpAddress('198.51.100.1')).toBe(false);
    expect(isPublicIpAddress('::1')).toBe(false);
    expect(isPublicIpAddress('fe80::1')).toBe(false);
    expect(isPublicIpAddress('fd00::1')).toBe(false);
    expect(isPublicIpAddress('::ffff:127.0.0.1')).toBe(false);
  });
});

describe('Open Graph metadata parsing', () => {
  it('prefers secure OG metadata, supports relative images, and falls back to Twitter metadata', () => {
    const html = [
      '<meta name="twitter:image" content="https://cdn.example.com/twitter.jpg">',
      '<meta property="og:image" content="/open-graph.jpg">',
      '<meta property="og:image:secure_url" content="https://cdn.example.com/secure.jpg">',
    ].join('');
    expect(extractOpenGraphImage(html, 'https://example.com/article')).toBe('https://cdn.example.com/secure.jpg');
    expect(extractOpenGraphImage('<meta name="twitter:image" content="/twitter.jpg">', 'https://example.com/article')).toBe('https://example.com/twitter.jpg');
    expect(extractOpenGraphImage('<meta property="og:image" content="http://127.0.0.1/private.png">', 'https://example.com')).toBeNull();
    expect(extractOpenGraphImage('<meta property="og:image" content="javascript:alert(1)">', 'https://example.com')).toBeNull();
  });
});

describe('Open Graph preview resolution', () => {
  it('persists a safely validated OG image', async () => {
    const page = 'https://example.com/article';
    const image = 'https://cdn.example.com/card.jpg';
    const { resolver } = resolverFor({
      [page]: response(200, { 'content-type': 'text/html' }, `<head><meta property="og:image" content="${image}"></head>`),
      [image]: response(206, { 'content-type': 'image/jpeg', 'content-length': '1024' }, new Uint8Array([0xff, 0xd8, 0xff])),
    });
    await expect(resolver.resolveOpenGraphPreview(page)).resolves.toBe(image);
  });

  it('fails closed for a redirect into a private network', async () => {
    const page = 'https://example.com/article';
    const privatePage = 'https://private.example/hidden';
    const { resolver, requests } = resolverFor(
      { [page]: response(302, { location: privatePage }) },
      { 'private.example': ['10.0.0.8'] }
    );
    await expect(resolver.resolveOpenGraphPreview(page)).resolves.toBeNull();
    expect(requests).toEqual([page]);
  });

  it('rejects a hostname when any resolved destination is private', async () => {
    const page = 'https://mixed.example/article';
    const { resolver, requests } = resolverFor(
      { [page]: response(200, { 'content-type': 'text/html' }, '<head></head>') },
      { 'mixed.example': ['93.184.216.34', '10.0.0.8'] }
    );
    await expect(resolver.resolveOpenGraphPreview(page)).resolves.toBeNull();
    expect(requests).toEqual([]);
  });

  it('fails closed for excessive redirects, wrong content type, oversized metadata, and fetch errors', async () => {
    const redirects = Object.fromEntries(
      Array.from({ length: 4 }, (_, index) => [
        `https://example.com/${index}`,
        response(302, { location: `https://example.com/${index + 1}` }),
      ])
    );
    const { resolver: redirectResolver } = resolverFor(redirects);
    await expect(redirectResolver.resolveOpenGraphPreview('https://example.com/0')).resolves.toBeNull();

    const { resolver: typeResolver } = resolverFor({
      'https://example.com/file': response(200, { 'content-type': 'application/json' }),
    });
    await expect(typeResolver.resolveOpenGraphPreview('https://example.com/file')).resolves.toBeNull();

    const { resolver: sizeResolver } = resolverFor({
      'https://example.com/large': response(200, { 'content-type': 'text/html', 'content-length': '350001' }),
    });
    await expect(sizeResolver.resolveOpenGraphPreview('https://example.com/large')).resolves.toBeNull();

    const { resolver: failureResolver } = resolverFor({ 'https://example.com/failure': new Error('timeout') });
    await expect(failureResolver.resolveOpenGraphPreview('https://example.com/failure')).resolves.toBeNull();
  });

  it('falls back when metadata has no image, an image URL is malformed, or the image resolves privately', async () => {
    const { resolver: noImageResolver } = resolverFor({
      'https://example.com/no-image': response(200, { 'content-type': 'text/html' }, '<head><title>Nothing</title></head>'),
    });
    await expect(noImageResolver.resolveOpenGraphPreview('https://example.com/no-image')).resolves.toBeNull();

    const { resolver: malformedResolver } = resolverFor({
      'https://example.com/malformed': response(200, { 'content-type': 'text/html' }, '<head><meta property="og:image" content="javascript:alert(1)"></head>'),
    });
    await expect(malformedResolver.resolveOpenGraphPreview('https://example.com/malformed')).resolves.toBeNull();

    const image = 'https://private-cdn.example/card.jpg';
    const { resolver: privateImageResolver, requests } = resolverFor(
      {
        'https://example.com/private-image': response(200, { 'content-type': 'text/html' }, `<head><meta property="og:image" content="${image}"></head>`),
      },
      { 'private-cdn.example': ['fd00::1'] }
    );
    await expect(privateImageResolver.resolveOpenGraphPreview('https://example.com/private-image')).resolves.toBeNull();
    expect(requests).toEqual(['https://example.com/private-image']);
  });
});
