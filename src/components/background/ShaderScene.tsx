'use client';

/**
 * ShaderScene — R3F scene rendered inside ShaderBackground's Canvas.
 *
 * Uses a fullscreen quad with an orthographic camera.
 * The vertex shader bypasses the MVP transform (NDC clip-space trick),
 * so frustumCulled must be false to prevent incorrect culling.
 */

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

  const smoothMouse = useRef(new THREE.Vector2(0.5, 0.5));
  const smoothScroll = useRef(0);

  const uniforms = useMemo(
    () => ({
      uTime:         { value: 0.0 },
      uResolution:   { value: new THREE.Vector2(size.width, size.height) },
      uMouse:        { value: new THREE.Vector2(0.5, 0.5) },
      uScroll:       { value: 0.0 },
      uReducedMotion:{ value: isReducedMotion ? 1.0 : 0.0 },
    }),
    // Intentionally empty — uniforms are mutated each frame, not rebuilt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useFrame((_, delta) => {
    const mat = materialRef.current;
    if (!mat) return;

    mat.uniforms.uResolution.value.set(size.width, size.height);

    const timeDelta = isReducedMotion ? delta * 0.02 : delta * 0.35;
    mat.uniforms.uTime.value += timeDelta;

    if (mouseRef.current) {
      const { x, y } = mouseRef.current;
      smoothMouse.current.x += (x - smoothMouse.current.x) * 0.04;
      smoothMouse.current.y += (y - smoothMouse.current.y) * 0.04;
      mat.uniforms.uMouse.value.copy(smoothMouse.current);
    }

    if (scrollRef.current != null) {
      smoothScroll.current += (scrollRef.current - smoothScroll.current) * 0.04;
      mat.uniforms.uScroll.value = smoothScroll.current;
    }

    mat.uniforms.uReducedMotion.value = isReducedMotion ? 1.0 : 0.0;
  });

  return (
    /*
      Position: default (0,0,0).
      frustumCulled={false} is REQUIRED when the vertex shader bypasses the
      MVP matrix — otherwise Three.js may incorrectly cull the mesh before
      the shader even runs.
    */
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={atmosphereVertexShader}
        fragmentShader={atmosphereFragmentShader}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}
