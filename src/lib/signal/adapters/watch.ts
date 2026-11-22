import type { SignalItem, SignalSourceAdapter } from '../types';

const WATCH = [
  {
    id: 'watch-playtime',
    title: 'PlayTime',
    description: 'Jacques Tati follows Monsieur Hulot through a glass-and-steel Paris, hiding visual gags across the wide frame.',
    url: 'https://www.criterion.com/films/651',
    source: 'The Criterion Collection',
    category: 'Film',
  },
  {
    id: 'watch-koyaanisqatsi',
    title: 'Koyaanisqatsi',
    description: 'Godfrey Reggio pairs time-lapse images of landscapes and cities with a Philip Glass score in a film without dialogue.',
    url: 'https://www.criterion.com/films/28034-koyaanisqatsi',
    source: 'The Criterion Collection',
    category: 'Documentary',
  },
  {
    id: 'watch-city-of-gold',
    title: 'City of Gold',
    description: 'Archival photographs of the Klondike gold rush sit alongside footage of a quieter Dawson City.',
    url: 'https://www.nfb.ca/film/city_of_gold/',
    source: 'National Film Board of Canada',
    category: 'Documentary',
  },
  {
    id: 'watch-universe',
    title: 'Universe',
    description: 'Roman Kroitor and Colin Low use animation to imagine a voyage past the Moon and beyond the Milky Way.',
    url: 'https://www.nfb.ca/film/universe/',
    source: 'National Film Board of Canada',
    category: 'Documentary',
  },
  {
    id: 'watch-neighbours',
    title: 'Neighbours',
    description: 'Norman McLaren uses pixilation to stage a quarrel over a flower between two neighbours.',
    url: 'https://www.nfb.ca/film/neighbours_voisins/',
    source: 'National Film Board of Canada',
    category: 'Short film',
  },
  {
    id: 'watch-fourier-transform',
    title: 'But what is the Fourier Transform?',
    description: '3Blue1Brown draws the transform as a signal wound around a circle, making its frequencies easier to see.',
    url: 'https://www.youtube.com/watch?v=spUNpyF58BY',
    image: 'https://i.ytimg.com/vi/spUNpyF58BY/hqdefault.jpg',
    source: '3Blue1Brown',
    category: 'YouTube video',
  },
  {
    id: 'watch-unfolding-webb',
    title: 'Unfolding the Universe with Webb',
    description: 'Astronomers working with the James Webb Space Telescope explain how it gathers images and data.',
    url: 'https://www.youtube.com/watch?v=BHBKcRlDiLw',
    image: 'https://i.ytimg.com/vi/BHBKcRlDiLw/hqdefault.jpg',
    source: 'NASA',
    category: 'YouTube video',
  },
  {
    id: 'watch-single-story',
    title: 'The danger of a single story',
    description: 'Chimamanda Ngozi Adichie uses experiences from her own life to explore what happens when one story defines a place or people.',
    url: 'https://www.ted.com/talks/chimamanda_ngozi_adichie_the_danger_of_a_single_story',
    source: 'TED',
    category: 'Talk',
  },
  {
    id: 'watch-sofia-the-city',
    title: 'Sofia the city, not the girl',
    description: 'cemeteryf0g and Isaac Haan take their cameras around Sofia, Bulgaria.',
    url: 'https://www.youtube.com/watch?v=7z65oJ_xYVU',
    image: 'https://i.ytimg.com/vi/7z65oJ_xYVU/hqdefault.jpg',
    source: 'cemeteryf0g',
    category: 'YouTube video',
  },
];

export class WatchCatalogueAdapter implements SignalSourceAdapter {
  id = 'watch-catalogue';
  tier = 'Curated' as const;
  weight = 0.9;

  async fetchCandidates(): Promise<SignalItem[]> {
    return WATCH.map((item) => ({ ...item, slot: 'screen', tier: this.tier }));
  }
}
