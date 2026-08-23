/** @vitest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import JournalTeaser from './JournalTeaser';
import { getContent } from '@/lib/content';

vi.mock('@/lib/content', () => ({
  getContent: vi.fn(),
}));

describe('JournalTeaser', () => {
  it('renders Coming soon and compact padding when empty', () => {
    vi.mocked(getContent).mockReturnValue([]);
    const { container } = render(<JournalTeaser />);
    
    const archiveLinks = screen.getAllByRole('link', { name: /journal/i });
    expect(archiveLinks.length).toBeGreaterThan(0);
    expect(archiveLinks[0].getAttribute('href')).toBe('/journal');
    
    const viewAll = screen.getByRole('link', { name: 'View all journal entries' });
    expect(viewAll.getAttribute('href')).toBe('/journal');

    expect(screen.getByText('Coming soon.')).toBeDefined();
    
    const section = container.querySelector('section');
    expect(section?.className).toContain('py-10 md:py-12');
  });

  it('renders populated detail links and normal padding', () => {
    vi.mocked(getContent).mockReturnValue([
      { slug: 'test-journal', title: 'Test Journal', date: '2026-08-23', tags: ['Test'], description: 'desc' } as ReturnType<typeof getContent<'journal'>>[number]
    ]);
    const { container } = render(<JournalTeaser />);
    
    const detailLink = screen.getByRole('link', { name: /Test Journal/ });
    expect(detailLink.getAttribute('href')).toBe('/journal/test-journal');
    
    const section = container.querySelector('section');
    expect(section?.className).toContain('py-16 md:py-20');
  });
});
