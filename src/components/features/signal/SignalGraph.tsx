'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  ForceGraphMethods,
  LinkObject,
  NodeObject,
} from 'react-force-graph-2d';
import type { SignalDayType } from '@/lib/signal/schemas';
import SignalFallback from './SignalFallback';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
});

type SignalNode = SignalDayType['nodes'][number];
type GraphNode = SignalNode & NodeObject & { val: number };
type GraphLink = LinkObject<GraphNode> & {
  source: string | GraphNode;
  target: string | GraphNode;
};

interface SignalGraphProps {
  data: SignalDayType;
  className?: string;
  compact?: boolean;
  openLinksOnClick?: boolean;
  onNodeSelect?: (node: SignalNode | null) => void;
}

const endpointId = (endpoint: string | GraphNode) =>
  typeof endpoint === 'string' ? endpoint : String(endpoint.id);

export default function SignalGraph({
  data,
  className = '',
  compact = false,
  openLinksOnClick = false,
  onNodeSelect,
}: SignalGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<ForceGraphMethods | undefined>(undefined);
  const hasFit = useRef(false);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const { graphData, neighbours } = useMemo(() => {
    const nodes: GraphNode[] = data.nodes.map((node) => ({
      ...node,
      val: node.r,
    }));
    const links: GraphLink[] = [];
    const adjacent = new Map(nodes.map((node) => [node.id, new Set<string>()]));
    const connect = (source: GraphNode, target: GraphNode) => {
      links.push({ source: source.id, target: target.id });
      adjacent.get(source.id)?.add(target.id);
      adjacent.get(target.id)?.add(source.id);
    };

    for (let index = 0; index < nodes.length; index += 1) {
      for (
        let candidate = index + 1;
        candidate < nodes.length;
        candidate += 1
      ) {
        if (
          nodes[index].category === nodes[candidate].category ||
          nodes[index].source === nodes[candidate].source
        ) {
          connect(nodes[index], nodes[candidate]);
        }
      }
    }

    if (links.length === 0 && nodes.length > 1) {
      for (let index = 1; index < nodes.length; index += 1)
        connect(nodes[0], nodes[index]);
    }

    return { graphData: { nodes, links }, neighbours: adjacent };
  }, [data]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const resize = () => {
      const bounds = container.getBoundingClientRect();
      setSize({
        width: Math.max(1, Math.floor(bounds.width)),
        height: Math.max(1, Math.floor(bounds.height)),
      });
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const graph = graphRef.current;
    graph
      ?.d3Force('charge')
      ?.strength(compact ? -100 : -180)
      .distanceMax(420);
    graph?.d3Force('link')?.distance(compact ? 68 : 105);
    graph?.d3ReheatSimulation();
  }, [compact, size.width]);

  useEffect(
    () => () => {
      document.body.style.cursor = '';
    },
    []
  );

  const activeId = hoveredId ?? selectedId;
  const isFocused = useCallback(
    (id: string) =>
      !activeId ||
      id === activeId ||
      neighbours.get(activeId)?.has(id) === true,
    [activeId, neighbours]
  );

  const handleNodeClick = useCallback(
    (node: NodeObject) => {
      const graphNode = node as GraphNode;
      if (openLinksOnClick && graphNode.url) {
        window.open(graphNode.url, '_blank', 'noopener,noreferrer');
        return;
      }
      const next = selectedId === graphNode.id ? null : graphNode.id;
      setSelectedId(next);
      onNodeSelect?.(
        next ? (data.nodes.find((item) => item.id === next) ?? null) : null
      );
    },
    [data.nodes, onNodeSelect, openLinksOnClick, selectedId]
  );

  const handleBackgroundClick = useCallback(() => {
    setSelectedId(null);
    onNodeSelect?.(null);
  }, [onNodeSelect]);

  const handleNodeHover = useCallback((node: NodeObject | null) => {
    setHoveredId(node ? String(node.id) : null);
    document.body.style.cursor = node ? 'pointer' : '';
  }, []);

  const handleNodeDragEnd = useCallback((node: NodeObject) => {
    node.fx = undefined;
    node.fy = undefined;
    graphRef.current?.d3ReheatSimulation();
  }, []);

  const paintNode = useCallback(
    (node: NodeObject, context: CanvasRenderingContext2D, scale: number) => {
      const graphNode = node as GraphNode;
      if (typeof graphNode.x !== 'number' || typeof graphNode.y !== 'number')
        return;
      const focused = isFocused(graphNode.id);
      const active = graphNode.id === activeId;
      const radius = Math.max(
        graphNode.val * (compact ? 0.82 : 1.05),
        compact ? 3 : 4
      );
      const limit = compact ? 28 : 48;
      const label =
        graphNode.title.length > limit
          ? `${graphNode.title.slice(0, limit - 1)}…`
          : graphNode.title;

      context.beginPath();
      context.arc(
        graphNode.x,
        graphNode.y,
        radius + (active ? 1.5 : 0),
        0,
        Math.PI * 2
      );
      context.fillStyle = active
        ? '#d4d4d8'
        : focused
          ? '#71717a'
          : 'rgba(82, 82, 91, 0.18)';
      context.fill();

      context.font = `${(compact ? 10 : 11) / scale}px Inter, ui-sans-serif, sans-serif`;
      context.textAlign = 'left';
      context.textBaseline = 'middle';
      context.fillStyle = active
        ? '#f4f4f5'
        : focused
          ? 'rgba(212, 212, 216, 0.78)'
          : 'rgba(113, 113, 122, 0.2)';
      context.fillText(label, graphNode.x + radius + 3 / scale, graphNode.y);
    },
    [activeId, compact, isFocused]
  );

  const paintPointerArea = useCallback(
    (node: NodeObject, color: string, context: CanvasRenderingContext2D) => {
      const graphNode = node as GraphNode;
      if (typeof graphNode.x !== 'number' || typeof graphNode.y !== 'number')
        return;
      context.fillStyle = color;
      context.beginPath();
      context.arc(
        graphNode.x,
        graphNode.y,
        Math.max(graphNode.val, 4) + 6,
        0,
        Math.PI * 2
      );
      context.fill();
    },
    []
  );

  const paintLink = useCallback(
    (link: LinkObject, context: CanvasRenderingContext2D) => {
      const graphLink = link as GraphLink;
      const source = graphLink.source as GraphNode;
      const target = graphLink.target as GraphNode;
      if (
        typeof source.x !== 'number' ||
        typeof source.y !== 'number' ||
        typeof target.x !== 'number' ||
        typeof target.y !== 'number'
      )
        return;
      const focused =
        !activeId ||
        endpointId(graphLink.source) === activeId ||
        endpointId(graphLink.target) === activeId;
      context.beginPath();
      context.moveTo(source.x, source.y);
      context.lineTo(target.x, target.y);
      context.strokeStyle = focused
        ? 'rgba(161, 161, 170, 0.34)'
        : 'rgba(82, 82, 91, 0.08)';
      context.lineWidth = compact ? 0.55 : 0.7;
      context.stroke();
    },
    [activeId, compact]
  );

  const fitGraph = useCallback(() => {
    if (hasFit.current) return;
    hasFit.current = true;
    graphRef.current?.zoomToFit(500, compact ? 38 : 90);
  }, [compact]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      <SignalFallback data={data} />
      {size.width > 0 && size.height > 0 && (
        <div className="absolute inset-0" aria-hidden="true">
          <ForceGraph2D
            ref={graphRef}
            width={size.width}
            height={size.height}
            backgroundColor="rgba(0, 0, 0, 0)"
            graphData={graphData}
            nodeCanvasObject={paintNode}
            nodePointerAreaPaint={paintPointerArea}
            linkCanvasObject={paintLink}
            onNodeClick={handleNodeClick}
            onBackgroundClick={handleBackgroundClick}
            onNodeHover={handleNodeHover}
            onNodeDragEnd={handleNodeDragEnd}
            onEngineStop={fitGraph}
            enableNodeDrag
            enablePanInteraction
            enableZoomInteraction
            d3AlphaDecay={0.025}
            d3VelocityDecay={0.35}
            warmupTicks={compact ? 20 : 40}
            cooldownTicks={140}
          />
        </div>
      )}
    </div>
  );
}
