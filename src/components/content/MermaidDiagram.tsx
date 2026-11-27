import type { ReactNode } from 'react';
import { ArrowDown } from 'lucide-react';

interface MermaidNode {
  id: string;
  title: string;
  subtitle?: string;
  tone: 'info' | 'warn' | 'danger' | 'muted' | 'neutral';
  edgeLabel?: string;
}

const toneClasses: Record<MermaidNode['tone'], string> = {
  info: 'border-zinc-500/80 bg-[#151412] text-zinc-100',
  warn: 'border-zinc-400/70 bg-[#181614] text-zinc-100',
  danger: 'border-zinc-200/85 bg-[#1b1716] text-zinc-50',
  muted: 'border-zinc-700/70 border-dashed bg-[#121211] text-zinc-400',
  neutral: 'border-zinc-500/75 bg-[#151412] text-zinc-100',
};

function stripQuotes(raw: string): string {
  const trimmed = raw.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseTone(rawClass?: string): MermaidNode['tone'] {
  if (rawClass === 'info' || rawClass === 'warn' || rawClass === 'danger' || rawClass === 'muted') {
    return rawClass;
  }
  return 'neutral';
}

function parseNodeToken(token: string, existing: Map<string, MermaidNode>): string {
  const match = token.trim().match(/^([A-Za-z0-9_-]+)(?:\[([\s\S]+)\])?(?::::([a-z]+))?$/);
  if (!match) {
    return token.trim();
  }
  const [, id, bracketText, classHint] = match;
  if (!existing.has(id) || bracketText) {
    const clean = bracketText ? stripQuotes(bracketText) : id;
    const parts = clean.split(/<br\s*\/?>|\s+::\s+|\n/);
    const title = (parts[0] ?? id).trim();
    const subtitle = parts.slice(1).join(' · ').trim() || undefined;
    const prev = existing.get(id);
    existing.set(id, {
      id,
      title,
      subtitle: subtitle ?? prev?.subtitle,
      tone: classHint ? parseTone(classHint) : (prev?.tone ?? 'neutral'),
      edgeLabel: prev?.edgeLabel,
    });
  } else if (classHint) {
    const prev = existing.get(id)!;
    prev.tone = parseTone(classHint);
  }
  return id;
}

interface ParsedFlow {
  direction: 'TD' | 'LR';
  title?: string;
  nodes: MermaidNode[];
}

function parseMermaidFlow(chart: string): ParsedFlow | null {
  const lines = chart
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('classDef'));

  if (!lines.length) return null;

  let title: string | undefined;
  let startIdx = 0;
  if (lines[0].startsWith('%%')) {
    title = lines[0].replace(/^%%+\s*/, '').trim();
    startIdx = 1;
  }

  const header = lines[startIdx] ?? '';
  const headerMatch = header.match(/^(?:flowchart|graph)\s+(TD|TB|LR)$/i);
  if (!headerMatch) return null;

  const direction = headerMatch[1].toUpperCase() === 'LR' ? 'LR' : 'TD';
  const nodeMap = new Map<string, MermaidNode>();
  const orderedIds: string[] = [];

  const register = (id: string) => {
    if (!orderedIds.includes(id)) orderedIds.push(id);
  };

  for (let i = startIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('%%')) continue;

    const edgeMatch = line.match(/^(.+?)\s*(?:--+>|-\.-+>)(?:\|([^|]+)\|)?\s*(.+)$/);
    if (edgeMatch) {
      const [, leftRaw, edgeLabel, rightRaw] = edgeMatch;
      const leftId = parseNodeToken(leftRaw, nodeMap);
      register(leftId);
      const rightId = parseNodeToken(rightRaw, nodeMap);
      register(rightId);
      const rightNode = nodeMap.get(rightId);
      if (rightNode && edgeLabel && !rightNode.edgeLabel) {
        rightNode.edgeLabel = edgeLabel.trim();
      }
      continue;
    }

    const soloId = parseNodeToken(line, nodeMap);
    if (nodeMap.has(soloId)) register(soloId);
  }

  const nodes = orderedIds
    .map((id) => nodeMap.get(id))
    .filter((node): node is MermaidNode => Boolean(node));

  return nodes.length > 0 ? { direction, title, nodes } : null;
}

