/*
  SignalShell — Phase 2 visual placeholder.

  Communicates: constellation · discovery · mystery · subtle movement.

  Deliberately does NOT show:
  - PERSONAL / CURATED / CHAOTIC labels
  - tier classifications
  - data source taxonomy
  - dashboard chrome
  - cybersecurity UI patterns

  The visitor should perceive something intriguing without
  understanding its underlying structure.

  All geometry is static — no external data, no API calls.
  Animation respects prefers-reduced-motion via CSS variable.
*/

/* ── Static constellation geometry ──────────────────────────────────── */

interface Node {
  id: string;
  cx: number;
  cy: number;
  r: number;
  opacity: number;
  delay: number;
}

interface Edge {
  from: string;
  to: string;
  opacity: number;
}

const NODES: Node[] = [
  { id: 'n0',  cx: 180, cy: 90,  r: 3.5, opacity: 0.9, delay: 0    },
  { id: 'n1',  cx: 340, cy: 55,  r: 2.5, opacity: 0.6, delay: 400  },
  { id: 'n2',  cx: 490, cy: 130, r: 4.0, opacity: 0.8, delay: 800  },
  { id: 'n3',  cx: 620, cy: 80,  r: 2.0, opacity: 0.5, delay: 200  },
  { id: 'n4',  cx: 730, cy: 170, r: 3.0, opacity: 0.7, delay: 1000 },
  { id: 'n5',  cx: 120, cy: 220, r: 2.0, opacity: 0.4, delay: 600  },
  { id: 'n6',  cx: 270, cy: 190, r: 3.0, opacity: 0.7, delay: 300  },
  { id: 'n7',  cx: 420, cy: 240, r: 2.5, opacity: 0.6, delay: 700  },
  { id: 'n8',  cx: 570, cy: 200, r: 2.0, opacity: 0.5, delay: 500  },
  { id: 'n9',  cx: 690, cy: 280, r: 3.5, opacity: 0.8, delay: 900  },
  { id: 'n10', cx: 210, cy: 310, r: 2.0, opacity: 0.4, delay: 1100 },
  { id: 'n11', cx: 380, cy: 340, r: 2.5, opacity: 0.6, delay: 150  },
  { id: 'n12', cx: 510, cy: 290, r: 1.5, opacity: 0.4, delay: 850  },
  { id: 'n13', cx: 650, cy: 360, r: 2.0, opacity: 0.5, delay: 450  },
  { id: 'n14', cx: 760, cy: 320, r: 1.5, opacity: 0.35, delay: 650 },
  { id: 'n15', cx: 90,  cy: 340, r: 1.5, opacity: 0.3, delay: 1200 },
  { id: 'n16', cx: 310, cy: 380, r: 3.0, opacity: 0.7, delay: 250  },
  { id: 'n17', cx: 450, cy: 380, r: 1.5, opacity: 0.4, delay: 950  },
  { id: 'n18', cx: 600, cy: 410, r: 2.0, opacity: 0.5, delay: 350  },
  { id: 'n19', cx: 750, cy: 430, r: 1.5, opacity: 0.3, delay: 750  },
];

const EDGES: Edge[] = [
  { from: 'n0',  to: 'n1',  opacity: 0.15 },
  { from: 'n0',  to: 'n6',  opacity: 0.20 },
  { from: 'n1',  to: 'n2',  opacity: 0.12 },
  { from: 'n2',  to: 'n3',  opacity: 0.10 },
  { from: 'n2',  to: 'n7',  opacity: 0.15 },
  { from: 'n3',  to: 'n4',  opacity: 0.12 },
  { from: 'n4',  to: 'n9',  opacity: 0.18 },
  { from: 'n5',  to: 'n6',  opacity: 0.10 },
  { from: 'n5',  to: 'n10', opacity: 0.08 },
  { from: 'n6',  to: 'n7',  opacity: 0.15 },
  { from: 'n6',  to: 'n11', opacity: 0.12 },
  { from: 'n7',  to: 'n8',  opacity: 0.10 },
  { from: 'n7',  to: 'n12', opacity: 0.08 },
  { from: 'n8',  to: 'n9',  opacity: 0.12 },
  { from: 'n9',  to: 'n13', opacity: 0.15 },
  { from: 'n9',  to: 'n14', opacity: 0.08 },
  { from: 'n10', to: 'n16', opacity: 0.10 },
  { from: 'n11', to: 'n16', opacity: 0.15 },
  { from: 'n11', to: 'n17', opacity: 0.10 },
  { from: 'n12', to: 'n17', opacity: 0.08 },
  { from: 'n13', to: 'n18', opacity: 0.12 },
  { from: 'n16', to: 'n17', opacity: 0.12 },
  { from: 'n18', to: 'n19', opacity: 0.08 },
];

