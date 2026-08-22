# Music Experience

The portfolio music experience is a dedicated, **local-only** audio player.

The implementation relies entirely on a curated local catalogue, providing a robust, private, and zero-dependency playback experience.

## Architecture

The music architecture consists of three layers:

1. **Catalogue (`src/content/music/catalogue.json`)**: The single source of truth defining the available tracks.
2. **Controller (`src/components/features/music/MusicProvider.tsx`)**: A React Context provider that mounts at the App Router layout level. It wraps a single native `HTMLAudioElement` to manage state, handle circular queuing, and persist audio across client-side route navigation.
3. **UI Components**:
   - `MusicShell.tsx`: The compact trigger component sitting near the hero.
   - `ExpandedPlayer.tsx`: The detailed player containing track info, Radix Slider for seeking, and an "Up Next" queue.

## Playback Behavior

- **No Autoplay**: By strict policy, audio never begins automatically on initial load or route change. The user must explicitly press Play.
- **Persistent Playback**: Once started, playback persists uninterrupted across internal route navigation.
- **Circular Queue**: The catalogue acts as an infinite, circular queue (`A → B → C → A`).
  - When a track naturally ends, the next track automatically plays.
  - When the final track ends, it wraps to the beginning of the catalogue.
- **Bounded Error Skipping**: If an audio file is missing or broken, the provider gracefully skips it and attempts the next track. If all tracks fail, playback safely stops to prevent infinite loops.

## How to Add Music

The personal catalogue is configured in `src/content/music/catalogue.json`.
To add a new track, follow this precise workflow:

1. **Place authorized file in**: `public/audio/` (Supported: `.mp3`, `.wav`, `.aac`, `.flac`)
2. **Prefer URL-safe filename**: lowercase ASCII kebab-case (e.g. `track-name.flac`)
3. **Optional artwork**: Place compressed `.webp` or `.jpg` square artwork in `public/images/music/`
4. **Add metadata to**: `src/content/music/catalogue.json`
5. **Keep catalogue order** equal to desired playback order.
6. **Run validation** via `npm run typecheck && npm run test && npm run build`

**Example Catalogue Entry**:

```json
{
  "id": "track-id",
  "title": "Original Display Title",
  "artist": "Artist",
  "album": "Album",
  "artwork": "/images/music/cover.webp",
  "audioSource": "/audio/track-name.flac"
}
```

**Usage Notes:**
- `.flac` is supported through native browser playback.
- Browser/device decoding support can vary for FLAC files.
- Failed tracks (due to unsupported codecs or missing files) use normal queue error recovery and seamlessly skip to the next valid track.

## Accessibility & Reduced Motion

- All buttons and sliders use accessible Radix primitives and ARIA attributes for full keyboard navigation (Tab/Shift+Tab, arrow keys for seeking).
- The `ExpandedPlayer` popover can be dismissed gracefully with the `Escape` key.
- Unnecessary animations (e.g., waveform visualizer scaling) are disabled when the user's OS specifies `prefers-reduced-motion`.
