import type { ReactNode } from 'react';
import { ArrowDown, ArrowRight } from 'lucide-react';

interface MermaidNode {
  id: string;
  title: string;
  subtitle?: string;
  tone: 'info' | 'warn' | 'danger' | 'muted' | 'neutral';
  edgeLabel?: string;
}

const toneClasses: Record<MermaidNode['tone'], string> = {
  info: 'border-sky-500/45 bg-sky-950/20 text-sky-100',
  warn: 'border-amber-500/45 bg-amber-950/20 text-amber-100',
  danger: 'border-rose-500/50 bg-rose-950/25 text-rose-100',
  muted: 'border-border/50 bg-surface/60 text-muted',
  neutral: 'border-border/60 bg-surface/80 text-foreground',
};

const badgeClasses: Record<MermaidNode['tone'], string> = {
  info: 'text-sky-400',
  warn: 'text-amber-400',
  danger: 'text-rose-400',
  muted: 'text-subtle',
  neutral: 'text-accent',
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

    // Handle edge expressions like: A[..]:::info -->|label| B[..]:::danger or D -.-> E[..]
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
      <figure className="not-prose my-6 rounded-xl border border-border/50 bg-surface/80 p-4 font-mono text-xs text-muted">
        {fallback ?? <pre className="overflow-x-auto">{chart}</pre>}
      </figure>
    );
  }

  const isHorizontal = parsed.direction === 'LR';

  return (
    <figure
      className="not-prose my-8 rounded-xl border border-border/50 bg-[#0d1014]/90 p-5 sm:p-6"
      aria-label={parsed.title ?? 'Architecture and exploit chain diagram'}
    >
      {parsed.title ? (
        <figcaption className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">
          {parsed.title}
        </figcaption>
      ) : null}

      {isHorizontal ? (
        <ol className="m-0 flex list-none flex-col items-stretch gap-2 p-0 md:flex-row md:flex-wrap md:items-center md:gap-3">
          {parsed.nodes.map((node, index) => (
            <li key={node.id} className="flex flex-col items-center gap-2 md:flex-row md:gap-3">
              <div
                className={`w-full rounded-lg border px-4 py-3 transition-colors md:w-auto md:min-w-[155px] ${toneClasses[node.tone]}`}
              >
                <div className={`font-mono text-[11px] uppercase tracking-wider ${badgeClasses[node.tone]}`}>
                  Step {index + 1}
                </div>
                <div className="mt-0.5 text-sm font-medium leading-snug">{node.title}</div>
                {node.subtitle ? (
                  <div className="mt-1 font-mono text-[11px] leading-snug opacity-80">
                    {node.subtitle}
                  </div>
                ) : null}
              </div>
              {index < parsed.nodes.length - 1 ? (
                <span className="flex items-center justify-center text-subtle" aria-hidden="true">
                  <ArrowDown className="size-4 md:hidden" />
                  <ArrowRight className="hidden size-4 md:block" />
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      ) : (
        <ol className="m-0 mx-auto flex max-w-2xl list-none flex-col items-center gap-1.5 p-0">
          {parsed.nodes.map((node, index) => (
            <li key={node.id} className="flex w-full flex-col items-center">
              {index > 0 ? (
                <div className="flex flex-col items-center py-1 text-subtle" aria-hidden="true">
                  {node.edgeLabel ? (
                    <span className="mb-1 rounded border border-border/40 bg-surface px-2 py-0.5 font-mono text-[10px] text-muted">
                      {node.edgeLabel}
                    </span>
                  ) : null}
                  <ArrowDown className="size-3.5" />
                </div>
              ) : null}
              <div
                className={`w-full rounded-lg border px-4 py-3 text-center transition-colors ${toneClasses[node.tone]}`}
              >
                <div className="text-sm font-medium leading-snug">{node.title}</div>
                {node.subtitle ? (
                  <div className="mt-1 font-mono text-xs leading-snug opacity-80">
                    {node.subtitle}
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      )}
    </figure>
  );
}
