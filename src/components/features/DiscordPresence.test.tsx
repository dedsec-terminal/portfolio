/**
 * @vitest-environment jsdom
 */
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import DiscordPresence from './DiscordPresence';
import * as useLanyardModule from 'use-lanyard';
import { siteConfig } from '../../lib/site';

// Mock use-lanyard
vi.mock('use-lanyard', () => ({
  useLanyard: vi.fn(),
}));

// Mock siteConfig
vi.mock('../../lib/site', () => ({
  siteConfig: {
    discordId: '123456789012345678', // Default for tests
  },
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ''} />;
  },
}));

describe('DiscordPresence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset discordId
    siteConfig.discordId = '123456789012345678';
  });

  afterEach(() => {
    cleanup();
  });

  it('renders unavailable state when discordId is missing', () => {
    siteConfig.discordId = '';
    render(<DiscordPresence />);
    expect(screen.getByText('Presence Unavailable')).toBeDefined();
  });

  it('renders loading state when presence data is undefined', () => {
    vi.spyOn(useLanyardModule, 'useLanyard').mockReturnValue(undefined);
    render(<DiscordPresence />);
    expect(screen.getByText('Connecting...')).toBeDefined();
  });

  const basePresence = {
    discord_user: {
      id: '123',
      username: 'swaraj',
      avatar: 'avatar_hash',
      discriminator: '0',
      bot: false,
      global_name: 'Swaraj Singh',
      display_name: 'Swaraj',
      public_flags: 0,
    },
    activities: [],
    discord_status: 'online',
    active_on_discord_web: false,
    active_on_discord_desktop: true,
    active_on_discord_mobile: false,
    listening_to_spotify: false,
    spotify: null,
  };

  it('renders offline state correctly', () => {
    vi.spyOn(useLanyardModule, 'useLanyard').mockReturnValue({
      ...basePresence, discord_status: 'offline'
    } as unknown as ReturnType<typeof useLanyardModule.useLanyard>);
    render(<DiscordPresence />);
    expect(screen.getByText('Swaraj Singh')).toBeDefined();
    expect(screen.getByText('Offline')).toBeDefined();
    // Activity should not be shown when offline
  });

  it('renders online state correctly', () => {
    vi.spyOn(useLanyardModule, 'useLanyard').mockReturnValue({
      ...basePresence, discord_status: 'online'
    } as unknown as ReturnType<typeof useLanyardModule.useLanyard>);
    render(<DiscordPresence />);
    expect(screen.getByText('Swaraj Singh')).toBeDefined();
    expect(screen.getByText('Active')).toBeDefined();
  });

  it('renders idle state correctly', () => {
    vi.spyOn(useLanyardModule, 'useLanyard').mockReturnValue({
      ...basePresence, discord_status: 'idle'
    } as unknown as ReturnType<typeof useLanyardModule.useLanyard>);
    render(<DiscordPresence />);
    expect(screen.getByText('Swaraj Singh')).toBeDefined();
  });

  it('renders dnd state correctly', () => {
    vi.spyOn(useLanyardModule, 'useLanyard').mockReturnValue({
      ...basePresence, discord_status: 'dnd'
    } as unknown as ReturnType<typeof useLanyardModule.useLanyard>);
    render(<DiscordPresence />);
    expect(screen.getByText('Swaraj Singh')).toBeDefined();
  });

  it('renders custom activity when present', () => {
    vi.spyOn(useLanyardModule, 'useLanyard').mockReturnValue({
      ...basePresence,
      activities: [
        { type: 4, name: 'Custom Status', state: 'Coding', id: 'custom', created_at: 1 },
      ],
    } as unknown as ReturnType<typeof useLanyardModule.useLanyard>);
    render(<DiscordPresence />);
    expect(screen.getByText('Coding')).toBeDefined();
  });

  it('renders game activity when present', () => {
    vi.spyOn(useLanyardModule, 'useLanyard').mockReturnValue({
      ...basePresence,
      activities: [
        { type: 0, name: 'VS Code', id: 'game', created_at: 1 },
      ],
    } as unknown as ReturnType<typeof useLanyardModule.useLanyard>);
    render(<DiscordPresence />);
    expect(screen.getByText('VS Code')).toBeDefined();
    expect(screen.getByText(/Playing/)).toBeDefined();
  });

  it('renders Spotify metadata when present', () => {
    vi.spyOn(useLanyardModule, 'useLanyard').mockReturnValue({
      ...basePresence,
      spotify: {
        track_id: '123',
        timestamps: { start: 1, end: 2 },
        album: 'Album Name',
        album_art_url: 'url',
        artist: 'Artist Name',
        song: 'Song Name',
      },
    } as unknown as ReturnType<typeof useLanyardModule.useLanyard>);
    render(<DiscordPresence />);
    expect(screen.getByText('Song Name')).toBeDefined();
    expect(screen.getByText('by Artist Name')).toBeDefined();
  });

  it('does not crash if Spotify is absent', () => {
    vi.spyOn(useLanyardModule, 'useLanyard').mockReturnValue({
      ...basePresence, spotify: null
    } as unknown as ReturnType<typeof useLanyardModule.useLanyard>);
    const { container } = render(<DiscordPresence />);
    expect(container).toBeDefined();
  });
});
