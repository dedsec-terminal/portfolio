'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { Canvas } from '@react-three/fiber';
import ShaderScene from './ShaderScene';

const emptySubscribe = () => () => {};

function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

function useReducedMotion() {
  return useSyncExternalStore(
    (callback) => {
      if (typeof window === 'undefined') return () => {};
      const query = window.matchMedia('(prefers-reduced-motion: reduce)');
      query.addEventListener('change', callback);
      return () => query.removeEventListener('change', callback);
    },
    () => {
      if (typeof window === 'undefined') return false;
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },
    () => false
  );
}

export default function ShaderBackground() {
  const mounted = useIsMounted();
  const isReducedMotion = useReducedMotion();

  const mouseRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const scrollRef = useRef<number>(0);

  useEffect(() => {
    // Window mouse tracking for smooth non-blocking cursor reaction
    const onMouseMove = (e: MouseEvent) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      mouseRef.current = {
        x: Math.max(0, Math.min(1, e.clientX / w)),
        y: Math.max(0, Math.min(1, 1.0 - e.clientY / h)), // Inverted for WebGL UV space
      };
    };

    // Window scroll tracking
    const onScroll = () => {
      scrollRef.current = window.scrollY;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  if (!mounted) {
    return (
      <div
        aria-hidden="true"
        className="fixed inset-0 w-full h-full pointer-events-none z-0 bg-background"
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
      }}
    >
      <Canvas
        gl={{
          alpha: true,
          antialias: false,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
        camera={{ position: [0, 0, 1] }}
        style={{
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
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
