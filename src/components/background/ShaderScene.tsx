'use client';

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { atmosphereVertexShader } from './shaders/atmosphere.vert';
import { atmosphereFragmentShader } from './shaders/atmosphere.frag';

interface ShaderSceneProps {
  mouseRef: React.RefObject<{ x: number; y: number }>;
  scrollRef: React.RefObject<number>;
  isReducedMotion: boolean;
}

export default function ShaderScene({
  mouseRef,
  scrollRef,
  isReducedMotion,
}: ShaderSceneProps) {
  const { size } = useThree();
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Smooth interaction trackers in Three.js objects
  const smoothMouse = useRef(new THREE.Vector2(0.5, 0.5));
  const smoothScroll = useRef(0);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uScroll: { value: 0 },
      uReducedMotion: { value: isReducedMotion ? 1.0 : 0.0 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useFrame((_, delta) => {
    if (!materialRef.current) return;

    const mat = materialRef.current;

    // Update viewport resolution
    mat.uniforms.uResolution.value.set(size.width, size.height);

    // Advance time smoothly (slowed significantly if prefers-reduced-motion)
    const timeDelta = isReducedMotion ? delta * 0.02 : delta * 0.35;
    mat.uniforms.uTime.value += timeDelta;

    // Smooth cursor interpolation
    if (mouseRef.current) {
      const targetX = mouseRef.current.x;
      const targetY = mouseRef.current.y;
      smoothMouse.current.x += (targetX - smoothMouse.current.x) * 0.05;
      smoothMouse.current.y += (targetY - smoothMouse.current.y) * 0.05;
      mat.uniforms.uMouse.value.copy(smoothMouse.current);
    }

    // Smooth scroll interpolation
    if (scrollRef.current !== undefined && scrollRef.current !== null) {
      const targetScroll = scrollRef.current;
      smoothScroll.current += (targetScroll - smoothScroll.current) * 0.05;
      mat.uniforms.uScroll.value = smoothScroll.current;
    }

    mat.uniforms.uReducedMotion.value = isReducedMotion ? 1.0 : 0.0;
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={atmosphereVertexShader}
        fragmentShader={atmosphereFragmentShader}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
        transparent={true}
      />
    </mesh>
  );
}