function getNode(id: string): Node {
  return NODES.find((n) => n.id === id)!;
}

export default function SignalShell() {
  return (
    <section aria-label="Signal" className="py-24 md:py-32 border-t border-border/30">
      <div className="max-w-7xl mx-auto px-6 md:px-12">

        {/* Section header — restrained */}
        <div className="mb-12 flex items-baseline gap-3">
          <span className="font-mono text-xs text-subtle tracking-[0.2em] uppercase">
            Signal
          </span>
          <div className="flex-1 h-px bg-border/30 max-w-12" aria-hidden="true" />
        </div>

        {/* Constellation SVG */}
        <div
          className="relative overflow-hidden"
          style={{ borderTop: '1px solid color-mix(in srgb, var(--border) 25%, transparent)' }}
        >
          <svg
            viewBox="0 0 880 480"
            aria-label="Signal constellation — a visual map of curated discoveries"
            role="img"
            className="w-full"
            style={{ maxHeight: '420px' }}
          >
            {/* Subtle vignette gradient */}
            <defs>
              <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="100%" stopColor="var(--background)" stopOpacity="0.6" />
              </radialGradient>

              {/* Node glow filter */}
              <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* ── Edges ──────────────────────────────────────────────── */}
            <g aria-hidden="true">
              {EDGES.map(({ from, to, opacity }) => {
                const a = getNode(from);
                const b = getNode(to);
                return (
                  <line
                    key={`${from}-${to}`}
                    x1={a.cx}
                    y1={a.cy}
                    x2={b.cx}
                    y2={b.cy}
                    stroke="#3b82f6"
                    strokeOpacity={opacity}
                    strokeWidth={0.5}
                  />
                );
              })}
            </g>

            {/* ── Nodes ──────────────────────────────────────────────── */}
            <g aria-hidden="true">
              {NODES.map((node) => (
                <g key={node.id}>
                  {/* Pulse ring — larger nodes only */}
                  {node.r >= 3 && (
                    <circle
                      cx={node.cx}
                      cy={node.cy}
                      r={node.r + 4}
                      fill="none"
                      stroke="#3b82f6"
                      strokeOpacity={0.12}
                      strokeWidth={0.5}
                      style={{
                        animation: `nodeBreath ${1800 + node.delay}ms ease-in-out ${node.delay}ms infinite alternate`,
                      }}
                    />
                  )}
                  {/* Main dot */}
                  <circle
                    cx={node.cx}
                    cy={node.cy}
                    r={node.r}
                    fill="#3b82f6"
                    fillOpacity={node.opacity}
                    filter={node.r >= 3 ? 'url(#nodeGlow)' : undefined}
                    style={{
                      animation: `nodeBreath ${1600 + node.delay}ms ease-in-out ${node.delay}ms infinite alternate`,
                    }}
                  />
                </g>
              ))}
            </g>

            {/* Vignette overlay */}
            <rect
              x="0" y="0"
              width="880" height="480"
              fill="url(#vignette)"
              aria-hidden="true"
            />
          </svg>

          {/* CSS animations — scoped to this section */}
          <style>{`
            @keyframes nodeBreath {
              from { opacity: 0.4; }
              to   { opacity: 1.0; }
            }
            @media (prefers-reduced-motion: reduce) {
              circle { animation: none !important; }
            }
          `}</style>
        </div>

        {/* Subtle invitation to explore */}
        <div className="mt-8 flex items-center justify-between">
          <p className="text-xs text-subtle max-w-sm leading-relaxed">
            A living map of what&apos;s been found, saved, returned to.
          </p>
          <a
            href="/signal"
            className="text-xs font-mono text-subtle hover:text-muted transition-colors duration-200 tracking-wider uppercase"
          >
            Explore ↗
          </a>
        </div>
      </div>
    </section>
  );
}
