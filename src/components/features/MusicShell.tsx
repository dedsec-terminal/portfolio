/*
  MusicShell — ambient personal detail, not a feature.
  Extremely compact. No Spotify API, no playback, no auth.
  Static shell only. Real integration is a later phase.
*/

export default function MusicShell() {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 border border-border/30 rounded-sm max-w-xs"
      aria-label="Currently listening — music placeholder"
    >
      {/* Album art placeholder */}
      <div
        className="w-8 h-8 shrink-0 bg-surface-raised border border-border/30 rounded-sm flex items-center justify-center"
        aria-hidden="true"
      >
        {/* Static waveform bars */}
        <div className="flex items-end gap-0.5 h-4">
          {[3, 5, 7, 4, 6].map((height, i) => (
            <div
              key={i}
              className="w-0.5 bg-accent/60 rounded-full"
              style={{
                height: `${height * 2}px`,
                transformOrigin: 'bottom',
                animation: `waveBar ${600 + i * 100}ms ease-in-out ${i * 80}ms infinite alternate`,
              }}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>

      {/* Track info */}
      <div className="min-w-0">
        <p className="text-[11px] text-muted leading-none mb-0.5 truncate">
          currently listening
        </p>
        <p className="text-xs text-foreground/80 leading-none truncate font-medium">
          —
        </p>
      </div>

      <style>{`
        @keyframes waveBar {
          from { transform: scaleY(0.3); opacity: 0.4; }
          to   { transform: scaleY(1.0); opacity: 0.9; }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="waveBar"] { animation: none !important; transform: scaleY(0.6) !important; }
        }
      `}</style>
    </div>
  );
}
