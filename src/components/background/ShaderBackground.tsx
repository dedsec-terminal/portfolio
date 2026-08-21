'use client';

/**
 * ShaderBackground — Page-level R3F procedural atmosphere.
 *
 * Mounting strategy: Both mount detection and reduced-motion use
 * `useSyncExternalStore` with proper server/client snapshots.
 * This is the React-recommended pattern for SSR-safe client-only state,
 * and passes the react-hooks/set-state-in-effect lint rule.
 *
 * Canvas: alpha=false (opaque), orthographic camera, z-0 fixed.
 * Content layer: z-10 via page.tsx wrapper.
 */

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { Canvas } from '@react-three/fiber';
import ShaderScene from './ShaderScene';

// ── Mount detection (server → false, client → true) ───────────────────
// useSyncExternalStore triggers a synchronous client re-render when
// server and client snapshots differ. The empty subscribe is intentional:
// this store never changes after hydration.
const noop = () => () => {};
function useIsMounted() {
  return useSyncExternalStore(noop, () => true, () => false);
}

// ── Reduced-motion (server → false, client → matchMedia result) ───────
function useReducedMotion() {
  return useSyncExternalStore(
    (cb) => {
      if (typeof window === 'undefined') return () => {};
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      mq.addEventListener('change', cb);
      return () => mq.removeEventListener('change', cb);
    },
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false  // server snapshot
  );
}

export default function ShaderBackground() {
  const mounted = useIsMounted();
  const isReducedMotion = useReducedMotion();

  const mouseRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const scrollRef = useRef<number>(0);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      mouseRef.current = {
        x: Math.max(0, Math.min(1, e.clientX / w)),
        y: Math.max(0, Math.min(1, 1.0 - e.clientY / h)),
      };
    };

    const onScroll = () => { scrollRef.current = window.scrollY; };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  /* SSR / pre-hydration: flat background div — no layout shift, no mismatch. */
  if (!mounted) {
    return (
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          pointerEvents: 'none',
          backgroundColor: '#09090b',
        }}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <Canvas
        gl={{
          alpha: false,           // opaque; no CSS compositing needed
          antialias: false,       // fullscreen quad — MSAA is wasted cost
          powerPreference: 'high-performance',
          depth: false,
          stencil: false,
        }}
        dpr={[1, Math.min(2, window.devicePixelRatio ?? 1)]}
        orthographic
        camera={{ position: [0, 0, 1], near: 0.1, far: 10, zoom: 1 }}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      >
        <ShaderScene
          mouseRef={mouseRef}
          scrollRef={scrollRef}
          isReducedMotion={isReducedMotion}
        />
      </Canvas>
    </div>
  );
}
