/** @vitest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import WriteupRow from './WriteupRow';
import { getContent } from '@/lib/content';

vi.mock('@/lib/content', () => ({
  getContent: vi.fn(),
}));

describe('WriteupRow', () => {
  it('renders Coming soon and compact padding when empty', () => {
    vi.mocked(getContent).mockReturnValue([]);
    const { container } = render(<WriteupRow />);
    
    // Assert archive href
    const archiveLinks = screen.getAllByRole('link', { name: /writeups/i });
    expect(archiveLinks.length).toBeGreaterThan(0);
    expect(archiveLinks[0].getAttribute('href')).toBe('/writeups');
    
    const viewAll = screen.getByRole('link', { name: 'View all writeups' });
    expect(viewAll.getAttribute('href')).toBe('/writeups');

    expect(screen.getByText('Coming soon.')).toBeDefined();
    
    // Compact padding
    const section = container.querySelector('section');
    expect(section?.className).toContain('py-10 md:py-12');
    expect(section?.className).not.toContain('py-16 md:py-20');
  });

  it('renders populated detail links and normal padding', () => {
    vi.mocked(getContent).mockReturnValue([
      { slug: 'test-writeup', title: 'Test Writeup', date: '2026-08-23', tags: ['Test'] } as ReturnType<typeof getContent<'writeups'>>[number]
    ]);
    const { container } = render(<WriteupRow />);
    
    const detailLink = screen.getByRole('link', { name: 'Test Writeup' });
    expect(detailLink.getAttribute('href')).toBe('/writeups/test-writeup');
    
    const section = container.querySelector('section');
    expect(section?.className).toContain('py-16 md:py-20');
    expect(section?.className).not.toContain('py-10 md:py-12');
  });
});