function chunkRows(nodes: MermaidNode[], size = 3): MermaidNode[][] {
  const rows: MermaidNode[][] = [];
  for (let i = 0; i < nodes.length; i += size) {
    rows.push(nodes.slice(i, i + size));
  }
  return rows;
}

export default function MermaidDiagram({
  chart,
  fallback,
}: {
  chart: string;
  fallback?: ReactNode;
}) {
  const parsed = parseMermaidFlow(chart);
  if (!parsed) {
    return (
      <figure className="not-prose my-6 rounded border border-border/50 bg-[#141210] p-4 font-mono text-xs text-muted">
        {fallback ?? <pre className="overflow-x-auto">{chart}</pre>}
      </figure>
    );
  }

  const rows = chunkRows(parsed.nodes, 3);

  return (
    <figure
      className="not-prose my-8 rounded-md border border-zinc-800/80 bg-[#141210] px-4 py-6 sm:px-6 sm:py-7"
      aria-label={parsed.title ?? 'Exploit chain and technical architecture diagram'}
    >
      {parsed.title ? (
        <figcaption className="mb-5 text-center font-mono text-sm tracking-wide text-zinc-200">
          {parsed.title}
        </figcaption>
      ) : null}

      {/* Mobile vertical stack */}
      <ol className="m-0 flex list-none flex-col items-stretch gap-2 p-0 md:hidden">
        {parsed.nodes.map((node, index) => (
          <li key={node.id} className="flex flex-col items-center gap-1.5">
            <div className={`w-full border px-4 py-3 text-center ${toneClasses[node.tone]}`}>
              <div className="font-mono text-xs font-medium text-zinc-100">{node.title}</div>
              {node.subtitle ? (
                <div className="mt-1 font-mono text-[11px] text-zinc-400">{node.subtitle}</div>
              ) : null}
            </div>
            {index < parsed.nodes.length - 1 ? (
              <ArrowDown aria-hidden="true" className="size-3.5 text-zinc-400" />
            ) : null}
          </li>
        ))}
      </ol>

      {/* Desktop 3-column razor-sharp snake grid */}
      <div className="hidden md:block">
        {rows.map((row, rowIdx) => {
          const isThree = row.length === 3;
          const isTwo = row.length === 2;
          return (
            <div key={rowIdx}>
              <div
                className={`grid items-stretch ${
                  isThree
                    ? 'grid-cols-[1fr_28px_1fr_28px_1fr]'
                    : isTwo
                      ? 'mx-auto max-w-[66.6%] grid-cols-[1fr_28px_1fr]'
                      : 'mx-auto max-w-[33.3%] grid-cols-1'
                }`}
              >
                {row.map((node, colIdx) => (
                  <div key={node.id} className="contents">
                    <div
                      className={`flex min-h-[72px] flex-col items-center justify-center border px-3 py-2.5 text-center ${toneClasses[node.tone]}`}
                    >
                      <div className="font-mono text-[13px] font-medium leading-snug text-zinc-100">
                        {node.title}
                      </div>
                      {node.subtitle ? (
                        <div className="mt-1 font-mono text-[11.5px] leading-snug text-zinc-400">
                          {node.subtitle}
                        </div>
                      ) : null}
                    </div>
                    {colIdx < row.length - 1 ? (
                      <div className="flex items-center justify-center" aria-hidden="true">
                        <svg viewBox="0 0 28 14" className="h-3.5 w-7 text-zinc-400">
                          <line x1="2" y1="7" x2="23" y2="7" stroke="currentColor" strokeWidth="1.1" />
                          <path d="M 19 3.5 L 24 7 L 19 10.5" fill="none" stroke="currentColor" strokeWidth="1.1" />
                        </svg>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>

              {rowIdx < rows.length - 1 ? (
                <div className="h-9 w-full" aria-hidden="true">
                  <svg viewBox="0 0 900 36" preserveAspectRatio="none" className="h-full w-full text-zinc-400">
                    {/* Drop down from rightmost card center (~755) across to leftmost card center (~145) */}
                    <path
                      d="M 755 0 L 755 18 L 145 18 L 145 34"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.1"
                      vectorEffect="non-scaling-stroke"
                    />
                    <path
                      d="M 140 29 L 145 35 L 150 29"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.1"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </figure>
  );
}
