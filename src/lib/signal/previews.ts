import { lookup } from 'node:dns/promises';
import type { IncomingHttpHeaders } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { isIP } from 'node:net';
import type { SignalItem } from './types';

const MAX_REDIRECTS = 3;
const MAX_HTML_BYTES = 350_000;
const MAX_IMAGE_BYTES = 5_000_000;
const IMAGE_PROBE_BYTES = 16_384;
const REQUEST_TIMEOUT_MS = 8_000;
const USER_AGENT = 'Dedsec Terminal Signal preview/1.0';

type PreviewResponse = {
  status: number;
  headers: IncomingHttpHeaders;
  body: AsyncIterable<Uint8Array>;
  destroy: () => void;
};

type PreviewRequest = {
  url: URL;
  address: string;
  method: 'GET';
  headers: Record<string, string>;
};

export type PreviewResolverDependencies = {
  resolve: (hostname: string) => Promise<string[]>;
  request: (request: PreviewRequest) => Promise<PreviewResponse>;
};

function toIpv4Octets(address: string): number[] | null {
  const octets = address.split('.').map(Number);
  return octets.length === 4 && octets.every((octet) => Number.isInteger(octet) && octet >= 0 && octet <= 255)
    ? octets
    : null;
}

function isPrivateIpv4(address: string): boolean {
  const octets = toIpv4Octets(address);
  if (!octets) return true;
  const [first, second, third] = octets;

  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 0) ||
    (first === 192 && second === 2) ||
    (first === 192 && second === 88 && third === 99) ||
    (first === 192 && second === 168) ||
    (first === 198 && (second === 18 || second === 19)) ||
    (first === 198 && second === 51 && third === 100) ||
    (first === 203 && second === 0 && third === 113) ||
    first >= 224
  );
}

function ipv6Words(address: string): number[] | null {
  const value = address.toLowerCase();
  if (value.includes('%') || value.split('::').length > 2) return null;
  const [left = '', right = ''] = value.split('::');
  const leftParts = left ? left.split(':') : [];
  const rightParts = right ? right.split(':') : [];
  const parts = [...leftParts, ...rightParts];

  if (parts.some((part) => !/^[0-9a-f]{1,4}$/.test(part))) return null;
  if (value.includes('::')) {
    const zeroes = 8 - parts.length;
    if (zeroes < 1) return null;
    return [...leftParts, ...Array(zeroes).fill('0'), ...rightParts].map((part) => Number.parseInt(part, 16));
  }
  return parts.length === 8 ? parts.map((part) => Number.parseInt(part, 16)) : null;
}

function mappedIpv4(words: number[]): string | null {
  if (words.slice(0, 5).every((word) => word === 0) && words[5] === 0xffff) {
    return `${words[6] >> 8}.${words[6] & 255}.${words[7] >> 8}.${words[7] & 255}`;
  }

  if (words.slice(0, 6).every((word) => word === 0) && words[6] === 0) {
    return `0.0.${words[7] >> 8}.${words[7] & 255}`;
  }

  if (words[0] === 0x0064 && words[1] === 0xff9b && words.slice(2, 6).every((word) => word === 0)) {
    return `${words[6] >> 8}.${words[6] & 255}.${words[7] >> 8}.${words[7] & 255}`;
  }

  return null;
}

export function isPublicIpAddress(address: string): boolean {
  const type = isIP(address);
  if (type === 4) return !isPrivateIpv4(address);
  if (type !== 6) return false;

  const words = ipv6Words(address);
  if (!words) return false;
  const mapped = mappedIpv4(words);
  if (mapped) return !isPrivateIpv4(mapped);

  const first = words[0];
  const allZero = words.every((word) => word === 0);
  const loopback = words.slice(0, 7).every((word) => word === 0) && words[7] === 1;

  return !(
    allZero ||
    loopback ||
    (first & 0xfe00) === 0xfc00 ||
    (first & 0xffc0) === 0xfe80 ||
    (first & 0xff00) === 0xff00 ||
    (first === 0x0100 && words.slice(1, 4).every((word) => word === 0)) ||
    (first === 0x2001 && (words[1] & 0xffe0) === 0x0000) ||
    (first === 0x2001 && words[1] === 0x0db8)
  );
}

