/** @vitest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ArtPreview from './ArtPreview';
import { getContent } from '@/lib/content';

vi.mock('@/lib/content', () => ({
  getContent: vi.fn(),
}));

describe('ArtPreview', () => {
  it('renders Coming soon and compact padding when empty', () => {
    vi.mocked(getContent).mockReturnValue([]);
    const { container } = render(<ArtPreview />);
    
    const archiveLinks = screen.getAllByRole('link', { name: /art/i });
    expect(archiveLinks.length).toBeGreaterThan(0);
    expect(archiveLinks[0].getAttribute('href')).toBe('/art');
    
    const viewAll = screen.getByRole('link', { name: 'View all art' });
    expect(viewAll.getAttribute('href')).toBe('/art');

    expect(screen.getByText('Coming soon.')).toBeDefined();
    
    const section = container.querySelector('section');
    expect(section?.className).toContain('py-10 md:py-12');
  });

  it('renders populated detail links and normal padding', () => {
    vi.mocked(getContent).mockReturnValue([
      { slug: 'test-art', title: 'Test Art', media: [{ src: 'test.jpg', alt: 'Test' }] } as ReturnType<typeof getContent<'art'>>[number]
    ]);
    const { container } = render(<ArtPreview />);
    
    const detailLink = container.querySelector('a[href="/art/test-art"]');
    expect(detailLink).not.toBeNull();
    
    const section = container.querySelector('section');
    expect(section?.className).toContain('py-16 md:py-20');
  });
});
