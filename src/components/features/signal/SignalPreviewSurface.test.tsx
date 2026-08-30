// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { SignalDayType } from '@/lib/signal/schemas';
import SignalCollage from './SignalCollage';
import SignalPreviewSurface from './SignalPreviewSurface';

function node(image?: string): SignalDayType['nodes'][number] {
  return {
    id: 'preview-test',
    title: 'A visible title',
    description: 'A deliberately testable Signal item.',
    url: 'https://example.com/item',
    source: 'Test source',
    category: 'Website',
    slot: 'website',
    tier: 'Curated',
    image,
    x: 0,
    y: 0,
    r: 2,
  };
}

describe('SignalPreviewSurface', () => {
  afterEach(cleanup);

  it('renders adapter or resolved Open Graph imagery when present', () => {
    render(<SignalPreviewSurface node={node('https://cdn.example.com/preview.jpg')} />);
    expect(screen.getByTestId('signal-preview-image').getAttribute('src')).toBe('https://cdn.example.com/preview.jpg');
    expect(screen.getByTestId('signal-preview-fallback')).toBeTruthy();
  });

  it('uses the designed fallback without an image and after an image load failure', () => {
    const withoutImage = render(<SignalPreviewSurface node={node()} />);
    expect(withoutImage.queryByTestId('signal-preview-image')).toBeNull();
    expect(withoutImage.getByTestId('signal-preview-fallback')).toBeTruthy();
    withoutImage.unmount();

    render(<SignalPreviewSurface node={node('https://cdn.example.com/missing.jpg')} />);
    fireEvent.error(screen.getByTestId('signal-preview-image'));
    expect(screen.queryByTestId('signal-preview-image')).toBeNull();
    expect(screen.getByTestId('signal-preview-fallback')).toBeTruthy();
  });

  it('keeps the readable title layer in the collage', () => {
    const data: SignalDayType = {
      date: '2026-08-30',
      seed: 'preview-test',
      generatorVersion: 'v2.0.0',
      nodes: [
        node('https://cdn.example.com/preview.jpg'),
        { ...node(), id: 'artwork', slot: 'artwork', title: 'Visible artwork' },
        { ...node(), id: 'frontier', slot: 'frontier' },
        { ...node(), id: 'screen', slot: 'screen' },
        { ...node(), id: 'reading', slot: 'reading' },
        { ...node(), id: 'words', slot: 'words' },
      ],
    };
    render(<SignalCollage data={data} />);
    expect(screen.getAllByRole('heading', { name: 'A visible title' })).toHaveLength(5);
  });
});