function hostnameFromUrl(url: URL): string {
  return url.hostname.replace(/^\[|\]$/g, '');
}

export function isAllowedPreviewUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return false;
    const hostname = hostnameFromUrl(url).toLowerCase();
    if (hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local')) return false;
    return isIP(hostname) === 0 || isPublicIpAddress(hostname);
  } catch {
    return false;
  }
}

async function resolvePublicAddresses(url: URL, resolve: PreviewResolverDependencies['resolve']): Promise<string[]> {
  if (!isAllowedPreviewUrl(url.toString())) return [];
  const hostname = hostnameFromUrl(url);
  if (isIP(hostname) !== 0) return isPublicIpAddress(hostname) ? [hostname] : [];

  try {
    const addresses = await resolve(hostname);
    return addresses.length > 0 && addresses.every(isPublicIpAddress) ? addresses : [];
  } catch {
    return [];
  }
}

async function defaultResolve(hostname: string): Promise<string[]> {
  const records = await lookup(hostname, { all: true, verbatim: true });
  return records.map((record) => record.address);
}

async function defaultRequest({ url, address, method, headers }: PreviewRequest): Promise<PreviewResponse> {
  return new Promise((resolve, reject) => {
    const request = httpsRequest(
      {
        protocol: 'https:',
        hostname: address,
        path: `${url.pathname}${url.search}`,
        method,
        headers: { ...headers, Host: url.host },
        servername: hostnameFromUrl(url),
        timeout: REQUEST_TIMEOUT_MS,
      },
      (response) =>
        resolve({
          status: response.statusCode ?? 0,
          headers: response.headers,
          body: response,
          destroy: () => response.destroy(),
        })
    );
    request.once('timeout', () => request.destroy(new Error('Signal preview request timed out.')));
    request.once('error', reject);
    request.end();
  });
}

function header(headers: IncomingHttpHeaders, name: string): string | undefined {
  const value = headers[name];
  return Array.isArray(value) ? value[0] : value;
}

function contentLengthWithinLimit(response: PreviewResponse, limit: number): boolean {
  const value = header(response.headers, 'content-length');
  const length = value ? Number(value) : 0;
  return Number.isFinite(length) && length <= limit;
}

async function requestWithSafeRedirects(
  rawUrl: string,
  headers: Record<string, string>,
  dependencies: PreviewResolverDependencies
): Promise<{ response: PreviewResponse; url: URL } | null> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  for (let attempt = 0; attempt <= MAX_REDIRECTS; attempt += 1) {
    const addresses = await resolvePublicAddresses(url, dependencies.resolve);
    if (addresses.length === 0) return null;

    let response: PreviewResponse | null = null;
    for (const address of addresses) {
      try {
        response = await dependencies.request({ url, address, method: 'GET', headers });
        break;
      } catch {
        // Try another already-validated address, then fall back if none respond.
      }
    }
    if (!response) return null;
    if (response.status < 300 || response.status >= 400) return { response, url };

    const location = header(response.headers, 'location');
    response.destroy();
    if (!location || attempt === MAX_REDIRECTS) return null;
    try {
      url = new URL(location, url);
    } catch {
      return null;
    }
  }

  return null;
}

async function readHtmlHead(response: PreviewResponse): Promise<string | null> {
  if (!contentLengthWithinLimit(response, MAX_HTML_BYTES)) return null;
  const decoder = new TextDecoder();
  let html = '';
  let size = 0;

  try {
    for await (const chunk of response.body) {
      size += chunk.byteLength;
      if (size > MAX_HTML_BYTES) return null;
      html += decoder.decode(chunk, { stream: true });
      if (/<\/head\s*>/i.test(html)) return html;
    }
    return html + decoder.decode();
  } finally {
    response.destroy();
  }
}

