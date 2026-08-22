'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { ForceGraphMethods, NodeObject, LinkObject } from 'react-force-graph-2d';
import { SignalDayType } from '@/lib/signal/schemas';
import SignalFallback from './SignalFallback';
import SignalDetailPanel from './SignalDetailPanel';

// Dynamically import ForceGraph2D as it requires the window object
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

interface SignalExperienceProps {
  data: SignalDayType;
}

export type GraphNode = {
  id: string;
  title: string;
  category: string;
  source: string;
  x?: number;
  y?: number;
  fx?: number | undefined;
  fy?: number | undefined;
  val?: number;
  isDragged?: boolean;
};

export type GraphLink = {
  source: GraphNode;
  target: GraphNode;
};

export default function SignalExperience({ data }: SignalExperienceProps) {
  const graphRef = useRef<ForceGraphMethods | undefined>(undefined);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Parse data for react-force-graph
  const graphData = useMemo(() => {
    const nodes = data.nodes.map(n => ({
      ...n,
      // react-force-graph uses x/y for initial placement if provided
      x: n.x,
      y: n.y,
      val: n.r // We can use this as a base sizing metric
    }));

    // Synthesize subtle connections for the force graph based on relationships
    const links: { source: string; target: string }[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        // Connect nodes sharing category or source
        if (nodes[i].category === nodes[j].category || nodes[i].source === nodes[j].source) {
          links.push({ source: nodes[i].id, target: nodes[j].id });
        }
      }
    }

    // Ensure the graph isn't entirely disconnected so the constellation remains cohesive
    if (links.length === 0 && nodes.length > 1) {
      for (let i = 1; i < nodes.length; i++) {
        links.push({ source: nodes[0].id, target: nodes[i].id });
      }
    }

    return { nodes, links };
  }, [data]);

  // Configure standard physics engine parameters once
  useEffect(() => {
    if (graphRef.current) {
      const chargeForce = graphRef.current.d3Force('charge');
      if (chargeForce) {
        // Gentle, subtle repulsion for small node counts
        chargeForce.strength(-250);
        chargeForce.distanceMax(500);
      }
      
      const linkForce = graphRef.current.d3Force('link');
      if (linkForce) {
        linkForce.distance(120); // Slightly tighter natural spring
      }
    }
  }, []);

  // Handle pinning for selected nodes and resuming activity when deselected
  useEffect(() => {
    if (graphRef.current) {
      graphData.nodes.forEach((n: GraphNode) => {
        if (n.id === selectedId) {
          // Pin the selected node so it stays static
          n.fx = n.x;
          n.fy = n.y;
        } else if (!n.isDragged) {
          // Unpin non-selected nodes (unless explicitly dragged by the user)
          n.fx = undefined;
          n.fy = undefined;
        }
      });
      // Always reheat the simulation on selection changes to resume/adjust activity
      graphRef.current.d3ReheatSimulation();
    }
  }, [selectedId, graphData.nodes]);

  const handleNodeClick = useCallback((node: NodeObject) => {
    const n = node as GraphNode;
    setSelectedId(prev => prev === n.id ? null : n.id);
  }, []);

  const handleBackgroundClick = useCallback(() => {
    setSelectedId(null);
  }, []);

  const handleNodeHover = useCallback((node: NodeObject | null) => {
    const n = node as GraphNode | null;
    setHoveredId(n ? n.id : null);
    // Change cursor on hover
    document.body.style.cursor = n ? 'pointer' : 'default';
  }, []);

  const handleNodeDragEnd = useCallback((node: NodeObject) => {
    const n = node as GraphNode;
    // Pin the node at the location where it was dropped and mark it as explicitly dragged
    n.fx = n.x;
    n.fy = n.y;
    n.isDragged = true;
  }, []);

  const activeNodeId = selectedId || hoveredId;
  const activeNode = activeNodeId ? data.nodes.find(n => n.id === activeNodeId) || null : null;

  // Custom node rendering on Canvas
  const paintNode = useCallback((node: NodeObject, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const n = node as GraphNode;
    if (typeof n.x !== 'number' || typeof n.y !== 'number') return;
    
    const isSelected = selectedId === n.id;
    const isHovered = hoveredId === n.id;
    const isActive = isSelected || isHovered;
    const isDimmed = !!activeNodeId && !isActive;

    const baseRadius = Math.max((n.val || 2) * 1.5, 4);
    const radius = baseRadius + (isActive ? 2 : 0);

    ctx.beginPath();
    ctx.arc(n.x, n.y, radius, 0, 2 * Math.PI, false);
    
    // Muted steel/zinc tones mapping to Tailwind zinc-400 (#a1a1aa) and zinc-600 (#52525b)
    ctx.fillStyle = isActive ? '#a1a1aa' : isDimmed ? 'rgba(82, 82, 91, 0.3)' : '#52525b';
    ctx.fill();

    // Outer glow for active nodes
    if (isActive) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, radius + 4, 0, 2 * Math.PI, false);
      ctx.strokeStyle = 'rgba(161, 161, 170, 0.4)';
      ctx.lineWidth = 1 / globalScale; // Keep line thin regardless of zoom
      ctx.stroke();
    }
    
    // Optional: Draw text label if zoomed in closely or active
    if (globalScale > 1.5 || isActive) {
      const fontSize = 12 / globalScale;
      ctx.font = `${fontSize}px Inter, sans-serif`;
      ctx.fillStyle = isActive ? '#e4e4e7' : 'rgba(161, 161, 170, 0.8)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(n.title, n.x, n.y + radius + (8 / globalScale));
    }
  }, [selectedId, hoveredId, activeNodeId]);

  // Custom link rendering
  const paintLink = useCallback((link: LinkObject, ctx: CanvasRenderingContext2D) => {
    const l = link as unknown as GraphLink;
    if (typeof l.source.x !== 'number' || typeof l.source.y !== 'number' || typeof l.target.x !== 'number' || typeof l.target.y !== 'number') return;
    
    ctx.beginPath();
    ctx.moveTo(l.source.x, l.source.y);
    ctx.lineTo(l.target.x, l.target.y);
    ctx.strokeStyle = 'rgba(82, 82, 91, 0.2)'; // Very subtle
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }, []);

  return (
    <section className="relative w-full h-screen min-h-[600px] overflow-hidden bg-transparent">
      
      {/* Semantic Accessible Fallback (DOM Layer) */}
      <SignalFallback data={data} />

      {/* Interactive Visual Canvas Layer */}
      <div className="absolute inset-0" aria-hidden="true">
        <ForceGraph2D
          ref={graphRef}
          graphData={graphData}
          nodeCanvasObject={paintNode}
          linkCanvasObject={paintLink}
          onNodeClick={handleNodeClick}
          onBackgroundClick={handleBackgroundClick}
          onNodeHover={handleNodeHover}
          onNodeDragEnd={handleNodeDragEnd}
          d3AlphaDecay={0.01} // Very slow decay so it stays "alive" longer
          d3VelocityDecay={0.15} // Low friction for continuous smooth floating
        />
      </div>

      {/* Floating Detail Panel Layer */}
      <SignalDetailPanel 
        node={activeNode} 
        onClose={() => setSelectedId(null)} 
      />
      
      {/* Subtle Date Marker */}
      <div className="absolute top-24 left-6 md:left-12 pointer-events-none z-10">
        <h1 className="text-3xl font-bold font-sans tracking-tight text-brand-neutral-100 mb-1">
          The Signal
        </h1>
        <p className="text-brand-neutral-400 font-mono text-xs tracking-widest uppercase">
          {data.date} :: {data.seed}
        </p>
      </div>

    </section>
  );
}
