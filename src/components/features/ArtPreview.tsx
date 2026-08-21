/*
  ArtPreview — personal corner of the site.
  Placeholder tiles for visual material (anime, photography, etc).
  Not a professional project gallery — the aesthetic should feel
  personal and exploratory rather than portfolio-polished.

  Used inside the "Personal" section on the homepage.
*/

const placeholderTiles = [
  { id: 'a', label: 'Visual 01', hue: '220deg 15% 14%' },
  { id: 'b', label: 'Visual 02', hue: '230deg 12% 16%' },
  { id: 'c', label: 'Visual 03', hue: '215deg 18% 12%' },
];

export default function ArtPreview() {
  return (
    <div>
      <div className="mb-6 flex items-baseline gap-3">
        <span className="font-mono text-xs text-subtle tracking-[0.2em] uppercase">
          Art &amp; Media
        </span>
        <div className="flex-1 h-px bg-border/30 max-w-12" aria-hidden="true" />
      </div>

      <div className="grid grid-cols-3 gap-px bg-border/20">
        {placeholderTiles.map(({ id, label, hue }) => (
          <div
            key={id}
            className="aspect-square flex items-end p-3"
            style={{ background: `hsl(${hue})` }}
            role="img"
            aria-label={`${label} — art placeholder`}
          >
            <span
              className="font-mono text-[9px] text-subtle/60 tracking-wider uppercase"
              aria-hidden="true"
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-subtle">
        Visual material, interests, and personal discoveries — arriving later.
      </p>
    </div>
  );
}
