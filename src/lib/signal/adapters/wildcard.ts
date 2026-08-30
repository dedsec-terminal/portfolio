import { SignalSourceAdapter, SignalItem } from '../types';

export class WildcardAdapter implements SignalSourceAdapter {
  id = 'wildcard';
  tier = 'Discovery' as const;
  weight = 0.3;

  async fetchCandidates(): Promise<SignalItem[]> {
    // A small editorial shelf keeps the website slot alive when live sources fail.
    return [
      {
        id: 'website-radio-garden',
        title: 'Radio Garden',
        description: 'Spin a globe and tune into live radio stations around the world.',
        url: 'https://radio.garden/',
        source: 'Editorial shelf',
        category: 'Website',
        slot: 'website',
        tier: this.tier,
      },
      {
        id: 'website-earth-nullschool',
        title: 'earth.nullschool.net',
        description: 'An animated map of global weather, ocean, and atmospheric conditions.',
        url: 'https://earth.nullschool.net/',
        source: 'Editorial shelf',
        category: 'Website',
        slot: 'website',
        tier: this.tier,
      },
      {
        id: 'website-window-swap',
        title: 'WindowSwap',
        description: 'Look through recorded windows from homes in places far from your own.',
        url: 'https://www.window-swap.com/',
        source: 'Editorial shelf',
        category: 'Website',
        slot: 'website',
        tier: this.tier,
      },
      {
        id: 'website-mapcrunch',
        title: 'MapCrunch',
        description: 'Drop into a random Street View location and explore without an itinerary.',
        url: 'https://www.mapcrunch.com/',
        source: 'Editorial shelf',
        category: 'Website',
        slot: 'website',
        tier: this.tier,
      },
      {
        id: 'website-neal-fun',
        title: 'Neal.fun',
        description: 'A collection of playful interactive explainers, simulations, and internet experiments.',
        url: 'https://neal.fun/',
        source: 'Editorial shelf',
        category: 'Website',
        slot: 'website',
        tier: this.tier,
      },
      {
        id: 'website-music-map',
        title: 'Music-Map',
        description: 'Enter an artist and explore a spatial map of musically adjacent artists.',
        url: 'https://www.music-map.com/',
        source: 'Editorial shelf',
        category: 'Website',
        slot: 'website',
        tier: this.tier,
      },
      {
        id: 'website-old-maps-online',
        title: 'Old Maps Online',
        description: 'Search historical maps by moving through geography and time.',
        url: 'https://www.oldmapsonline.org/',
        source: 'Editorial shelf',
        category: 'Website',
        slot: 'website',
        tier: this.tier,
      },
      {
        id: 'website-internet-archive',
        title: 'Internet Archive',
        description: 'A nonprofit library preserving books, software, audio, video, and the web itself.',
        url: 'https://archive.org/',
        source: 'Editorial shelf',
        category: 'Website',
        slot: 'website',
        tier: this.tier,
      },
    ];
  }
}
