import { SignalSourceAdapter, SignalItem } from '../types';

const WORDS: SignalItem[] = [
  {
    id: 'words-dickinson-tell-truth',
    title: 'Tell all the truth but tell it slant —',
    description: 'Emily Dickinson turns indirectness into a way of making difficult truth bearable.',
    url: 'https://www.poetryfoundation.org/poems/56824/tell-all-the-truth-but-tell-it-slant-1263',
    source: 'Emily Dickinson', category: 'Poem', slot: 'words', tier: 'Curated',
  },
  {
    id: 'words-whitman-multitudes',
    title: 'I contain multitudes.',
    description: 'Walt Whitman allows contradiction to become evidence of a life large enough to change.',
    url: 'https://www.poetryfoundation.org/poems/45477/song-of-myself-1892-version',
    source: 'Walt Whitman', category: 'Poem', slot: 'words', tier: 'Curated',
  },
  {
    id: 'words-shelley-ozymandias',
    title: 'Look on my Works, ye Mighty, and despair!',
    description: 'In Ozymandias, the boast survives only to frame the emptiness around it.',
    url: 'https://www.poetryfoundation.org/poems/46565/ozymandias',
    source: 'Percy Bysshe Shelley', category: 'Poem', slot: 'words', tier: 'Curated',
  },
  {
    id: 'words-donne-island',
    title: 'No man is an island',
    description: 'John Donne compresses human interdependence into an image that still feels immediate.',
    url: 'https://en.wikisource.org/wiki/Devotions_upon_Emergent_Occasions/Meditation_17',
    source: 'John Donne', category: 'Line', slot: 'words', tier: 'Curated',
  },
  {
    id: 'words-blake-world-grain',
    title: 'To see a World in a Grain of Sand',
    description: 'William Blake begins with the radical idea that scale depends on attention.',
    url: 'https://www.poetryfoundation.org/poems/43650/auguries-of-innocence',
    source: 'William Blake', category: 'Poem', slot: 'words', tier: 'Curated',
  },
  {
    id: 'words-frost-woods',
    title: 'The woods are lovely, dark and deep',
    description: 'Robert Frost holds the desire to disappear beside the obligation to continue.',
    url: 'https://www.poetryfoundation.org/poems/42891/stopping-by-woods-on-a-snowy-evening',
    source: 'Robert Frost', category: 'Poem', slot: 'words', tier: 'Curated',
  },
  {
    id: 'words-keats-negative-capability',
    title: 'Negative capability',
    description: 'Keats names the capacity to remain inside uncertainty without forcing a tidy answer.',
    url: 'https://www.poetryfoundation.org/articles/69384/selections-from-keatss-letters',
    source: 'John Keats', category: 'Idea', slot: 'words', tier: 'Curated',
  },
  {
    id: 'words-emerson-doing',
    title: 'What you do speaks so loudly',
    description: 'A line associated with Emerson that asks conduct to carry more weight than presentation.',
    url: 'https://en.wikiquote.org/wiki/Ralph_Waldo_Emerson',
    source: 'Ralph Waldo Emerson', category: 'Quote', slot: 'words', tier: 'Curated',
  },
];

export class WordsAdapter implements SignalSourceAdapter {
  id = 'words';
  tier = 'Curated' as const;
  weight = 0.7;

  async fetchCandidates(): Promise<SignalItem[]> {
    return WORDS;
  }
}