function attribute(tag: string, name: string): string | null {
  const match = tag.match(new RegExp(`(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return match?.[1] ?? match?.[2] ?? match?.[3] ?? null;
}

export function extractOpenGraphImage(html: string, pageUrl: string): string | null {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  const candidates: Record<'secure' | 'openGraph' | 'twitter', string[]> = { secure: [], openGraph: [], twitter: [] };

  for (const tag of tags) {
    const key = (attribute(tag, 'property') ?? attribute(tag, 'name'))?.toLowerCase();
    const content = attribute(tag, 'content');
    if (!key || !content) continue;
    if (key === 'og:image:secure_url') candidates.secure.push(content);
    if (key === 'og:image') candidates.openGraph.push(content);
    if (key === 'twitter:image') candidates.twitter.push(content);
  }

  for (const candidate of [...candidates.secure, ...candidates.openGraph, ...candidates.twitter]) {
    try {
      const imageUrl = new URL(candidate, pageUrl).toString();
      if (isAllowedPreviewUrl(imageUrl)) return imageUrl;
    } catch {
      // Ignore malformed source metadata and continue searching.
    }
  }
  return null;
}

async function isSafeImageUrl(url: string, dependencies: PreviewResolverDependencies): Promise<boolean> {
  const result = await requestWithSafeRedirects(
    url,
    { Accept: 'image/*', Range: `bytes=0-${IMAGE_PROBE_BYTES - 1}`, 'User-Agent': USER_AGENT },
    dependencies
  );
  if (!result) return false;
  try {
    if (
      result.response.status < 200 ||
      result.response.status >= 300 ||
      header(result.response.headers, 'content-type')?.toLowerCase().startsWith('image/') !== true ||
      !contentLengthWithinLimit(result.response, MAX_IMAGE_BYTES)
    ) {
      return false;
    }

    const chunks: Uint8Array[] = [];
    let size = 0;
    for await (const chunk of result.response.body) {
      chunks.push(chunk);
      size += chunk.byteLength;
      if (size >= 12 || size > IMAGE_PROBE_BYTES) break;
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    const isPng = [0x89, 0x50, 0x4e, 0x47].every((value, index) => bytes[index] === value);
    const isGif = String.fromCharCode(...bytes.slice(0, 6)) === 'GIF87a' || String.fromCharCode(...bytes.slice(0, 6)) === 'GIF89a';
    const isWebp = String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
    const isAvif = String.fromCharCode(...bytes.slice(4, 8)) === 'ftyp' && ['avif', 'avis'].includes(String.fromCharCode(...bytes.slice(8, 12)));
    return isJpeg || isPng || isGif || isWebp || isAvif;
  } finally {
    result.response.destroy();
  }
}

export function createPreviewResolver(
  dependencies: PreviewResolverDependencies = { resolve: defaultResolve, request: defaultRequest }
) {
  return {
    async resolveOpenGraphPreview(pageUrl: string): Promise<string | null> {
      try {
        const result = await requestWithSafeRedirects(
          pageUrl,
          { Accept: 'text/html,application/xhtml+xml', 'User-Agent': USER_AGENT },
          dependencies
        );
        if (!result) return null;
        const contentType = header(result.response.headers, 'content-type')?.toLowerCase() ?? '';
        if (
          result.response.status < 200 ||
          result.response.status >= 300 ||
          !(contentType.includes('text/html') || contentType.includes('application/xhtml+xml'))
        ) {
          result.response.destroy();
          return null;
        }

        const html = await readHtmlHead(result.response);
        const imageUrl = html ? extractOpenGraphImage(html, result.url.toString()) : null;
        return imageUrl && (await isSafeImageUrl(imageUrl, dependencies)) ? imageUrl : null;
      } catch {
        return null;
      }
    },
  };
}

export async function resolveOpenGraphPreview(pageUrl: string): Promise<string | null> {
  return createPreviewResolver().resolveOpenGraphPreview(pageUrl);
}

export async function resolveSignalPreviews(candidates: SignalItem[]): Promise<SignalItem[]> {
  const resolver = createPreviewResolver();
  const resolved: SignalItem[] = [];
  for (const candidate of candidates) {
    if (candidate.image || !candidate.url) {
      resolved.push(candidate);
      continue;
    }
    const image = await resolver.resolveOpenGraphPreview(candidate.url);
    resolved.push(image ? { ...candidate, image } : candidate);
  }
  return resolved;
}
